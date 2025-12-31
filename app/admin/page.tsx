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

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function AdminDashboard() {
  const { firebaseUser, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!firebaseUser) return router.push("/login")
    if (profile?.role && profile.role !== "ADMIN") {
      if (profile.role === "ZONE_HEAD") router.push("/zone-head")
      else router.push("/dashboard")
    }
  }, [firebaseUser, profile, loading, router])

  const systemStats = [
    { label: "Total Zones", value: "04", icon: Map, color: "text-primary" },
    { label: "Total Ambassadors", value: "842", icon: Users, color: "text-secondary" },
    { label: "Active Tasks", value: "24", icon: Activity, color: "text-green-500" },
    { label: "Core Team", value: "12", icon: Shield, color: "text-orange-500" },
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
          <Button variant="outline" className="rounded-xl h-12 px-6 font-bold bg-transparent gap-2">
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
                      {zones.map((zone, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-4 font-black">{zone.name}</td>
                          <td className="px-6 py-4 font-bold text-muted-foreground">{zone.head}</td>
                          <td className="px-6 py-4 font-bold">{zone.count}</td>
                          <td className="px-6 py-4">
                            <span className="text-green-500 font-bold">{zone.trend}</span>
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
      </Tabs>
    </div>
  )
}
