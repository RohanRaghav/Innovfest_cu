"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function AmbassadorsPage() {
  const { profile, firebaseUser, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (loading) return
    if (!firebaseUser) return router.push("/login")
    if (profile?.role && profile.role !== "ZONE_HEAD") {
      if (profile.role === "ADMIN") router.push("/admin")
      else if (profile.role === "CA") router.push("/dashboard")
    }

    async function load() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) return
      const res = await fetch("/api/zone/stats", { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const d = await res.json()
        setStats(d)
      }
    }

    if (profile?.role === "ZONE_HEAD") load()
  }, [profile, loading, firebaseUser, router])

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-black">Ambassadors — {stats?.zone ?? profile?.zone ?? "Zone"}</h1>
      <div className="space-y-4">
        {(stats?.topMembers || []).map((m: any, i: number) => (
          <div key={m._id ?? i} className="p-4 border rounded-lg flex items-center justify-between">
            <div>
              <div className="font-bold">{m.fullName ?? m.email}</div>
              <div className="text-sm text-muted-foreground">{m.college ?? "—"}</div>
            </div>
            <div className="text-right">
              <div className="font-black text-lg">{m.points ?? 0} pts</div>
              <div className="text-xs text-muted-foreground">Tasks: {m.tasksDone ?? 0}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
