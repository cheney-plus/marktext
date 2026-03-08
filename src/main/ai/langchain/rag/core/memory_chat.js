import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage } from '@langchain/core/messages'

/**
 * In-memory chat assistant using LangChain.js with streaming
 * Maintains conversation history only for the current session
 */
class InMemoryChatAssistant {
  constructor (apiKey) {
        // Initialize the LLM
    this.llm = new ChatOpenAI({
      model: 'qwen-plus',
      apiKey: apiKey,
      configuration: {
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
      }
    })

        // In-memory message history (not persisted)
    this.messageHistory = []

        // System prompt for the assistant
    this.systemPrompt = `You are a helpful AI assistant. 
You have access to the conversation history and should maintain context across multiple turns. 
Provide clear, concise, and helpful responses.`
  }

    /**
     * Send a message and stream the response
     * @param {string} userMessage - The user's message
     * @returns {Promise<string>} The complete assistant's response
     */
  async chat (userMessage) {
        // Add user message to history
    this.messageHistory.push(new HumanMessage(userMessage))

    try {
      let fullResponse = ''

            // Stream the LLM response token by token
      const stream = await this.llm.stream(this.messageHistory)

            // Process each chunk as it arrives
      for await (const chunk of stream) {
        const content = chunk.content
        process.stdout.write(content) // Print each token immediately
        fullResponse += content // Accumulate for history
      }

      console.log('\n') // New line after streaming completes

            // Add the complete assistant response to history
      this.messageHistory.push(new AIMessage(fullResponse))

      return fullResponse
    } catch (error) {
      console.error('Error calling LLM:', error)
      throw error
    }
  }

    /**
     * Get the conversation history
     * @returns {Array} Array of messages in the current session
     */
  getHistory () {
    return this.messageHistory.map((msg) => ({
      role: msg._getType() === 'human' ? 'user' : 'assistant',
      content: msg.content
    }))
  }

    /**
     * Clear the conversation history
     */
  clearHistory () {
    this.messageHistory = []
  }

    /**
     * Get the number of messages in the current session
     * @returns {number} Number of messages
     */
  getMessageCount () {
    return this.messageHistory.length
  }
}

// Usage Example
async function main () {
  const apiKey = 'sk-e85d75869a4645e09ffa43cdbd4d64a2' // Set your API key

    // Create a new chat session
  const assistant = new InMemoryChatAssistant(apiKey)

  console.log('=== In-Memory Chat Assistant (Streaming) ===\n')

    // First turn - response streams in real-time
  console.log('User: What is the capital of France?')
  console.log('Assistant: ')
  await assistant.chat('What is the capital of France?')

    // Second turn - streaming with context
  console.log('\nUser: What is its population?')
  console.log('Assistant: ')
  await assistant.chat('What is its population?')

    // Third turn - continuing the conversation
  console.log('\nUser: Tell me about its history.')
  console.log('Assistant: ')
  await assistant.chat('Tell me about its history.')

    // View conversation history
  console.log('=== Conversation History ===')
  const history = assistant.getHistory()
  history.forEach((msg, index) => {
    console.log(`${index + 1}. [${msg.role.toUpperCase()}]: ${msg.content}`)
  })

  console.log(`\nTotal messages: ${assistant.getMessageCount()}`)
}

main().catch(console.error)
