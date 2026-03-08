import fs from 'fs'
import path from 'path'
import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { ChatOpenAI } from '@langchain/openai'
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

// ─── 配置 ───────────────────────────────────────────────────────────────────

const INDEX_PATH = './faiss_index'
const MARKDOWN_DIR = '/Users/cheney/dev/others/langchain/demo/markdown'

const MODEL_CONFIG = {
  model: 'qwen-plus',
  apiKey: 'sk-e85d75869a4645e09ffa43cdbd4d64a2',
  configuration: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  }
}

// ─── Embeddings & LLM ───────────────────────────────────────────────────────

const embeddings = new HuggingFaceTransformersEmbeddings({
  model: 'Xenova/all-MiniLM-L6-v2'
})

const chatModel = new ChatOpenAI(MODEL_CONFIG)

// ─── 向量存储管理 ─────────────────────────────────────────────────────────────

let _vectorStore = null

/**
 * 获取向量存储（缓存单例）
 * @returns {Promise<FaissStore>}
 */
async function getVectorStore () {
  if (!_vectorStore) {
    try {
      _vectorStore = await FaissStore.load(INDEX_PATH, embeddings)
      console.log('Loaded existing FAISS index.')
    } catch {
      console.log('No index found, building from', MARKDOWN_DIR)
      _vectorStore = await buildFullIndex()
    }
  }
  return _vectorStore
}

/**
 * 从 markdown 目录构建完整向量索引
 * @returns {Promise<FaissStore>}
 */
async function buildFullIndex () {
  const rawDocs = await loadMarkdownDocs()
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })
  const chunks = await splitter.splitDocuments(rawDocs)
  const vectorStore = await FaissStore.fromDocuments(chunks, embeddings)
  await vectorStore.save(INDEX_PATH)
  console.log(`Built index with ${chunks.length} chunks.`)
  return vectorStore
}

/**
 * 加载指定目录下所有 .md 文件
 * @returns {Promise<Document[]>}
 */
async function loadMarkdownDocs () {
  if (!fs.existsSync(MARKDOWN_DIR)) {
    throw new Error(`Directory ${MARKDOWN_DIR} does not exist`)
  }
  const files = await fs.promises.readdir(MARKDOWN_DIR)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  return Promise.all(
    mdFiles.map(async (file) => {
      const filePath = path.join(MARKDOWN_DIR, file)
      const content = await fs.promises.readFile(filePath, 'utf-8')
      return new Document({ pageContent: content, metadata: { source: filePath } })
    })
  )
}

/**
 * 删除指定 markdown 文件对应的所有向量 chunks
 * @param {string} fileName - 文件名（如 "notes.md"）或完整路径
 */
async function deleteMarkdown (fileName) {
  const vectorStore = await getVectorStore()
  const targetPath = path.isAbsolute(fileName)
    ? fileName
    : path.join(MARKDOWN_DIR, fileName)

  console.log('Deleting chunks for:', targetPath)

  const docstoreMap = vectorStore.docstore._docs
  const idsToDelete = []
  for (const [id, doc] of docstoreMap.entries()) {
    if (doc.metadata.source === targetPath) {
      idsToDelete.push(id)
    }
  }

  if (idsToDelete.length > 0) {
    await vectorStore.delete({ ids: idsToDelete })
    await vectorStore.save(INDEX_PATH)
    console.log(`Deleted ${idsToDelete.length} chunks for "${fileName}".`)
  } else {
    console.log(`No chunks found for "${fileName}".`)
  }
}

/**
 * 添加或更新指定 markdown 文件到向量数据库
 * @param {string} filePath - 完整文件路径
 */
async function addMarkdown (filePath) {
  await deleteMarkdown(path.basename(filePath))

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  const content = await fs.promises.readFile(filePath, 'utf-8')
  const doc = new Document({
    pageContent: content,
    metadata: { source: filePath }
  })

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })
  const chunks = await splitter.splitDocuments([doc])
  const vectorStore = await getVectorStore()
  await vectorStore.addDocuments(chunks)
  await vectorStore.save(INDEX_PATH)

  console.log(`Added ${chunks.length} chunks for "${path.basename(filePath)}".`)
}

// ─── RAG 对话助手（含内存会话记忆）───────────────────────────────────────────

class RAGChatAssistant {
  constructor () {
    /** @type {Array<HumanMessage|AIMessage>} 当前会话消息历史 */
    this.messageHistory = []

    // 构建带 chat history 占位符的 prompt 模板
    this.promptTemplate = ChatPromptTemplate.fromMessages([
      new SystemMessage(
        `你是一个知识助手，根据提供的笔记内容回答问题。
如果笔记中没有相关信息，请诚实地说"我不知道"。
请结合对话历史保持上下文连贯。

相关笔记内容：
{context}`
      ),
      new MessagesPlaceholder('chat_history'),
      ['human', '{question}']
    ])

    // 构建 LCEL chain：prompt | LLM | 字符串解析
    this.chain = this.promptTemplate.pipe(chatModel).pipe(new StringOutputParser())
  }

  /**
   * 发送消息并流式输出回答（含 RAG 检索 + 会话记忆）
   * @param {string} userMessage - 用户输入
   * @returns {Promise<string>} 完整回答文本
   */
  async chat (userMessage) {
    // 1. 从向量库检索相关上下文
    const vectorStore = await getVectorStore()
    const relevantDocs = await vectorStore.similaritySearch(userMessage, 3)
    const context = relevantDocs.map((d) => d.pageContent).join('\n\n---\n\n') || '无相关笔记'

    // 2. 将用户消息加入历史
    this.messageHistory.push(new HumanMessage(userMessage))

    try {
      let fullResponse = ''

      // 3. 流式调用 chain
      const stream = await this.chain.stream({
        context,
        chat_history: this.messageHistory.slice(0, -1), // 历史（不含当前问题）
        question: userMessage
      })

      for await (const chunk of stream) {
        process.stdout.write(chunk)
        fullResponse += chunk
      }
      console.log('\n')

      // 4. 将 AI 回答加入历史
      this.messageHistory.push(new AIMessage(fullResponse))

      return fullResponse
    } catch (error) {
      console.error('Error calling LLM:', error)
      throw error
    }
  }

  /**
   * 获取当前会话历史（格式化为 role/content 对象数组）
   * @returns {Array<{role: string, content: string}>}
   */
  getHistory () {
    return this.messageHistory.map((msg) => ({
      role: msg._getType() === 'human' ? 'user' : 'assistant',
      content: msg.content
    }))
  }

  /** 清空会话历史 */
  clearHistory () {
    this.messageHistory = []
    console.log('Conversation history cleared.')
  }

  /** 获取当前消息条数 */
  getMessageCount () {
    return this.messageHistory.length
  }
}

export { addMarkdown, deleteMarkdown, RAGChatAssistant }

// ─── 使用示例 ─────────────────────────────────────────────────────────────────

(async () => {
  const assistant = new RAGChatAssistant()

  console.log('=== RAG Chat Assistant (Streaming + Memory) ===\n')

  // 第一轮对话
  console.log('User: 我的父亲是谁？')
  process.stdout.write('Assistant: ')
  await assistant.chat('我的父亲是谁？')

  // 第二轮对话（利用上下文记忆）
  console.log('User: 他有什么特别之处？')
  process.stdout.write('Assistant: ')
  await assistant.chat('他有什么特别之处？')

  // 查看会话历史
  console.log('=== Conversation History ===')
  assistant.getHistory().forEach((msg, i) => {
    const preview = msg.content.slice(0, 80).replace(/\n/g, ' ')
    console.log(`${i + 1}. [${msg.role.toUpperCase()}]: ${preview}...`)
  })
  console.log(`\nTotal messages: ${assistant.getMessageCount()}`)

  // ── 索引维护示例（取消注释以运行）──
  // await deleteMarkdown("我的父亲.md");
  // await addMarkdown("./markdown/我的父亲.md");
})()
