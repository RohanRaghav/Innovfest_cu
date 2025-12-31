"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"

export type UserProfile = {
  uid: string
  email: string
  fullName?: string
  phone?: string
  college?: string
  zone?: string
  role: "CA" | "ZONE_HEAD" | "ADMIN"
}

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        const idToken = await user.getIdToken()
        try {
          const res = await fetch("/api/users/me", {
            headers: { Authorization: `Bearer ${idToken}` },
          })
          if (res.ok) {
            const { user: u } = await res.json()
            setProfile(u)
          } else {
            setProfile(null)
          }
        } catch (err) {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [])

  return { firebaseUser, profile, loading }
}
