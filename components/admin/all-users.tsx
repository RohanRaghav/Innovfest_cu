"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

type User = {
  _id: string
  email: string
  fullName?: string
  zone?: string
  uid?: string
  emailVerified?: boolean
  role: string
}

export default function AllUsers() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!profile) return router.push("/login")
    if (profile?.role !== "ADMIN") return router.push("/")

    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, loading])

  async function fetchUsers() {
    setFetching(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return setFetching(false)
    const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setUsers(data.users || [])
    setFetching(false)
  }

  async function updateRole(id: string, role: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    })
    if (res.ok) fetchUsers()
    else alert("Failed to update role")
  }

  async function resendVerification(id: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch(`/api/admin/resend-verification/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) alert('Sent')
    else alert('Failed')
  }

  async function importCSV(file: File | null) {
    if (!file) return
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const text = await file.text()
    const res = await fetch('/api/admin/import-users', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: text })
    const data = await res.json()
    if (res.ok) {
      alert('Import completed')
      fetchUsers()
    } else alert('Import failed')
  }

  return (
    <div>
      <h2 className="text-2xl font-black mb-4">All Users</h2>
      <div className="mb-4 flex items-center gap-4">
        <input id="csvfile" type="file" accept=".csv" onChange={(e) => importCSV(e.target.files?.[0] || null)} />
      </div>
      <div className="space-y-4">
        {users.map((u) => (
          <div key={u._id} className="flex items-center justify-between gap-4 p-4 border rounded-xl">
            <div>
              <div className="font-bold">{u.fullName || u.email}</div>
              <div className="text-sm text-muted-foreground">{u.email} • {u.zone || "-"} • {u.uid || '-'}</div>
            </div>
            <div className="flex items-center gap-4">
              {!u.emailVerified && <Button onClick={() => resendVerification(u._id)}>Resend Verification</Button>}
              <Select onValueChange={(val) => updateRole(u._id, val)} defaultValue={u.role}>
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
