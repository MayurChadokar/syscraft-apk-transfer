const keyId = '0057b1da3677a100000000001'
const applicationKey = 'K005rVJk+OYEz+8hwZJJ9dFgD3w9y7I'
const targetBucketName = 'SYSCarft-apk'

async function updateB2Cors() {
  console.log('1. Authorizing with Backblaze Native API...')
  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${applicationKey}`).toString('base64')
  
  const authRes = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    headers: { Authorization: authHeader },
  })
  
  if (!authRes.ok) {
    console.error('Auth failed:', await authRes.text())
    return
  }

  const authData = await authRes.json()
  console.log('✅ Auth success! AccountId:', authData.accountId)
  console.log('Allowed permissions:', JSON.stringify(authData.allowed, null, 2))

  const apiUrl = authData.apiUrl
  const authToken = authData.authorizationToken
  const bucketId = authData.allowed.bucketId

  if (!bucketId) {
    console.error('No bucketId found in key permissions!')
    return
  }

  console.log('2. Updating CORS rules for BucketId:', bucketId)
  const corsRules = [
    {
      corsRuleName: 'allowAllBrowserUploads',
      allowedOrigins: ['*'],
      allowedOperations: [
        'b2_download_file_by_id',
        'b2_download_file_by_name',
        'b2_upload_file',
        'b2_upload_part',
        's3_get',
        's3_put',
        's3_delete',
        's3_head',
        's3_post'
      ],
      allowedHeaders: ['*'],
      exposeHeaders: ['ETag', 'x-amz-request-id', 'content-length', 'content-type'],
      maxAgeSeconds: 3600
    }
  ]

  const updateRes = await fetch(`${apiUrl}/b2api/v2/b2_update_bucket`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountId: authData.accountId,
      bucketId: bucketId,
      corsRules: corsRules,
    }),
  })

  if (!updateRes.ok) {
    console.error('Failed to update bucket CORS:', await updateRes.text())
    return
  }

  const updateData = await updateRes.json()
  console.log('🎉 CORS RULES UPDATED SUCCESSFULLY ON BACKBLAZE BUCKET!')
  console.log('Updated CORS Rules:', JSON.stringify(updateData.corsRules, null, 2))
}

updateB2Cors()
