import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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

async function testUpload() {
  console.log('Testing Backblaze B2 Upload with NEW credentials...')
  try {
    const testKey = `test-${Date.now()}.txt`
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: Buffer.from('Hello Backblaze B2 Success!'),
      ContentType: 'text/plain',
    })

    const result = await s3.send(command)
    console.log('✅ Direct S3 Upload SUCCESS! Result:', result)

    // Test Presigned URL
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })
    console.log('Generated Presigned URL:', presignedUrl)

    // Test fetch PUT
    const res = await fetch(presignedUrl, {
      method: 'PUT',
      body: 'Hello Presigned Upload!',
      headers: { 'Content-Type': 'text/plain' },
    })
    console.log('Fetch PUT Status:', res.status, res.statusText)
    if (res.ok) {
      console.log('🎉 Presigned PUT Upload SUCCESS!')
    } else {
      console.log('Fetch PUT Error body:', await res.text())
    }
  } catch (err) {
    console.error('B2 Error:', err)
  }
}

testUpload()
