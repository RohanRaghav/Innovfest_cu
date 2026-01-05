"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"

export default function TaskEngine() {
  const { profile, loading } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [zone, setZone] = useState("")
  const [points, setPoints] = useState(0)
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchTasks()
  }, [])

  function toLocalDatetimeInput(val?: string | null) {
    if (!val) return ""
    const d = new Date(val)
    const pad = (n: number) => String(n).padStart(2, "0")
    const YYYY = d.getFullYear()
    const MM = pad(d.getMonth() + 1)
    const DD = pad(d.getDate())
    const hh = pad(d.getHours())
    const mm = pad(d.getMinutes())
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`
  }

  async function fetchTasks() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers: any = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch("/api/tasks", { headers })
    const data = await res.json()
    setTasks(data.tasks || [])
  }

  async function createTask() {
    if (!profile) return alert("Please sign in as admin")
    if (profile?.role !== "ADMIN") return alert("Only admin can create tasks")

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch(`/api/tasks/${editingTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) fetchTasks()
    else alert("Failed to delete task")
  }

  async function toggleActive(id: string, current: boolean) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !current }),
    })
    if (res.ok) fetchTasks()
    else alert("Failed to update task")
  }

  // Assignment to zone-heads
  const [zoneHeads, setZoneHeads] = useState<any[]>([])
  const [selectedZHTaskId, setSelectedZHTaskId] = useState<string | null>(null)
  const [selectedZoneHeads, setSelectedZoneHeads] = useState<string[]>([])

  useEffect(() => {
    fetchZoneHeads()
  }, [])

  async function fetchZoneHeads() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers: any = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch("/api/users", { headers })
    const data = await res.json().catch(() => ({}))
    const heads = (data.users || []).filter((u: any) => u.role === "ZONE_HEAD")
    setZoneHeads(heads)
  }

  async function assignTaskToZoneHeads() {
    if (!selectedZHTaskId) return alert("Select a task")
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ taskId: selectedZHTaskId, assigneeIds: selectedZoneHeads }),
    })
    if (res.ok) {
      alert("Task assigned to Zone Heads")
      setSelectedZHTaskId(null)
      setSelectedZoneHeads([])
    } else {
      const err = await res.json().catch(() => ({}))
      alert("Failed: " + (err?.error || res.status))
    }
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

      <div className="flex items-center gap-2">
        <label className="text-sm font-bold">Show:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 rounded">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="p-4 border rounded-xl">
        <div className="font-bold mb-3">Assign Task to Zone Heads</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Select Task</Label>
            <select value={selectedZHTaskId || ""} onChange={(e) => setSelectedZHTaskId(e.target.value)} className="p-2 w-full border rounded">
              <option value="">Choose a task...</option>
              {tasks.map((t) => <option key={t._id} value={t._id}>{t.title} • {t.zone || "All"}</option>)}
            </select>
          </div>
          <div>
            <Label>Select Zone Heads</Label>
            <select
              multiple
              value={selectedZoneHeads}
              onChange={(e) => setSelectedZoneHeads(Array.from(e.target.selectedOptions).map((o) => o.value))}
              className="p-2 w-full border rounded h-24"
            >
              {zoneHeads.map((zh) => <option key={zh._id} value={zh._id}>{zh.fullName || zh.email} • {zh.zone || "N/A"}</option>)}
            </select>
          </div>
        </div>
        <Button className="mt-3" onClick={assignTaskToZoneHeads}>Assign to Zone Heads</Button>
      </div>

      <div className="space-y-4">
        {tasks.filter(t => filter === "all" ? true : filter === "active" ? !!t.active : !t.active).map((t) => (
          <div key={t._id} className="p-4 border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{t.title}</div>
                <div className="text-sm text-muted-foreground">{t.zone || "All Zones"} • {t.points} pts</div>
              </div>
            </div>
            <div className="mt-2 text-sm">{t.description}</div>
            <div className="mt-2 text-xs text-muted-foreground">Deadline: {t.deadline ? new Date(t.deadline).toLocaleString() : '—'}</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => startEdit(t)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => deleteTask(t._id)}>Delete</Button>
              <Button size="sm" variant={t.active ? "secondary" : "ghost"} onClick={() => toggleActive(t._id, !!t.active)}>
                {t.active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
