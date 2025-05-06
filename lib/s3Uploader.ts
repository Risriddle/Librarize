import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadPDFToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  return uploadToS3(fileBuffer, fileName, contentType, "pdfs");
}

export async function uploadImageToS3(
  imageBuffer: Buffer,
  imageName: string,
  contentType: string
): Promise<string> {
  return uploadToS3(imageBuffer, imageName, contentType, "covers");
}

async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || "";
  const key = `${folder}/${uuidv4()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
}