import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '../../../db/index';
 
const f = createUploadthing();
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const {getUser} = getKindeServerSession();
      const user = getUser();

      if(!user || !user.id) throw new Error("Unauthorized")

      return {userId: user.id};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const createdFile = await db.file.create({
          data:{
              key: file.key,
              name: file.name,
              userId: metadata.userId,
              url:`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`, //this url is a constant url that uploadingthing uses
              uploadStatus:"PROCESSING"
          }
      })

      //AI part
      try{
        const response = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
        )
    
        const blob = await response.blob()
    
        const loader = new PDFLoader(blob)
    
        const pageLevelDocs = await loader.load()
    
        const pagesAmt = pageLevelDocs.length

        // vectorize and index entire document
    const pinecone = await getPineconeClient()
    const pineconeIndex = pinecone.Index('readwise')

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    await PineconeStore.fromDocuments(
      pageLevelDocs,
      embeddings,
      {
        pineconeIndex,
        namespace: createdFile.id,
      }
    )

    await db.file.update({
      data: {
        uploadStatus: 'SUCCESS',
      },
      where: {
        id: createdFile.id,
      },
    })

      }catch(error){
        await db.file.update({
          data: {
            uploadStatus: 'FAILED',
          },
          where: {
            id: createdFile.id,
          },
        })
      }

    }),
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter;