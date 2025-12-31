"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"

export default function TaskEngine() {
  const { firebaseUser, profile, loading } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [zone, setZone] = useState("")
  const [points, setPoints] = useState(0)
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const res = await fetch("/api/tasks")
    const data = await res.json()
    setTasks(data.tasks || [])
  }

  async function createTask() {
    if (!firebaseUser) return alert("Please sign in as admin")
    if (profile?.role !== "ADMIN") return alert("Only admin can create tasks")

    const idToken = await firebaseUser.getIdToken()
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ title, description, zone, points }),
    })
    if (res.ok) {
      setTitle("")
      setZone("")
      setPoints(0)
      setDescription("")
      fetchTasks()
    } else {
      const err = await res.json().catch(() => ({}))
      alert("Failed to create task: " + (err?.error || res.status))
    }
  }

  async function startEdit(t: any) {
    setEditingTaskId(t._id)
    setTitle(t.title || "")
    setZone(t.zone || "")
    setPoints(t.points || 0)
    setDescription(t.description || "")
  }

  async function saveEdit() {
    if (!editingTaskId) return
    const idToken = await firebaseUser.getIdToken()
    const res = await fetch(`/api/tasks/${editingTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ title, description, zone, points }),
    })
    if (res.ok) {
      setEditingTaskId(null)
      setTitle("")
      setZone("")
      setPoints(0)
      setDescription("")
      fetchTasks()
    } else {
      const err = await res.json().catch(() => ({}))
      alert("Failed to update task: " + (err?.error || res.status))
    }
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return
    const idToken = await firebaseUser.getIdToken()
    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${idToken}` },
    })
    if (res.ok) fetchTasks()
    else alert("Failed to delete task")
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Zone</Label>
          <Select onValueChange={(val) => setZone(val)} value={zone}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="NORTH">North</SelectItem>
              <SelectItem value="SOUTH">South</SelectItem>
              <SelectItem value="EAST">East</SelectItem>
              <SelectItem value="WEST">West</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Points</Label>
          <Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="flex gap-4">
        {editingTaskId ? (
          <>
            <Button onClick={saveEdit}>Save Changes</Button>
            <Button variant="outline" onClick={() => { setEditingTaskId(null); setTitle(""); setZone(""); setPoints(0); setDescription("") }}>Cancel</Button>
          </>
        ) : (
          <Button onClick={createTask}>Create Task</Button>
        )}
        <Button variant="outline" onClick={fetchTasks}>Refresh</Button>
      </div>

      <div className="space-y-4">
        {tasks.map((t) => (
          <div key={t._id} className="p-4 border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{t.title}</div>
                <div className="text-sm text-muted-foreground">{t.zone || "All Zones"} • {t.points} pts</div>
              </div>
            </div>
            <div className="mt-2 text-sm">{t.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
