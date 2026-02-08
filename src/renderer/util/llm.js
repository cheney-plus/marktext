import http from '../axios'

const DEFAULT_MESSAGES = [
  {
    content: 'You are a helpful assistant',
    role: 'system'
  },
  {
    content: 'Hi',
    role: 'user'
  }
]

const getStorePreferences = () => {
  try {
    const store = require('../store').default
    if (store && store.state && store.state.preferences) {
      return store.state.preferences
    }
    return {}
  } catch (error) {
    return {}
  }
}

const getLlmConfig = overrides => {
  const preferences = getStorePreferences()
  return {
    provider: preferences.llmProvider,
    token: preferences.llmBearerToken,
    ...overrides
  }
}

export const callExternalLlmStream = async ({ messages, config = {} } = {}) => {
  const { provider, token } = getLlmConfig(config)

  if (provider !== 'deepseek') {
    console.log(`[LLM] provider not supported: ${provider}`)
    return null
  }

  if (!token) {
    console.log('[LLM] missing bearer token, aborting request')
    return null
  }

  const payload = {
    messages: Array.isArray(messages) && messages.length ? messages : DEFAULT_MESSAGES,
    model: 'deepseek-chat',
    thinking: {
      type: 'disabled'
    },
    frequency_penalty: 0,
    max_tokens: 4096,
    presence_penalty: 0,
    response_format: {
      type: 'text'
    },
    stop: null,
    stream: true,
    stream_options: null,
    temperature: 1,
    top_p: 1,
    tools: null,
    tool_choice: 'none',
    logprobs: false,
    top_logprobs: null
  }

  console.log('[LLM] start request provider=deepseek')
  const controller = new AbortController()
  const response = await http({
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.deepseek.com/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: JSON.stringify(payload),
    responseType: 'stream',
    signal: controller.signal
  })

  const stream = response.data
  const cancel = () => {
    controller.abort()
    if (stream && stream.destroy) {
      stream.destroy()
    }
  }

  return { stream, cancel }
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
      const text = chunk.toString()
      chunks += text
      console.log('[LLM] stream chunk:', text)
    })

    stream.on('end', () => {
      console.log('[LLM] stream end')
      resolve(chunks)
    })

    stream.on('error', error => {
      console.log('[LLM] stream error:', error)
      reject(error)
    })
  })
}

export default {
  callExternalLlm,
  callExternalLlmStream
}
