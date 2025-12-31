"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import dynamic from "next/dynamic"

const SubmitProof = dynamic(() => import("@/components/tasks/submit-proof"), { ssr: false })

export default function DashboardTasksPage() {
  const { firebaseUser, profile, loading } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const res = await fetch("/api/tasks")
    const data = await res.json()
    const all = data.tasks || []
    setTasks(all)
  }

  if (loading) return null

  const visible = tasks.filter((t) => !t.zone || t.zone === (profile?.zone || ""))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-black">Available Tasks</h1>
        <p className="text-muted-foreground">Complete tasks from your zone or global tasks to earn points</p>
      </header>

      <div className="space-y-4">
        {visible.map((t) => (
          <Card key={t._id}>
            <CardHeader>
              <CardTitle className="text-lg font-black">{t.title}</CardTitle>
              <CardDescription>{t.zone || "All Zones"} • {t.points} pts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t.description}</p>
                <div className="flex items-center gap-2">
                  <SubmitProof taskId={String(t._id)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
