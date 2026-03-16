<template>
  <div class="ai-chat-dialog">
    <el-dialog
      :visible.sync="showDialog"
      :show-close="false"
      :modal="true"
      :close-on-click-modal="false"
      custom-class="ag-dialog-ai ag-dialog-ai-chat"
      width="640px"
      @close="handleClose"
    >
      <div slot="title" class="ai-dialog-title">
        <div class="ai-title-left">
          <button class="ai-back" @click="handleClose">
            <i class="el-icon-arrow-left"></i>
          </button>
          <span class="ai-title">{{ $t('AI Chat') }}</span>
        </div>
        <div class="ai-title-right">
          <el-checkbox v-model="ragEnabled">{{ $t('RAG Local Notes') }}</el-checkbox>
          <el-checkbox v-model="memoryEnabled">{{ $t('Context Memory') }}</el-checkbox>
          <button class="ai-save" type="button" @click="handleSaveFullChat">
            <i class="el-icon-document"></i>
          </button>
        </div>
      </div>
      <div class="ai-dialog-body ai-chat-body">
        <div ref="aiChatList" class="ai-chat-list">
          <div
            v-for="message in aiChatMessages"
            :key="message.id"
            class="ai-chat-message"
            :class="message.role"
          >
            <div class="ai-chat-avatar">
              {{ message.role === 'assistant' ? $t('AI') : $t('You') }}
            </div>
            <div class="ai-chat-bubble">
              <div class="ai-chat-content" v-html="message.html"></div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="ai-chat-footer">
        <div class="ai-chat-input-wrapper">
          <textarea
            v-model="aiChatInput"
            class="ai-chat-input"
            :placeholder="$t('Type a message')"
            @keydown.enter.exact.prevent="handleChatSend"
          ></textarea>
        </div>
        <div class="ai-chat-actions">
          <el-button v-if="aiGenerating" type="primary" @click="handlePause">{{ $t('Pause') }}</el-button>
          <el-button v-else type="primary" :disabled="!aiChatInputTrimmed" @click="handleChatSend">{{ $t('Send') }}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import bus from '@/bus'
import notice from '@/services/notification'
import markdownToHtml from '@/util/markdownToHtml'
import { callExternalLlmStream } from '@/../main/ai/langchain/rag/core/llm'
// import { ensureRagIndex, getRagContext } from '@/../main/ai/langchain/rag/core/rag-llm'
import dayjs from 'dayjs'
import path from 'path'
import { dialog } from '@electron/remote'
import fs from 'fs-extra'

export default {
  data () {
    return {
      showDialog: false,
      aiChatMessages: [],
      aiChatInput: '',
      aiChatMessageId: 0,
      aiChatActiveMessageId: null,
      aiChatRenderTimer: null,
      aiChatRenderVersion: 0,
      aiChatMemory: [],
      aiGenerating: false,
      aiStream: null,
      aiStreamCancel: null,
      aiStreamBuffer: '',
      aiStreamFinished: false,
      aiStreamHandlers: null,
      ragEnabled: false,
      memoryEnabled: false
    }
  },
  computed: {
    ...mapState({
      provider: state => state.preferences.llmProvider,
      token: state => state.preferences.llmBearerToken,
      ragDefaultEnabled: state => state.preferences.aiRagDefaultEnabled,
      memoryDefaultEnabled: state => state.preferences.aiMemoryDefaultEnabled,
      currentMarkdown: state => state.editor.currentFile.markdown,
      currentFile: state => state.editor.currentFile,
      projectTree: state => state.project.projectTree,
      defaultDirectoryToOpen: state => state.preferences.defaultDirectoryToOpen
    }),
    aiChatInputTrimmed () {
      return (this.aiChatInput || '').trim()
    },
    aiProviderLabel () {
      const labels = {
        deepseek: this.$t('DeepSeek'),
        qwen: this.$t('Qwen'),
        doubao: this.$t('Doubao'),
        yuanbao: this.$t('Yuanbao')
      }
      return labels[this.provider] || this.$t('AI')
    },
    ragRootPath () {
      const projectPath = this.projectTree && this.projectTree.pathname
      return projectPath || this.defaultDirectoryToOpen || ''
    }
  },
  watch: {

    // chenjierag
    // ragRootPath: {
    //   immediate: true,
    //   handler (value) {
    //     if (!value) {
    //       return
    //     }
    //     ensureRagIndex(value).catch(() => {})
    //   }
    // },
    memoryEnabled (value) {
      if (!value) {
        this.aiChatMemory = []
      }
    }
  },
  created () {
    bus.$on('open-ai-sidebar-chat', this.openDialog)
  },
  beforeDestroy () {
    bus.$off('open-ai-sidebar-chat', this.openDialog)
  },
  methods: {
    openDialog () {
      this.resetState()
      this.ragEnabled = !!this.ragDefaultEnabled
      this.memoryEnabled = !!this.memoryDefaultEnabled
      this.showDialog = true
      this.initChatSession()
    },
    handleClose () {
      this.stopGeneration()
      this.resetState()
      this.showDialog = false
    },
    resetState () {
      this.aiChatMessages = []
      this.aiChatInput = ''
      this.aiChatMessageId = 0
      this.aiChatActiveMessageId = null
      this.aiChatRenderVersion = 0
      this.aiChatMemory = []
      this.aiStreamBuffer = ''
      this.aiStreamFinished = false
      if (this.aiChatRenderTimer) {
        clearTimeout(this.aiChatRenderTimer)
        this.aiChatRenderTimer = null
      }
    },
    initChatSession () {
      const greeting = this.createChatMessage('assistant', this.$t('AI Chat Greeting'))
      greeting.isGreeting = true
      this.aiChatMessages.push(greeting)
      this.renderChatMessage(greeting)
      this.$nextTick(this.scrollChatToBottom)
    },
    createChatMessage (role, content) {
      this.aiChatMessageId += 1
      return {
        id: this.aiChatMessageId,
        role,
        content: content || '',
        html: '',
        renderVersion: 0
      }
    },
    async renderChatMessage (message) {
      const version = (message.renderVersion || 0) + 1
      message.renderVersion = version
      const html = await markdownToHtml(message.content || '')
      if (message.renderVersion === version) {
        message.html = html
        this.$nextTick(this.scrollChatToBottom)
      }
    },
    scheduleChatRender (message) {
      if (this.aiChatRenderTimer) {
        return
      }
      const version = this.aiChatRenderVersion
      this.aiChatRenderTimer = setTimeout(async () => {
        this.aiChatRenderTimer = null
        const html = await markdownToHtml(message.content || '')
        message.html = html
        this.$nextTick(this.scrollChatToBottom)
        if (version !== this.aiChatRenderVersion) {
          this.scheduleChatRender(message)
        }
      }, 120)
    },
    appendChatText (text) {
      const message = this.aiChatMessages.find(item => item.id === this.aiChatActiveMessageId)
      if (!message) {
        return
      }
      message.content += text
      this.aiChatRenderVersion += 1
      this.scheduleChatRender(message)
    },
    flushChatRender () {
      if (this.aiChatRenderTimer) {
        clearTimeout(this.aiChatRenderTimer)
        this.aiChatRenderTimer = null
      }
      const message = this.aiChatMessages.find(item => item.id === this.aiChatActiveMessageId)
      if (message) {
        this.renderChatMessage(message)
      }
    },
    scrollChatToBottom () {
      const list = this.$refs.aiChatList
      if (list) {
        list.scrollTop = list.scrollHeight
      }
    },
    async buildSystemPrompt (latestUserContent) {
      // chenjierag
      // if (!this.ragEnabled) {
      //   return 'You are a helpful AI assistant.'
      // }
      // const rootPath = this.ragRootPath
      // if (!rootPath) {
      //   return 'You are a helpful AI assistant.'
      // }
      // const context = await getRagContext({
      //   rootPath,
      //   query: latestUserContent,
      //   k: 2
      // })
      // if (!context) {
      //   return 'You are a helpful AI assistant.'
      // }
      // return `你是一位精通知识的学者，擅长语言与文字表达能力，请根据下面的笔记内容与用户提问进行回答。回答内容要准确、流畅、有逻辑。\n\n相关笔记内容：\n${context}`
      return '你是一位精通知识的学者，擅长语言与文字表达能力，请根据下面的笔记内容与用户提问进行回答。'
    },
    async buildChatMessages (userContent) {
      const systemPrompt = await this.buildSystemPrompt(userContent)
      const system = {
        role: 'system',
        content: systemPrompt
      }
      if (!this.memoryEnabled) {
        return [
          system,
          {
            role: 'user',
            content: userContent
          }
        ]
      }
      return [system, ...this.aiChatMemory]
    },
    handleChatSend () {
      if (this.aiGenerating) {
        return
      }
      const content = this.aiChatInputTrimmed
      if (!content) {
        return
      }
      const userMessage = this.createChatMessage('user', content)
      this.aiChatMessages.push(userMessage)
      this.renderChatMessage(userMessage)
      if (this.memoryEnabled) {
        this.aiChatMemory.push({
          role: 'user',
          content
        })
      }
      const assistantMessage = this.createChatMessage('assistant', '')
      this.aiChatMessages.push(assistantMessage)
      this.aiChatActiveMessageId = assistantMessage.id
      this.aiChatInput = ''
      this.startGeneration(content)
    },
    async startGeneration (latestUserContent) {
      this.aiGenerating = true
      this.aiStreamFinished = false
      try {
        // chenjierag
        // if (this.ragEnabled && this.ragRootPath) {
        //   await ensureRagIndex(this.ragRootPath)
        // }
        const messages = await this.buildChatMessages(latestUserContent)
        const result = await callExternalLlmStream({
          messages,
          config: { provider: this.provider, token: this.token }
        })
        if (!result || !result.stream) {
          this.aiGenerating = false
          notice.error({
            title: this.$t('AI'),
            message: this.$t('Failed to start AI request')
          })
          return
        }
        const { stream, cancel } = result
        this.aiStream = stream
        this.aiStreamCancel = cancel
        this.attachStream()
      } catch (error) {
        this.aiGenerating = false
        this.detachStream()
        notice.error({
          title: this.$t('AI'),
          message: error && error.message ? error.message : this.$t('Failed to start AI request')
        })
      }
    },
    attachStream () {
      if (!this.aiStream) {
        return
      }
      if (!this.aiStreamHandlers) {
        this.aiStreamHandlers = {
          data: chunk => this.handleStreamData(chunk),
          end: () => this.handleStreamEnd(),
          error: () => this.handleStreamError()
        }
      }
      this.aiStream.on('data', this.aiStreamHandlers.data)
      this.aiStream.on('end', this.aiStreamHandlers.end)
      this.aiStream.on('error', this.aiStreamHandlers.error)
    },
    detachStream () {
      if (!this.aiStream) {
        return
      }
      if (this.aiStreamHandlers) {
        this.aiStream.removeListener('data', this.aiStreamHandlers.data)
        this.aiStream.removeListener('end', this.aiStreamHandlers.end)
        this.aiStream.removeListener('error', this.aiStreamHandlers.error)
      }
      this.aiStream = null
    },
    handleStreamData (chunk) {
      const text = chunk.toString()
      this.aiStreamBuffer += text
      const lines = this.aiStreamBuffer.split(/\r?\n/)
      this.aiStreamBuffer = lines.pop() || ''
      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) {
          continue
        }
        const data = line.replace(/^data:\s*/, '')
        if (!data) {
          continue
        }
        if (data === '[DONE]') {
          this.handleStreamEnd()
          continue
        }
        let payload = null
        try {
          payload = JSON.parse(data)
        } catch (error) {
          continue
        }
        const delta = (((payload || {}).choices || [])[0] || {}).delta || {}
        const content = delta.content || (((payload || {}).choices || [])[0] || {}).message?.content || ((payload || {}).choices || [])[0]?.text || ''
        if (content) {
          this.appendChatText(content)
        }
      }
    },
    handleStreamEnd () {
      if (this.aiStreamFinished) {
        return
      }
      this.aiStreamFinished = true
      this.aiGenerating = false
      this.detachStream()
      if (this.memoryEnabled) {
        const message = this.aiChatMessages.find(item => item.id === this.aiChatActiveMessageId)
        if (message && message.content) {
          this.aiChatMemory.push({
            role: 'assistant',
            content: message.content
          })
        }
      }
      this.flushChatRender()
    },
    handleStreamError () {
      if (this.aiStreamFinished) {
        return
      }
      this.aiStreamFinished = true
      this.aiGenerating = false
      this.detachStream()
      this.flushChatRender()
    },
    stopGeneration () {
      if (this.aiStreamCancel) {
        this.aiStreamCancel()
      }
      this.aiStreamCancel = null
      this.aiGenerating = false
      this.aiStreamFinished = true
      this.detachStream()
      this.aiStreamBuffer = ''
      this.flushChatRender()
    },
    handlePause () {
      this.stopGeneration()
    },
    async handleSaveFullChat () {
      const messages = this.aiChatMessages || []
      if (!messages.length) return
      const parts = []
      parts.push('# Chat Session')
      parts.push('')
      parts.push(`- Provider: ${this.aiProviderLabel}`)
      parts.push(`- Time: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`)
      parts.push(`- RAG: ${this.ragEnabled ? 'on' : 'off'}`)
      parts.push(`- Memory: ${this.memoryEnabled ? 'on' : 'off'}`)
      parts.push('')
      for (const m of messages) {
        if (m.isGreeting) {
          continue
        }
        const header = m.role === 'assistant' ? '## AI' : '## You'
        parts.push(header)
        parts.push('')
        parts.push(m.content || '')
        parts.push('')
      }
      const md = parts.join('\n')
      const { pathname, filename } = this.currentFile || {}
      let targetPath = ''
      try {
        if (pathname) {
          const dir = path.dirname(pathname)
          const base = filename ? filename.replace(/\.[^/.]+$/, '') : 'note'
          targetPath = path.join(dir, `${base}.chat-${dayjs().format('YYYYMMDD-HHmmss')}.md`)
        } else {
          const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Save Chat as Markdown',
            defaultPath: `chat-${dayjs().format('YYYYMMDD-HHmmss')}.md`
          })
          if (canceled || !filePath) {
            return
          }
          targetPath = filePath
        }
        await fs.outputFile(targetPath, md, 'utf-8')
        notice.notify({
          title: this.$t('AI'),
          type: 'success',
          message: this.$t('Chat saved to file').replace('{path}', targetPath)
        })
      } catch (error) {
        notice.notify({
          title: this.$t('AI'),
          type: 'warning',
          message: this.$t('Chat save failed').replace('{error}', error.message || error)
        })
      }
    }
  }
}
</script>

<style scoped>
  .ai-title-right {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .ai-title-right .el-checkbox {
    margin-right: 0;
  }

  .ai-dialog-body {
    padding: 12px 16px 0;
  }

  .ai-chat-list {
    flex: 1;
    max-height: none;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--editorColor10);
    border-radius: 6px;
    background: var(--floatBgColor);
    min-height: 0;
  }
</style>
