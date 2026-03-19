import { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

const endpoint = process.env.AWS_ENDPOINT_URL
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const bucket = process.env.AWS_S3_BUCKET_NAME
const publicUrl = process.env.AWS_PUBLIC_URL

function getClient(): S3Client {
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('AWS S3 configuration missing (AWS_ENDPOINT_URL, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)')
  }
  return new S3Client({
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    region: 'us-east-1', // MinIO doesn't care, but SDK requires it
    forcePathStyle: true, // Required for MinIO
  })
}

export async function uploadToMinIO(
  buffer: Buffer,
  path: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  if (!bucket || !publicUrl) {
    throw new Error('AWS_S3_BUCKET_NAME or AWS_PUBLIC_URL not configured')
  }

  const client = getClient()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return `${publicUrl}/${path}`
}

export async function moveObject(fromPath: string, toPath: string): Promise<string> {
  if (!bucket || !publicUrl) {
    throw new Error('AWS_S3_BUCKET_NAME or AWS_PUBLIC_URL not configured')
  }

  const client = getClient()

  // Copy to new location
  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${fromPath}`,
      Key: toPath,
    })
  )

  // Delete original
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: fromPath,
    })
  )

  return `${publicUrl}/${toPath}`
}

export async function deleteObject(path: string): Promise<void> {
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET_NAME not configured')
  }

  const client = getClient()

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: path,
    })
  )
}

export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to detect image dimensions')
  }
  return { width: metadata.width, height: metadata.height }
}

export function generateTempPath(filename: string, tempId: string): string {
  return `properties/temp/${tempId}/${filename}`
}

export function generateFinalPath(filename: string, propertyId: string): string {
  return `properties/${propertyId}/${filename}`
}
