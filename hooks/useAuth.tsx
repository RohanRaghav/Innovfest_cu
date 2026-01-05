"use client"

import { useEffect, useState } from "react"

export type UserProfile = {
  _id: string
  email: string
  fullName?: string
  phone?: string
  college?: string
  uid?: string
  referralCode?: string
  emailVerified?: boolean
  points?: number
  tasksDone?: number
  zone?: string
  role: "CA" | "ZONE_HEAD" | "ADMIN"
}

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        setFirebaseUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const { user: u } = await res.json()
          setProfile(u)
          setFirebaseUser(u) // backwards compatibility for components that check firebaseUser
        } else {
          setProfile(null)
          setFirebaseUser(null)
        }
      } catch (err) {
        setProfile(null)
        setFirebaseUser(null)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    setProfile(null)
    setFirebaseUser(null)
  }

  return { firebaseUser, profile, loading, logout }
}
