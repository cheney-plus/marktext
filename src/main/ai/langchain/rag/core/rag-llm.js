import fs from 'fs'
import path from 'path'
import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers'

// 为 Node.js 环境模拟浏览器全局对象
const fetch = require('node-fetch');
const { Headers, Request, Response } = fetch;

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}


const INDEX_DIRNAME = '.rag_index'
const embeddings = new HuggingFaceTransformersEmbeddings({
  model: 'Xenova/all-MiniLM-L6-v2'
})

const storeCache = new Map()
const indexTasks = new Map()

const getIndexPath = rootPath => path.join(rootPath, INDEX_DIRNAME)

const collectMarkdownFiles = async rootPath => {
  const results = []
  const stack = [rootPath]
  while (stack.length) {
    const current = stack.pop()
    let entries = []
    try {
      entries = await fs.promises.readdir(current, { withFileTypes: true })
    } catch (error) {
      continue
    }
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === INDEX_DIRNAME) {
          continue
        }
        stack.push(entryPath)
      } else if (entry.isFile()) {
        if (entry.name.toLowerCase().endsWith('.md')) {
          results.push(entryPath)
        }
      }
    }
  }
  return results
}

const loadVectorStore = async rootPath => {
  const indexPath = getIndexPath(rootPath)
  const indexFile = path.join(indexPath, 'faiss.index')
  if (!fs.existsSync(indexFile)) {
    return null
  }
  try {
    return await FaissStore.load(indexPath, embeddings)
  } catch (error) {
    return null
  }
}

const buildVectorStore = async (rootPath, filePaths) => {
  const docs = []
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })
  for (const filePath of filePaths) {
    const stat = await fs.promises.stat(filePath)
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const doc = new Document({
      pageContent: content,
      metadata: {
        source: filePath,
        mtimeMs: stat.mtimeMs
      }
    })
    const chunks = await splitter.splitDocuments([doc])
    docs.push(...chunks)
  }
  if (!docs.length) {
    return null
  }
  const store = await FaissStore.fromDocuments(docs, embeddings)
  await store.save(getIndexPath(rootPath))
  return store
}

const getExistingMeta = vectorStore => {
  const map = new Map()
  const docstoreMap = vectorStore && vectorStore.docstore && vectorStore.docstore._docs
  if (!docstoreMap) {
    return map
  }
  for (const doc of docstoreMap.values()) {
    const source = doc.metadata && doc.metadata.source
    if (!source) {
      continue
    }
    map.set(source, {
      mtimeMs: doc.metadata.mtimeMs
    })
  }
  return map
}

const deleteBySource = async (vectorStore, source) => {
  const docstoreMap = vectorStore && vectorStore.docstore && vectorStore.docstore._docs
  if (!docstoreMap) {
    return
  }
  const idsToDelete = []
  for (const [id, doc] of docstoreMap.entries()) {
    if (doc.metadata && doc.metadata.source === source) {
      idsToDelete.push(id)
    }
  }
  if (idsToDelete.length) {
    await vectorStore.delete({ ids: idsToDelete })
  }
}

const syncVectorStore = async rootPath => {
  const files = await collectMarkdownFiles(rootPath)
  if (!files.length) {
    return null
  }
  let vectorStore = await loadVectorStore(rootPath)
  if (!vectorStore) {
    vectorStore = await buildVectorStore(rootPath, files)
    if (vectorStore) {
      storeCache.set(rootPath, vectorStore)
    }
    return vectorStore
  }
  const existingMeta = getExistingMeta(vectorStore)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })
  const docsToAdd = []
  for (const filePath of files) {
    let stat = null
    try {
      stat = await fs.promises.stat(filePath)
    } catch (error) {
      continue
    }
    const meta = existingMeta.get(filePath)
    if (meta && meta.mtimeMs === stat.mtimeMs) {
      continue
    }
    const content = await fs.promises.readFile(filePath, 'utf-8')
    await deleteBySource(vectorStore, filePath)
    const doc = new Document({
      pageContent: content,
      metadata: {
        source: filePath,
        mtimeMs: stat.mtimeMs
      }
    })
    const chunks = await splitter.splitDocuments([doc])
    docsToAdd.push(...chunks)
  }
  if (docsToAdd.length) {
    await vectorStore.addDocuments(docsToAdd)
    await vectorStore.save(getIndexPath(rootPath))
  }
  storeCache.set(rootPath, vectorStore)
  return vectorStore
}

export const ensureRagIndex = async rootPath => {
  if (!rootPath) {
    return null
  }
  if (storeCache.has(rootPath)) {
    return storeCache.get(rootPath)
  }
  if (indexTasks.has(rootPath)) {
    return indexTasks.get(rootPath)
  }
  const task = syncVectorStore(rootPath).finally(() => {
    indexTasks.delete(rootPath)
  })
  indexTasks.set(rootPath, task)
  return task
}

export const getRagContext = async ({ rootPath, query, k = 2 } = {}) => {
  if (!rootPath || !query) {
    return ''
  }
  const vectorStore = await ensureRagIndex(rootPath)
  if (!vectorStore) {
    return ''
  }
  const docs = await vectorStore.similaritySearch(query, k)
  if (!docs || !docs.length) {
    return ''
  }
  return docs.map(doc => doc.pageContent).join('\n\n---\n\n')
}

export default {
  ensureRagIndex,
  getRagContext
}
