import { Pinecone } from '@pinecone-database/pinecone'

export const getPineconeClient = async () => {
  const client = new Pinecone({ 
    apiKey:process.env.PINECONE_API_KEY!,
    environment:  'gcp-starter'
})
  await client.listIndexes()
  return client
}

