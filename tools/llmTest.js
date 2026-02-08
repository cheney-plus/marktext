const fs = require('fs')
const path = require('path')

const requireEsm = require('esm')(module)
const { callExternalLlm } = requireEsm('../src/renderer/util/llm')

const preferencePath = path.join(__dirname, '../static/preference.json')
const rawPreferences = fs.readFileSync(preferencePath, 'utf8')
const preferences = JSON.parse(rawPreferences)

const tokenFromEnv = process.env.MARKTEXT_LLM_TOKEN || process.env.LLM_TOKEN || ''
const config = {
  provider: preferences.llmProvider,
  token: tokenFromEnv || preferences.llmBearerToken
}

const messages = [{
  content: 'You are a helpful assistant',
  role: 'system'
}, {
  content: 'Hi',
  role: 'user'
}]

callExternalLlm({ messages, config })
  .then(() => {
    console.log('[LLM] test completed')
    process.exit(0)
  })
  .catch(error => {
    console.log('[LLM] test failed:', error)
    process.exit(1)
  })
