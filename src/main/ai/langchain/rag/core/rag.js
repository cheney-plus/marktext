import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatOpenAI } from "@langchain/openai"
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers'
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";




const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 20,
});

class RAG {
  static llm
  static getLLM() {
    if (!this.llm) {
      this.llm = new ChatOpenAI({
        model: "qwen-plus",
        apiKey: 'sk-e85d75869a4645e09ffa43cdbd4d64a2',
        temperature: 0.7,
        streamUsage: false,
        configuration: {
          baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
        }
      })
    }
    return this.llm
  }


  static async buildVectorStore(path) {

    const embeddingModel = new HuggingFaceTransformersEmbeddings({
      model: 'Xenova/all-MiniLM-L6-v2'
    })

    let loadedVectorStore = new FaissStore(embeddingModel, {});
    const mdFiles = await this.getAllMdFiles(path);

    for (const file of mdFiles) {
      console.log(`Processing: ${file}`);

      const loader = new TextLoader(file);
      const documents = await loader.load();
      const allSplits = await textSplitter.splitDocuments(documents);

      await loadedVectorStore.addDocuments(allSplits);
    }
  }

  static async getAllMdFiles(dirPath, fileList = []) {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await this.getAllMdFiles(fullPath, fileList);
      } else if (stats.isFile() && entry.endsWith('.md')) {
        fileList.push(fullPath);
      }
    }

    return fileList;
  }


}





RAG.buildVectorStore('/Users/cheney/Documents/develop/project/web/marktext/src/main/ai/langchain/rag/core/mkd')
  .then(() => {
    console.log('Vector store built successfully');
  })
  .catch(err => {
    console.error('Error building vector store:', err);
  });








export { RAG }
