"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

type User = {
  uid: string
  email: string
  fullName?: string
  zone?: string
  role: string
}

export default function AllUsers() {
  const { firebaseUser, profile, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!firebaseUser) return router.push("/login")
    if (profile?.role !== "ADMIN") return router.push("/")

    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, loading])

  async function fetchUsers() {
    setFetching(true)
    const idToken = await firebaseUser.getIdToken()
    const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${idToken}` } })
    const data = await res.json()
    setUsers(data.users || [])
    setFetching(false)
  }

  async function updateRole(uid: string, role: string) {
    const idToken = await firebaseUser.getIdToken()
    const res = await fetch(`/api/users/${uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ role }),
    })
    if (res.ok) fetchUsers()
    else alert("Failed to update role")
  }

  return (
    <div>
      <h2 className="text-2xl font-black mb-4">All Users</h2>
      <div className="space-y-4">
        {users.map((u) => (
          <div key={u.uid} className="flex items-center justify-between gap-4 p-4 border rounded-xl">
            <div>
              <div className="font-bold">{u.fullName || u.email}</div>
              <div className="text-sm text-muted-foreground">{u.email} • {u.zone || "-"}</div>
            </div>
            <div className="flex items-center gap-4">
              <Select onValueChange={(val) => updateRole(u.uid, val)} defaultValue={u.role}>
                <SelectTrigger className="w-40 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CA">CA</SelectItem>
                  <SelectItem value="ZONE_HEAD">ZONE_HEAD</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
