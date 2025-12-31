import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"

const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Only initialize Firebase in the browser (avoid server-side errors when env vars are missing)
let auth: ReturnType<typeof getAuth> | null = null

if (typeof window !== "undefined") {
  if (!clientConfig.apiKey) {
    console.warn("NEXT_PUBLIC_FIREBASE_API_KEY is not set — Firebase client will not initialize.")
  } else {
    if (!getApps().length) {
      initializeApp(clientConfig)
    }
    auth = getAuth()
  }
}

export { auth }
export default auth
