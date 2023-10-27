import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '../../../db/index';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { getPineconeClient } from '../../../lib/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import { PLANS } from '../../../config/stripe';
import { metadata } from '../../layout';
 
const f = createUploadthing();

const middleware =async () => {
  // This code runs on your server before upload
  const {getUser} = getKindeServerSession();
  const user = getUser();

  if(!user || !user.id) throw new Error("Unauthorized")

  const subscriptionPlan = await getUserSubscriptionPlan()

  return {subscriptionPlan,userId: user.id};
}

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>
  file: {
    key: string
    name: string
    url: string
  }
}) => {
  // This code RUNS ON YOUR SERVER after upload
  const isFileExist = await db.file.findFirst({
    where:{
      key: file.key
    }
  })
  if(isFileExist) return
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

      const {subscriptionPlan} = metadata;
      const {isSubscribed} = subscriptionPlan;

      const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf
      const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf

      if((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)){
        await db.file.update({
          data:{
            uploadStatus: "FAILED"
          },
          where:{
            id: createdFile.id
          }
        })
      }

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
}
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),

    proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),

} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter;