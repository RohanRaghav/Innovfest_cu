"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function SubmissionsAdmin() {
  const { firebaseUser, profile, loading } = useAuth()
  const [subs, setSubs] = useState<any[]>([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!firebaseUser) return
    if (!profile) return
    if (!(profile.role === "ADMIN" || profile.role === "ZONE_HEAD")) return
    fetchSubs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, loading])

  async function fetchSubs() {
    setFetching(true)
    const idToken = await (firebaseUser as any).getIdToken()
    const res = await fetch("/api/submissions", { headers: { Authorization: `Bearer ${idToken}` } })
    const data = await res.json()
    setSubs(data.submissions || [])
    setFetching(false)
  }

  async function review(id: string, action: "APPROVE" | "REJECT") {
    const note = window.prompt("Notes (optional)") || undefined
    const pointsInput = window.prompt("Points to award (leave blank for default task points)")
    const points = pointsInput ? Number(pointsInput) : undefined

    const idToken = await (firebaseUser as any).getIdToken()
    const res = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
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
                <div className="font-bold">{s.uid}</div>
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
