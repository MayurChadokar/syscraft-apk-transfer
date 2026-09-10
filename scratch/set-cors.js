import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3'

const keyId = '0057b1da3677a100000000001'
const applicationKey = 'K005rVJk+OYEz+8hwZJJ9dFgD3w9y7I'
const endpoint = 'https://s3.us-east-005.backblazeb2.com'
const bucketName = 'SYSCarft-apk'
const region = 'us-east-005'

const s3 = new S3Client({
  endpoint,
  region,
  forcePathStyle: true,
  credentials: {
    accessKeyId: keyId,
    secretAccessKey: applicationKey,
  },
})

async function updateCors() {
  console.log('Setting full CORS rules (Read, Write, Delete, Options) on Backblaze B2 bucket...')
  try {
    const corsCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag', 'x-amz-request-id'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })

    await s3.send(corsCommand)
    console.log('✅ CORS rules successfully updated via S3 API!')

    // Verify CORS rules
    const getCors = await s3.send(new GetBucketCorsCommand({ Bucket: bucketName }))
    console.log('Updated CORS Rules:', JSON.stringify(getCors.CORSRules, null, 2))
  } catch (err) {
    console.error('CORS Error:', err)
  }
}

updateCors()
