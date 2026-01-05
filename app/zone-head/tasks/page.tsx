"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"

export default function ZoneHeadTasks() {
  const { profile } = useAuth() // assuming profile.role === "ZONE_HEAD" & profile.zone exists
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers: any = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch("/api/tasks", { headers })
    const data = await res.json()

    const taskArray = Array.isArray(data)
      ? data
      : Array.isArray(data.tasks)
      ? data.tasks
      : Array.isArray(data.data)
      ? data.data
      : []

const zoneTasks = profile?.zone
  ? taskArray.filter(
      (task: any) =>
        task.zone === profile.zone ||
        task.createdBy !== profile._id
    )
  : taskArray

    setTasks(zoneTasks)
  } catch (err) {
    console.error("Failed to fetch tasks", err)
    setTasks([])
  } finally {
    setLoading(false)
  }
    }

    fetchTasks()
  }, [profile])
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Tasks for {profile?.zone || "Your Zone"}
      </h1>

      {loading && <p>Loading tasks...</p>}

      {!loading && tasks.length === 0 && (
        <p className="text-muted-foreground">No tasks assigned to your zone.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card key={task._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {task.title}
                <Badge variant="outline">{task.zone}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {task.description}
              </p>
              <p className="text-xs">
                Deadline:{" "}
                <span className="font-medium">
                  {task.deadline ? new Date(task.deadline).toLocaleString() : '—'}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}