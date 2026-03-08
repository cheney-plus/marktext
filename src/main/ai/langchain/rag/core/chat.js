import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'

/**
 * 纯对话助手 - 无对话历史记录
 * 每次调用都是独立的，不维护任何会话状态
 */
class StatelessChatAssistant {
  constructor (apiKey) {
    // 初始化 LLM
    this.llm = new ChatOpenAI({
      model: 'qwen-plus',
      apiKey: apiKey,
      configuration: {
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
      }
    })

    // 系统提示词
    this.systemPrompt = `You are a helpful AI assistant.
Provide clear, concise, and helpful responses to user questions.`
  }

  /**
   * 发送消息并获取响应
   * 每次调用都不考虑之前的对话
   * @param {string} userMessage - 用户消息
   * @returns {Promise<string>} 助手响应
   */
  async chat (userMessage) {
    try {
      // 创建单条消息（不包含历史记录）
      const message = new HumanMessage(userMessage)

      // 直接调用 LLM，仅使用当前消息
      const response = await this.llm.invoke([message])

      // 提取响应内容
      return response.content
    } catch (error) {
      console.error('Error calling LLM:', error)
      throw error
    }
  }

  /**
   * 流式响应
   * @param {string} userMessage - 用户消息
   * @param {Function} onChunk - 接收每个文本块的回调函数
   */
  async chatStream (userMessage, onChunk) {
    try {
      const message = new HumanMessage(userMessage)

      // 创建流式响应
      const stream = await this.llm.stream([message])

      // 处理每个块
      for await (const chunk of stream) {
        if (chunk.content) {
          onChunk(chunk.content)
        }
      }
    } catch (error) {
      console.error('Error in streaming:', error)
      throw error
    }
  }
}

// ==================== 使用示例 ====================

async function main () {
  const apiKey = 'sk-e85d75869a4645e09ffa43cdbd4d64a2' // 设置您的 API 密钥

  // 创建助手实例
  const assistant = new StatelessChatAssistant(apiKey)

  console.log('=== 纯对话助手（无记忆）===\n')

  // 第一条消息 - 独立对话
  console.log('用户: 法国的首都是哪里?')
  let response = await assistant.chat('法国的首都是哪里?')
  console.log(`助手: ${response}\n`)

  // 第二条消息 - 完全独立，不会记得前面的问题
  console.log('用户: 它的人口是多少?')
  response = await assistant.chat('它的人口是多少?') // "它"在这里是模糊的，模型不知道指什么
  console.log(`助手: ${response}\n`)

  // 演示流式响应
  console.log('用户: 告诉我关于埃菲尔铁塔的信息')
  console.log('助手: ')
  await assistant.chatStream(
    '告诉我关于埃菲尔铁塔的信息',
    (chunk) => {
      process.stdout.write(chunk) // 逐块输出
    }
  )
  console.log('\n')
}

main().catch(console.error)
