"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Zap, Clock, Star, TrendingUp, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function CADashboard() {
  const { firebaseUser, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!firebaseUser) return router.push("/login")
    if (profile?.role && profile.role !== "CA") {
      // redirect non-CA to appropriate dashboard
      if (profile.role === "ADMIN") router.push("/admin")
      else if (profile.role === "ZONE_HEAD") router.push("/zone-head")
    }
  }, [firebaseUser, profile, loading, router])
  const stats = [
    { label: "Total Points", value: "1,250", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Zone Rank", value: "#04", icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Global Rank", value: "#42", icon: Trophy, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Completed", value: "12/15", icon: Zap, color: "text-green-500", bg: "bg-green-500/10" },
  ]

  const tasks = [
    { id: 1, title: "Social Media Campaign", deadline: "2 days left", points: 200, status: "Active", type: "Promo" },
    { id: 2, title: "University Tech Meetup", deadline: "4 days left", points: 500, status: "Pending", type: "Event" },
    { id: 3, title: "Content Creation", deadline: "Completed", points: 150, status: "Approved", type: "Digital" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2">Welcome Back, Alex!</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-none">North Zone</Badge>
            Chandigarh University Representative
          </p>
        </div>
        <Link href="/dashboard/tasks">
          <Button className="rounded-xl h-12 px-6 font-bold gap-2">
            View All Tasks <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-black mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
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
                <CardTitle className="text-xl font-black">Active Tasks</CardTitle>
                <CardDescription>Perform tasks to earn points and climb the ranks</CardDescription>
              </div>
              <Badge variant="outline">Weekly Cycle</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-secondary/10 text-secondary border-none text-[10px] font-black uppercase">
                      {task.type}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {task.deadline}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold mb-1">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">Potential Points: {task.points}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={task.status === "Approved" ? "outline" : "default"}
                      className="rounded-lg h-9 font-bold"
                    >
                      {task.status === "Approved" ? "View Submission" : "Submit Proof"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-border/50 bg-primary text-primary-foreground overflow-hidden relative">
            <CardHeader>
              <CardTitle className="text-xl font-black">Rewards Milestone</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Next reward: Official TechFest Hoodie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-end">
                <span className="text-3xl font-black">75%</span>
                <span className="text-xs font-bold uppercase">1,250 / 2,000 pts</span>
              </div>
              <Progress value={75} className="h-3 bg-white/20" />
              <p className="mt-6 text-sm font-medium leading-relaxed opacity-90">
                You're just 750 points away from qualifying for the TechFest Silver Tier rewards!
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 h-full w-1/4 bg-white/10 skew-x-12 translate-x-10" />
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-black">Weekly Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Star className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-bold">Points Finalization</div>
                  <p className="text-xs text-muted-foreground">This Sunday, 12:00 PM</p>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-xl font-bold h-11 bg-transparent">
                Evaluation Guidelines
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
