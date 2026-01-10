 "use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { BadgeCheck, ChevronRight, Download, Map, Plus, Shield, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

const AllUsers = dynamic(() => import("@/components/admin/all-users"), { ssr: false })
const TaskEngine = dynamic(() => import("@/components/admin/task-engine"), { ssr: false })
const SubmissionsAdmin = dynamic(() => import("@/components/admin/submissions"), { ssr: false })

type Zone = "EAST" | "WEST" | "NORTH" | "SOUTH"

type OverviewResponse = {
  totals: {
    zonalHeads: number
    campusAmbassadors: number
    students: number
    remainingSlots: number
    badgeUnlocks: number
  }
  zoneStats: {
    zone: Zone
    head: {
      id: string
      name: string
      email: string
      phone?: string | null
      createdAt: string
    } | null
    caCount: number
    caLimit: number
    studentCount: number
    caTargetTotal: number
    caCurrentTotal: number
  }[]
  recentZonalHeads: {
    id: string
    name: string
    email: string
    zone: Zone | null
    createdAt: string
  }[]
}

const ZONE_OPTIONS: { label: string; value: Zone }[] = [
  { label: "East", value: "EAST" },
  { label: "West", value: "WEST" },
  { label: "North", value: "NORTH" },
  { label: "South", value: "SOUTH" },
]

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()

  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creatingHead, setCreatingHead] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    zone: "EAST" as Zone,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/admin/login")
    }
    if (status === "authenticated" && session?.user.role !== "ADMIN") {
      router.push("/unauthorized")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== "authenticated" || session?.user.role !== "ADMIN") return

    const loadOverview = async () => {
      try {
        setLoadingDashboard(true)
        const res = await fetch("/api/admin/overview", {
          method: "GET",
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Failed to load overview")
        const data = (await res.json()) as OverviewResponse
        setOverview(data)
      } catch (error: any) {
        toast({
          title: "Failed to load dashboard",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoadingDashboard(false)
      }
    }

    loadOverview()
  }, [session, status, toast])

  const summaryCards = useMemo(() => {
    return [
      {
        label: "Zonal Heads",
        value: overview ? `${overview.totals.zonalHeads}/4` : "—",
        icon: Shield,
        description: "Required coverage (4 zones)",
      },
      {
        label: "Campus Ambassadors",
        value: overview ? `${overview.totals.campusAmbassadors}/200` : "—",
        icon: Users,
        description: `${overview?.totals.remainingSlots ?? "--"} slots remaining`,
      },
      {
        label: "Registered Students",
        value: overview ? overview.totals.students.toLocaleString() : "—",
        icon: Map,
        description: "Total mapped registrations",
      },
      {
        label: "Badges Unlocked",
        value: overview ? overview.totals.badgeUnlocks.toLocaleString() : "—",
        icon: BadgeCheck,
        description: "Across all ambassadors",
      },
    ]
  }, [overview])

  const handleCreateZonalHead = async () => {
    try {
      setCreatingHead(true)
      const res = await fetch("/api/admin/zonal-heads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to create zonal head")
      }

      toast({ title: "Zonal head created", description: `${form.name} has been onboarded.` })
      setCreateDialogOpen(false)
      setForm({ name: "", email: "", phone: "", zone: "EAST" })

      // Refresh overview
      const snapshot = await fetch("/api/admin/overview", { cache: "no-store" })
      if (snapshot.ok) {
        setOverview(await snapshot.json())
      }
    } catch (error: any) {
      toast({
        title: "Failed to create zonal head",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCreatingHead(false)
    }
  }

  const isLoading = status === "loading" || loadingDashboard

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Core Command Center</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            System Admin <Badge className="bg-foreground text-background border-none px-3">InnovFest HQ</Badge>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={async () => {
              const res = await fetch("/api/admin/export-states")
              if (!res.ok) {
                toast({
                  title: "Export failed",
                  description: "Unable to download report",
                  variant: "destructive",
                })
                return
              }
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = "innovfest-report.csv"
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            }}
            variant="outline"
            className="rounded-xl h-12 px-6 font-bold bg-transparent gap-2"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <Button
            className="rounded-xl h-12 px-6 font-bold gap-2"
            onClick={() => setCreateDialogOpen(true)}
            disabled={overview?.totals.zonalHeads === 4}
          >
            <Plus className="h-4 w-4" /> Add Zonal Head
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-border/50 shadow-sm border-l-4 border-l-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    {stat.description}
                  </span>
                </div>
                <div className="text-4xl font-black mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="zones" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-full md:w-auto">
          <TabsTrigger value="zones" className="rounded-xl h-full px-8 font-bold data-[state=active]:shadow-lg">
            Zone Management
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl h-full px-8 font-bold data-[state=active]:shadow-lg">
            All Users
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-xl h-full px-8 font-bold data-[state=active]:shadow-lg">
            Task Engine
          </TabsTrigger>
          <TabsTrigger value="submissions" className="rounded-xl h-full px-8 font-bold data-[state=active]:shadow-lg">
            Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="mt-0">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <Card className="border-border/50 xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl font-black">Zone Performance Matrix</CardTitle>
                <CardDescription>Live status for every operational corridor</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 text-xs font-black uppercase tracking-widest text-muted-foreground border-y border-border/50">
                        <th className="px-6 py-4">Zone</th>
                        <th className="px-6 py-4">Head</th>
                        <th className="px-6 py-4">Campus Ambassadors</th>
                        <th className="px-6 py-4">Registrations</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {(overview?.zoneStats || ZONE_OPTIONS.map((z) => ({ zone: z.value }))).map((zoneStat) => (
                        <tr key={zoneStat.zone} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-4 font-black">{zoneStat.zone}</td>
                          <td className="px-6 py-4">
                            {zoneStat.head ? (
                              <div className="flex flex-col">
                                <span className="font-bold">{zoneStat.head.name}</span>
                                <span className="text-sm text-muted-foreground">{zoneStat.head.email}</span>
                              </div>
                            ) : (
                              <Badge variant="outline" className="font-semibold text-xs">
                                Unassigned
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {zoneStat.caCount ?? 0} / {zoneStat.caLimit ?? 50}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Target {zoneStat.caTargetTotal ?? 0} • Prog {zoneStat.caCurrentTotal ?? 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold">{zoneStat.studentCount ?? 0}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl font-black">Latest Zonal Heads</CardTitle>
                <CardDescription>Recent authority assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(overview?.recentZonalHeads || []).map((head) => (
                  <div key={head.id} className="flex items-start justify-between rounded-xl border border-border/50 p-3">
                    <div>
                      <p className="font-semibold">{head.name}</p>
                      <p className="text-sm text-muted-foreground">{head.email}</p>
                      <Badge variant="secondary" className="mt-2">
                        {head.zone ?? "Unmapped"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(head.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {!overview?.recentZonalHeads?.length && (
                  <p className="text-sm text-muted-foreground">No zonal heads onboarded yet.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => setCreateDialogOpen(true)}>
                  Assign New Head
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black">All Users</CardTitle>
              <CardDescription>Manage users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <AllUsers />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Global Task Configuration</CardTitle>
              <CardDescription>Define system-wide tasks and point weights</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskEngine />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Submissions</CardTitle>
              <CardDescription>Review submitted proofs from ambassadors</CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionsAdmin />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Zonal Head</DialogTitle>
            <DialogDescription>Assign leadership for one of the four national zones.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Arjun Malhotra"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="zonal.head@example.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Zone</Label>
              <Select
                value={form.zone}
                onValueChange={(value: Zone) => setForm((prev) => ({ ...prev, zone: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {ZONE_OPTIONS.map((zone) => (
                    <SelectItem value={zone.value} key={zone.value}>
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateZonalHead} disabled={creatingHead || !form.name || !form.email}>
              {creatingHead ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
