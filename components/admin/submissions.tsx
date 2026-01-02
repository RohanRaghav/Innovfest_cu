"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function SubmissionsAdmin() {
  const { profile, loading } = useAuth()
  const [subs, setSubs] = useState<any[]>([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!profile) return
    if (!(profile.role === "ADMIN" || profile.role === "ZONE_HEAD")) return
    fetchSubs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, loading])

  async function fetchSubs() {
    setFetching(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return setFetching(false)
    const res = await fetch("/api/submissions", { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setSubs(data.submissions || [])
    setFetching(false)
  }

  async function review(id: string, action: "APPROVE" | "REJECT") {
    const note = window.prompt("Notes (optional)") || undefined
    const pointsInput = window.prompt("Points to award (leave blank for default task points)")
    const points = pointsInput ? Number(pointsInput) : undefined

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, note, points }),
    })
    if (res.ok) fetchSubs()
    else alert("Failed to update")
  }

  return (
    <div>
      <h2 className="text-2xl font-black mb-4">Submissions</h2>
      <div className="space-y-4">
        {subs.map((s) => (
          <div key={s._id} className="p-4 border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{s.userEmail || s.userId || s.uid}</div>
                <div className="text-sm text-muted-foreground">Task: {s.taskId} • {s.zone}</div>
              </div>
              <div className="text-sm font-bold uppercase">{s.status}</div>
            </div>
            <div className="mt-2">
              <a href={s.mediaUrl} className="underline" target="_blank" rel="noreferrer">Open proof</a>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => review(s._id, "APPROVE")}>Approve</Button>
              <Button variant="destructive" onClick={() => review(s._id, "REJECT")}>Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
