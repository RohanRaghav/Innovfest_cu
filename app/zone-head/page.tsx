"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ClipboardCheck,
  Download,
  Plus,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

type OverviewResponse = {
  zone: string
  totals: {
    campusAmbassadors: number
    caLimit: number
    students: number
    targetsAssigned: number
    registrations: number
    badgesUnlocked: number
  }
  campusAmbassadors: {
    id: string
    name: string | null
    email: string
    phone?: string | null
    college?: string | null
    target: number | null
    currentCount: number
    isActive: boolean
    createdAt: string
  }[]
  recentStudents: {
    id: string
    name: string
    email: string
    college: string
    phone: string
    createdAt: string
    registeredById: string
  }[]
}

const emptyOverview: OverviewResponse = {
  zone: "ZONE",
  totals: {
    campusAmbassadors: 0,
    caLimit: 50,
    students: 0,
    targetsAssigned: 0,
    registrations: 0,
    badgesUnlocked: 0,
  },
  campusAmbassadors: [],
  recentStudents: [],
}

export default function ZoneHeadDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()

  const [overview, setOverview] = useState<OverviewResponse>(emptyOverview)
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creatingCA, setCreatingCA] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    target: "",
  })
  const [targetDrafts, setTargetDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/zonal/login")
    }
    if (status === "authenticated" && session?.user.role !== "ZONAL_HEAD") {
      router.push("/unauthorized")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== "authenticated" || session?.user.role !== "ZONAL_HEAD") return

    const loadOverview = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/zonal/overview", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load zone overview")
        const data = (await res.json()) as OverviewResponse
        setOverview(data)
        setTargetDrafts(
          data.campusAmbassadors.reduce<Record<string, string>>((acc, ca) => {
            acc[ca.id] = ca.target?.toString() ?? ""
            return acc
          }, {}),
        )
      } catch (error: any) {
        toast({
          title: "Unable to load dashboard",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadOverview()
  }, [session, status, toast])

  const summaryCards = useMemo(
    () => [
      {
        label: "Campus Ambassadors",
        value: `${overview.totals.campusAmbassadors}/${overview.totals.caLimit}`,
        description: "Slots assigned",
        icon: Users,
        accent: "text-primary",
      },
      {
        label: "Targets Assigned",
        value: overview.totals.targetsAssigned.toLocaleString(),
        description: "Total student goals",
        icon: BarChart3,
        accent: "text-amber-500",
      },
      {
        label: "Registrations",
        value: overview.totals.registrations.toLocaleString(),
        description: "Verified students",
        icon: ClipboardCheck,
        accent: "text-green-500",
      },
      {
        label: "Badges Unlocked",
        value: overview.totals.badgesUnlocked.toLocaleString(),
        description: "Motivation score",
        icon: BadgeCheck,
        accent: "text-purple-500",
      },
    ],
    [overview],
  )

  const refreshOverview = async () => {
    const res = await fetch("/api/zonal/overview", { cache: "no-store" })
    if (res.ok) {
      const data = (await res.json()) as OverviewResponse
      setOverview(data)
      setTargetDrafts(
        data.campusAmbassadors.reduce<Record<string, string>>((acc, ca) => {
          acc[ca.id] = ca.target?.toString() ?? ""
          return acc
        }, {}),
      )
    }
  }

  const handleCreateCA = async () => {
    try {
      setCreatingCA(true)
      const payload = {
        ...createForm,
        target: createForm.target ? Number(createForm.target) : undefined,
      }
      const res = await fetch("/api/zonal/campus-ambassadors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Unable to create campus ambassador")
      }

      toast({ title: "Campus Ambassador added", description: `${createForm.name} has been onboarded` })
      setCreateDialogOpen(false)
      setCreateForm({ name: "", email: "", phone: "", college: "", target: "" })
      await refreshOverview()
    } catch (error: any) {
      toast({ title: "Failed to add ambassador", description: error.message, variant: "destructive" })
    } finally {
      setCreatingCA(false)
    }
  }

  const handleUpdateTarget = async (caId: string) => {
    try {
      const draft = targetDrafts[caId]
      const targetValue = draft ? Number(draft) : 0
      const res = await fetch(`/api/zonal/campus-ambassadors/${caId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetValue }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Unable to update target")
      }

      toast({ title: "Target updated" })
      await refreshOverview()
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">
            {overview.zone} Zone Command
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            Zonal Head
            <Badge className="bg-primary/10 text-primary border-none">
              {overview.totals.campusAmbassadors} Ambassadors
            </Badge>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-12 px-6 font-bold bg-transparent gap-2"
            onClick={async () => {
              const res = await fetch("/api/admin/export-states")
              if (!res.ok) {
                toast({ title: "Export failed", description: "Unable to download report", variant: "destructive" })
                return
              }
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${overview.zone.toLowerCase()}-zone-report.csv`
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="h-4 w-4" /> Export Zone Data
          </Button>
          <Button className="rounded-xl h-12 px-6 font-bold gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Onboard CA
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50 shadow-sm border-l-4 border-l-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-6 w-6 ${stat.accent}`} />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.description}</span>
                </div>
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="ambassadors" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-full md:w-auto">
          <TabsTrigger value="ambassadors" className="rounded-xl h-full px-8 font-bold data-[state=active]:shadow-lg">
            Campus Ambassadors
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-xl h-full px-8 font-bold data-[state=active]:shadow-lg">
            Recent Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ambassadors" className="mt-0 space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Ambassador Bench</CardTitle>
              <CardDescription>Assign targets and track progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overview.campusAmbassadors.length === 0 && (
                <p className="text-sm text-muted-foreground">No ambassadors onboarded yet. Start by adding one.</p>
              )}
              {overview.campusAmbassadors.map((ca) => {
                const target = ca.target ?? 0
                const progressTotal = target > 0 ? Math.min(100, Math.round((ca.currentCount / target) * 100)) : 0
                return (
                  <div key={ca.id} className="p-4 border border-border/50 rounded-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{ca.name ?? ca.email}</p>
                        <p className="text-sm text-muted-foreground">{ca.college ?? "No college listed"}</p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <p className="font-semibold">{ca.currentCount}</p>
                          <p className="text-muted-foreground">Registrations</p>
                        </div>
                        <div>
                          <p className="font-semibold">{target}</p>
                          <p className="text-muted-foreground">Target</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progressTotal}%` }}
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="text-xs text-muted-foreground">
                          {target > 0 ? `${progressTotal}% towards goal` : "No target assigned"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={targetDrafts[ca.id] ?? ""}
                            onChange={(e) =>
                              setTargetDrafts((prev) => ({
                                ...prev,
                                [ca.id]: e.target.value,
                              }))
                            }
                            placeholder="Set target"
                            className="w-28 h-9"
                            type="number"
                            min={0}
                          />
                          <Button size="sm" variant="outline" onClick={() => handleUpdateTarget(ca.id)}>
                            Save target
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Recent Registrations</CardTitle>
              <CardDescription>Latest students added by your ambassadors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overview.recentStudents.length === 0 && (
                <p className="text-sm text-muted-foreground">No students registered yet.</p>
              )}
              {overview.recentStudents.map((student) => (
                <div key={student.id} className="p-4 border border-border/50 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.college}</p>
                  </div>
                  <div className="text-sm">
                    <p>{student.email}</p>
                    <p className="text-muted-foreground">{student.phone}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black">Performance Insights</CardTitle>
            <CardDescription>Keep ambassadors motivated with timely actions</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="font-bold text-primary" onClick={() => router.push("/zone-head/ambassadors")}>
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border/50 rounded-xl">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Average Target per CA</p>
              <p className="text-2xl font-black">
                {overview.totals.campusAmbassadors
                  ? Math.round(overview.totals.targetsAssigned / overview.totals.campusAmbassadors)
                  : 0}
              </p>
            </div>
            <div className="p-4 border border-border/50 rounded-xl">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Average Completion Rate</p>
              <p className="text-2xl font-black">
                {overview.totals.targetsAssigned
                  ? Math.min(
                      100,
                      Math.round((overview.totals.registrations / overview.totals.targetsAssigned) * 100),
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onboard Campus Ambassador</DialogTitle>
            <DialogDescription>New ambassadors will receive login credentials automatically via email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Priya Sharma"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ambassador@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={createForm.phone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input
                id="college"
                placeholder="University / Institute"
                value={createForm.college}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, college: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target (students)</Label>
              <Input
                id="target"
                type="number"
                min={0}
                placeholder="e.g. 30"
                value={createForm.target}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, target: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCA} disabled={creatingCA || !createForm.name || !createForm.email}>
              {creatingCA ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
