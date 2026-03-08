import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { Readable } from 'stream'

const DEFAULT_MESSAGES = [
  {
    role: 'system',
    content: 'You are a helpful assistant'
  },
  {
    role: 'user',
    content: 'Hi'
  }
]

const MODEL_CONFIG = {
  qwen: {
    model: 'qwen-plus',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  deepseek: {
    model: 'deepseek-chat',
    baseURL: 'https://api.deepseek.com'
  },
  doubao: {
    model: 'doubao-seed-1-8-251228',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
  },
  yuanbao: {
    model: 'hunyuan-turbo',
    baseURL: 'https://hunyuan.cloud.tencent.com/hyllm/v1'
  }
}

const toLangChainMessage = message => {
  if (!message || !message.role) {
    return new HumanMessage(message?.content || '')
  }
  if (message.role === 'system') {
    return new SystemMessage(message.content || '')
  }
  if (message.role === 'assistant') {
    return new AIMessage(message.content || '')
  }
  return new HumanMessage(message.content || '')
}

const toLangChainMessages = messages => {
  const source = Array.isArray(messages) && messages.length ? messages : DEFAULT_MESSAGES
  return source.map(toLangChainMessage)
}

const getProviderConfig = provider => MODEL_CONFIG[provider] || null

const createLlm = ({ provider, token }) => {
  const config = getProviderConfig(provider)
  if (!config) {
    return null
  }
  return new ChatOpenAI({
    model: config.model,
    apiKey: token,
    configuration: {
      baseURL: config.baseURL
    }
  })
}

const createSseStream = (iterator, abortController) => {
  const readable = Readable.from(
    (async function * () {
      for await (const chunk of iterator) {
        const raw = chunk && chunk.content
        const content = Array.isArray(raw) ? raw.join('') : raw || ''
        if (!content) {
          continue
        }
        const payload = {
          choices: [
            {
              delta: { content }
            }
          ]
        }
        yield `data: ${JSON.stringify(payload)}\n\n`
      }
      yield 'data: [DONE]\n\n'
    })()
  )
  const cancel = () => {
    abortController.abort()
    readable.destroy()
  }
  return { stream: readable, cancel }
}

export const callExternalLlmStream = async ({ messages, config = {} } = {}) => {
  const { provider, token } = config || {}
  if (!provider) {
    console.log('[LLM] provider not set')
    return null
  }
  if (!token) {
    console.log('[LLM] missing bearer token, aborting request')
    return null
  }
  const llm = createLlm({ provider, token })
  if (!llm) {
    console.log(`[LLM] provider not supported: ${provider}`)
    return null
  }
  const abortController = new AbortController()
  const langchainMessages = toLangChainMessages(messages)
  const iterator = await llm.stream(langchainMessages, {
    signal: abortController.signal
  })
  return createSseStream(iterator, abortController)
}

export const callExternalLlm = async ({ messages, config = {} } = {}) => {
  const result = await callExternalLlmStream({ messages, config })
  if (!result) {
    return null
  }
  const { stream } = result
  return new Promise((resolve, reject) => {
    let chunks = ''
    stream.on('data', chunk => {
      chunks += chunk.toString()
    })
    stream.on('end', () => {
      resolve(chunks)
    })
    stream.on('error', error => {
      reject(error)
    })
  })
}

export default {
  callExternalLlm,
  callExternalLlmStream
}
