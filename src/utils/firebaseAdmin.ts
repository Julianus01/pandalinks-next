import admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FB_TYPE,
        project_id: process.env.FB_PROJECT_ID,
        private_key_id: process.env.FB_PRIVATE_KEY_ID,
        private_key: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FB_CLIENT_EMAIL,
        client_id: process.env.FB_CLIENT_ID,
        auth_uri: process.env.FB_AUTH_URI,
        token_uri: process.env.FB_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FB_CLIENT_CERT_URL,
      } as any),
    })
  } catch (err: unknown) {
    const error = err as Error
    console.log('Firebase admin initialization error', error.stack)
  }
}
export default admin
