"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, Map, Users, Settings2, Plus, Download, ChevronRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"

const AllUsers = dynamic(() => import("@/components/admin/all-users"), { ssr: false })
const TaskEngine = dynamic(() => import("@/components/admin/task-engine"), { ssr: false })
const SubmissionsAdmin = dynamic(() => import("@/components/admin/submissions"), { ssr: false })

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function AdminDashboard() {
  const { firebaseUser, profile, loading } = useAuth()
  const router = useRouter()
  const [zonesData, setZonesData] = useState<any[]>([])
  const [activeTasksCount, setActiveTasksCount] = useState<number | null>(null)
  const [totalAdmins, setTotalAdmins] = useState<number | null>(null)

  useEffect(() => {
    if (loading) return
    if (!firebaseUser) return router.push("/login")
    if (profile?.role && profile.role !== "ADMIN") {
      if (profile.role === "ZONE_HEAD") router.push("/zone-head")
      else router.push("/dashboard")
    }

    async function loadAdminData() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const headers: any = {}
      if (token) headers.Authorization = `Bearer ${token}`

      // zones
      const z = await fetch('/api/admin/zones', { headers })
      if (z.ok) {
        const d = await z.json()
        setZonesData(d.zones || [])
      }
      // tasks
      const t = await fetch('/api/tasks', { headers })
      if (t.ok) {
        const td = await t.json()
        setActiveTasksCount((td.tasks || []).filter((tt: any) => !!tt.active).length)
      }
      // admins
      const u = await fetch('/api/admin/users', { headers })
      if (u.ok) {
        const ud = await u.json()
        setTotalAdmins((ud || []).filter((x: any) => x.role === 'ADMIN').length)
      }
    }

    loadAdminData()
  }, [firebaseUser, profile, loading, router])

  const totalZones = zonesData.length
  const totalAmbassadors = zonesData.reduce((s, z) => s + (z.ambassadors || 0), 0)
  const systemStats = [
    { label: "Total Zones", value: String(totalZones), icon: Map, color: "text-primary" },
    { label: "Total Ambassadors", value: String(totalAmbassadors), icon: Users, color: "text-secondary" },
    { label: "Active Tasks", value: activeTasksCount !== null ? String(activeTasksCount) : "—", icon: Activity, color: "text-green-500" },
    { label: "Core Team", value: totalAdmins !== null ? String(totalAdmins) : "—", icon: Shield, color: "text-orange-500" },
  ]

  const zones = [
    { name: "North Zone", head: "Marcus Thorne", count: 124, trend: "+12%" },
    { name: "South Zone", head: "Elena Rodriguez", count: 156, trend: "+8%" },
    { name: "East Zone", head: "Anand Gupta", count: 98, trend: "+5%" },
    { name: "West Zone", head: "Sarah Jenkins", count: 112, trend: "+15%" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Core Command Center</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            System Admin <Badge className="bg-foreground text-background border-none px-3">TechFest Core</Badge>
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={async () => {
            const res = await fetch('/api/admin/export-states')
            if (!res.ok) return alert('Failed to export')
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'users_states.csv'
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
          }} variant="outline" className="rounded-xl h-12 px-6 font-bold bg-transparent gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <Button className="rounded-xl h-12 px-6 font-bold gap-2">
            <Plus className="h-4 w-4" /> New Zone
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 shadow-sm border-l-4 border-l-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  <Settings2 className="h-4 w-4 text-muted-foreground hover:rotate-90 transition-transform cursor-pointer" />
                </div>
                <div className="text-4xl font-black mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
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
          <TabsTrigger value="logs" className="rounded-xl h-full px-8 font-bold data-[state=active]:shadow-lg">
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/50 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl font-black">Zone Performance Matrix</CardTitle>
                <CardDescription>
                  Real-time oversight of all operational zones and their respective heads
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 text-xs font-black uppercase tracking-widest text-muted-foreground border-y border-border/50">
                        <th className="px-6 py-4">Zone Name</th>
                        <th className="px-6 py-4">Zone Head</th>
                        <th className="px-6 py-4">Ambassadors</th>
                        <th className="px-6 py-4">Growth</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {zonesData.map((zone, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-4 font-black">{zone.zone}</td>
                          <td className="px-6 py-4 font-bold text-muted-foreground">{zone.head ?? '-'}</td>
                          <td className="px-6 py-4 font-bold">{zone.ambassadors}</td>
                          <td className="px-6 py-4">
                            <span className="text-green-500 font-bold">—</span>
                          </td>
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
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black">All Users</CardTitle>
              <CardDescription>Manage users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4">
                <AllUsers />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Global Task Configuration</CardTitle>
              <CardDescription>Define system-wide tasks and their relative point weights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4">
                {/* TaskEngine client component */}
                <TaskEngine />
              </div>
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
              <div className="p-4">
                <SubmissionsAdmin />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Audit Logs / System Backfill</CardTitle>
              <CardDescription>Run system-level maintenance tasks from here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 space-y-4">
                <div className="flex gap-2 items-center">
                  <Button onClick={async () => {
                    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                    if (!token) return alert('Please login as ADMIN')
                    if (!confirm('Run full backfill to assign zones for all CAs? This will update zone and zoneHead links across the system.')) return
                    try {
                      const res = await fetch('/api/admin/assign-zones', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
                      const d = res.ok ? await res.json().catch(() => ({})) : (await res.json().catch(() => ({})))
                      alert('Backfill complete. Updated: ' + (d.updated ?? 'unknown'))
                      // reload zones and stats
                      const z = await fetch('/api/admin/zones')
                      if (z.ok) {
                        const dd = await z.json().catch(() => ({}))
                        setZonesData(dd.zones || [])
                      }
                    } catch (e) {
                      alert('Backfill failed: ' + String(e))
                    }
                  }} className="px-4 py-2 rounded bg-secondary text-white">Backfill Assign Zones</Button>
                  <div className="text-sm text-muted-foreground">Use this to re-run the zone→zoneHead assignment for the whole system.</div>
                </div>

                <div>
                  <div className="font-bold mb-2">Audit Notes</div>
                  <div className="text-sm text-muted-foreground">Triggering the backfill will update CA records' <code>zone</code>, <code>zoneHeadId</code> and <code>zoneHeadName</code> fields based on canonical mapping and configured zones. It does not change tasks or submissions.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
