"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function ZoneHeadTaskEngine() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [assignedTasks, setAssignedTasks] = useState<any[]>([])
  const [cas, setCAs] = useState<any[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedCAs, setSelectedCAs] = useState<string[]>([])
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null)
  const [submissionURL, setSubmissionURL] = useState("")
  const [fetching, setFetching] = useState(false)

  // New task state for create & assign
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPoints, setNewTaskPoints] = useState<number>(0)
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([])
  const [newTaskDeadline, setNewTaskDeadline] = useState<string>("")

  useEffect(() => {
    if (loading) return
    if (!profile) return router.push("/login")
    if (profile?.role !== "ZONE_HEAD") return router.push("/")
    fetchAssignedTasks()
    fetchCAs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, loading])

  async function fetchAssignedTasks() {
    setFetching(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return setFetching(false)
    const res = await fetch("/api/assignments", { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    const tasks = data.assignments || []
    // Filter to only tasks assigned to this zone-head (assigneeId matches profile._id)
    const myTasks = tasks.filter((a: any) => a.assigneeId === profile?._id)

    // Fetch task docs for each unique taskId so we can show title/deadline in the UI
    const ids: string[] = Array.from(new Set(myTasks.map((a: any) => a.taskId).filter(Boolean))) as string[]
    const taskMap: Record<string, any> = {}
    await Promise.all(ids.map(async (id: string) => {
      try {
        const r = await fetch(`/api/tasks/${id}`)
        if (r.ok) {
          const d = await r.json()
          if (d && d.task) taskMap[id] = d.task
        }
      } catch (e) {
        // ignore
      }
    }))

    const enriched = myTasks.map((a: any) => ({ ...a, taskTitle: taskMap[a.taskId]?.title || null, taskDeadline: taskMap[a.taskId]?.deadline || null }))
    setAssignedTasks(enriched)
    setFetching(false)
  }

  async function fetchCAs() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      const myZone = (profile as any)?.zone || (profile as any)?.pinCode || null
      const myName = (profile as any)?.fullName || profile?.email
      const zoneCAs = (data.users || []).filter((u: any) => u.role === "CA" && (
        u.zoneHeadId === profile?._id || u.zone === myZone || u.pinCode === myZone || u.zoneHeadName === myName || u.zoneHeadName === profile?.email
      ))
      setCAs(zoneCAs)
    }
  }

  async function assignTask() {
    if (!selectedTaskId) return alert("Select a task")
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ taskId: selectedTaskId, assigneeIds: selectedCAs }),
    })
    if (res.ok) {
      alert("Task assigned to CAs")
      setSelectedTaskId(null)
      setSelectedCAs([])
      fetchAssignedTasks()
    } else {
      const err = await res.json().catch(() => ({}))
      alert("Failed: " + (err?.error || res.status))
    }
  }

  async function uploadAndSubmit(taskAssignmentId: string) {
    if (!submissionURL) return alert("Enter media URL")
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")

    const assignment = assignedTasks.find((a) => a._id === taskAssignmentId)
    if (!assignment) return alert("Task not found")

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ taskId: assignment.taskId, mediaUrl: submissionURL }),
    })
    if (res.ok) {
      alert("Submission created!")
      setSubmittingTaskId(null)
      setSubmissionURL("")
      fetchAssignedTasks()
    } else {
      const err = await res.json().catch(() => ({}))
      alert("Failed: " + (err?.error || res.status))
    }
  }

  async function assignNewTask() {
    if (!newTaskTitle) return alert("Enter a title for the task")
    if (!newTaskAssignees || !newTaskAssignees.length) return alert("Select at least one CA to assign")
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login")

    const payload = {
      task: {
        title: newTaskTitle,
        description: newTaskDescription,
        points: newTaskPoints,
        deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : undefined,
      },
      assigneeIds: newTaskAssignees,
    }

    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      alert('Task created and assigned')
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskPoints(0)
      setNewTaskAssignees([])
      setNewTaskDeadline('')
      fetchAssignedTasks()
    } else {
      const err = await res.json().catch(() => ({}))
      alert('Failed: ' + (err?.error || res.status))
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Task Engine</h2>

      <div className="p-4 border rounded-xl">
        <div className="font-bold mb-3">Assign Task to Your CAs</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Select Task</Label>
            <select
              value={selectedTaskId || ""}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="p-2 w-full border rounded"
            >
              <option value="">Choose a task...</option>
              {assignedTasks.filter(t => t.status === "PENDING").map((t) => (
                <option key={t._id} value={t.taskId}>
                  Task: {t.taskId} • Points: {t.points}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Select CAs</Label>
            <select
              multiple
              value={selectedCAs}
              onChange={(e) => setSelectedCAs(Array.from(e.target.selectedOptions).map((o) => o.value))}
              className="p-2 w-full border rounded h-24"
            >
              {cas.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName || c.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button className="mt-3" onClick={assignTask}>Assign Task</Button>

        <hr className="my-4" />

        <div className="font-bold mb-3">Create & Assign New Task</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Title</Label>
            <Input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Short task title" />
          </div>
          <div>
            <Label>Points (optional)</Label>
            <Input type="number" value={String(newTaskPoints)} onChange={(e) => setNewTaskPoints(Number(e.target.value))} />
          </div>
          <div>
            <Label>Deadline (optional)</Label>
            <Input type="datetime-local" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Description (optional)</Label>
            <Textarea value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} placeholder="Describe the task" />
          </div>
          <div className="md:col-span-2">
            <Label>Select CAs to assign</Label>
            <select
              multiple
              value={newTaskAssignees}
              onChange={(e) => setNewTaskAssignees(Array.from(e.target.selectedOptions).map((o) => o.value))}
              className="p-2 w-full border rounded h-24"
            >
              {cas.map((c) => (
                <option key={c._id} value={c._id}>{c.fullName || c.email}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={assignNewTask}>Create & Assign</Button>
          <Button variant="outline" onClick={() => {
            setNewTaskTitle("")
            setNewTaskDescription("")
            setNewTaskPoints(0)
            setNewTaskAssignees([])
          }}>Reset</Button>
        </div>
      </div>
{/*}
      <div>
        <h3 className="font-bold mb-3">Your Assigned Tasks</h3>
        <div className="space-y-3">
          {assignedTasks.map((task) => (
            <div key={task._id} className="p-3 border rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{task.taskTitle ? task.taskTitle : `Task ID: ${task.taskId}`}</div>
                  <div className="text-sm text-muted-foreground">
                    Points: {task.points} • Status: {task.status}
                  </div>
                  <div className="text-xs text-muted-foreground">Deadline: {task.taskDeadline ? new Date(task.taskDeadline).toLocaleString() : '—'}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${task.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {task.status}
                </span>
              </div>

              {task.status === "PENDING" && (
                <div className="mt-3 p-3 bg-muted rounded">
                  {submittingTaskId === task._id ? (
                    <div className="space-y-2">
                      <Label>Media URL</Label>
                      <Input
                        value={submissionURL}
                        onChange={(e) => setSubmissionURL(e.target.value)}
                        placeholder="https://..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => uploadAndSubmit(task._id)}>Submit</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSubmittingTaskId(null)
                            setSubmissionURL("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => setSubmittingTaskId(task._id)}>Submit Proof</Button>
                  )}
                </div>
              )}
            </div>
          ))}
          {!assignedTasks.length && <p className="text-muted-foreground">No tasks assigned yet</p>}
        </div>
      </div>
*/}
      <div>
        <h3 className="font-bold mb-3">Your CAs ({cas.length})</h3>
        <div className="space-y-2">
          {cas.map((ca) => (
            <div key={ca._id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-bold">{ca.fullName || ca.email}</div>
                <div className="text-xs text-muted-foreground">
                  Tasks: {ca.tasksDone || 0} • Points: {ca.points || 0}
                </div>
              </div>
            </div>
          ))}
          {!cas.length && <p className="text-muted-foreground">No CAs in your zone</p>}
        </div>
      </div>
    </div>
  )
}
