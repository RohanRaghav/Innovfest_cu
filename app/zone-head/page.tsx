"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, ClipboardCheck, AlertCircle, BarChart3, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function ZoneHeadDashboard() {
  const { firebaseUser, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!firebaseUser) return router.push("/login")
    if (profile?.role && profile.role !== "ZONE_HEAD") {
      if (profile.role === "ADMIN") router.push("/admin")
      else if (profile.role === "CA") router.push("/dashboard")
    }
  }, [firebaseUser, profile, loading, router])
  const stats = [
    { label: "Active Ambassadors", value: "124", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Reviews", value: "18", icon: ClipboardCheck, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Avg. Consistency", value: "88%", icon: BarChart3, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Urgent Actions", value: "02", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  ]

  const submissions = [
    { id: 1, name: "Sarah Miller", task: "Event Promotion", time: "2h ago", status: "Pending" },
    { id: 2, name: "David Chen", task: "Social Media Campaign", time: "5h ago", status: "Pending" },
    { id: 3, name: "Emma Wilson", task: "Content Creation", time: "1d ago", status: "Pending" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2">North Zone Control</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            Zone Head: <span className="text-primary font-bold">Marcus Thorne</span>
            <Badge className="bg-primary/10 text-primary border-none">124 Members</Badge>
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-xl h-12 px-6 font-bold bg-transparent">
            View Analytics
          </Button>
          <Button className="rounded-xl h-12 px-6 font-bold">Create New Task</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardContent className="pt-6">
                <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">Weekly Review Queue</CardTitle>
                <CardDescription>Evaluate proof of work from your zone's ambassadors</CardDescription>
              </div>
              <Link href="/zone-head/reviews">
                <Button variant="ghost" size="sm" className="font-bold text-primary">
                  See All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl border border-border/50 flex flex-col sm:row sm:items-center justify-between gap-4 group hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                      {sub.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-none mb-1">{sub.name}</h4>
                      <p className="text-xs text-muted-foreground">Task: {sub.task}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-muted-foreground">{sub.time}</span>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                        <XCircle className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-border/50 bg-secondary text-secondary-foreground">
            <CardHeader>
              <CardTitle className="text-xl font-black">Zone Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: "Sarah Miller", pts: 2450, rank: 1 },
                { name: "John Smith", pts: 2100, rank: 2 },
                { name: "Alex Johnson", pts: 1850, rank: 3 },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm opacity-50">0{member.rank}</span>
                    <span className="font-bold text-sm">{member.name}</span>
                  </div>
                  <span className="text-sm font-black">{member.pts} pts</span>
                </div>
              ))}
              <Button variant="secondary" className="w-full rounded-xl font-bold h-11 border-none shadow-lg">
                View Full Zone List
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-black">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 text-sm font-bold">
                Friday Evaluation: 24h Remaining
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Remember to finalize all pending reviews by Friday midnight to ensure leaderboard accuracy for Sunday.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
