//npm i @pinecone-database/pinecone
//PINECONE_API_KEY
//install langchain
//install pdf-parse
import { PineconeClient } from '@pinecone-database/pinecone'

export const getPineconeClient = async () => {
  const client = new PineconeClient()

  await client.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: 'gcp-starter',
  })

  return client
}