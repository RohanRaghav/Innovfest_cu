"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function ZoneHeadSubmissions() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [subs, setSubs] = useState<any[]>([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!profile) return router.push("/login")
    if (profile?.role !== "ZONE_HEAD") return router.push("/")
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
    const pointsInput = window.prompt("Points to award")
    const points = pointsInput ? Number(pointsInput) : undefined

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, note, points }),
    })
    if (res.ok) {
      alert("Submission reviewed")
      fetchSubs()
    } else {
      const err = await res.json().catch(() => ({}))
      alert("Failed: " + (err?.error || res.status))
    }
  }

  async function exportAnalytics() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch(`/api/analytics/export`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return alert("Failed to export")
    const csv = await res.text()
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${profile?.zone || "zone"}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2 className="text-2xl font-black mb-4">CA Submissions</h2>

      <div className="flex justify-end mb-4">
        <Button onClick={exportAnalytics}>Export Analytics</Button>
      </div>

      <div className="space-y-4">
        {subs.map((s) => (
          <div key={s._id} className="p-4 border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{s.userEmail || s.userId}</div>
                <div className="text-sm text-muted-foreground">Task: {s.taskId} • Points: {s.points}</div>
              </div>
              <div className="text-sm font-bold uppercase">{s.status}</div>
            </div>
            <div className="mt-2">
              <a href={s.mediaUrl} className="underline text-blue-600" target="_blank" rel="noreferrer">
                View Proof
              </a>
            </div>
            {s.status === "PENDING" && (
              <div className="mt-4 flex gap-2">
                <Button onClick={() => review(s._id, "APPROVE")}>Approve</Button>
                <Button variant="destructive" onClick={() => review(s._id, "REJECT")}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
        {!subs.length && <p className="text-muted-foreground">No submissions yet</p>}
      </div>
    </div>
  )
}
