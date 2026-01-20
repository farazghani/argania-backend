import { S3Client } from "@aws-sdk/client-s3";

export const client = new S3Client({
  forcePathStyle: true,
  region: "us-east-1",
  endpoint: process.env.SUPABASE_URL, 
  credentials: {
    accessKeyId: process.env.SUPABASE_KEY_ID,
    secretAccessKey: process.env.SUPABASE_SERVICE_KEY,
  },
});