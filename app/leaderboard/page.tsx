"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Trophy, Medal, Crown, Search, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LeaderboardPage() {
  const [view, setView] = useState("global")

  const globalRankings = [
    { id: 1, name: "Alex Rivard", zone: "North", points: 4250, change: "up", avatar: "AR" },
    { id: 2, name: "Sarah Chen", zone: "South", points: 4120, change: "down", avatar: "SC" },
    { id: 3, name: "Marcus Miller", zone: "West", points: 3980, change: "up", avatar: "MM" },
    { id: 4, name: "Elena K.", zone: "East", points: 3750, change: "stable", avatar: "EK" },
    { id: 5, name: "Jordan P.", zone: "North", points: 3600, change: "up", avatar: "JP" },
    { id: 6, name: "Riley S.", zone: "South", points: 3450, change: "down", avatar: "RS" },
    { id: 7, name: "Casey D.", zone: "West", points: 3320, change: "stable", avatar: "CD" },
    { id: 8, name: "Taylor L.", zone: "North", points: 3100, change: "up", avatar: "TL" },
  ]

  const podium = globalRankings.slice(0, 3)
  const rest = globalRankings.slice(3)

  return (
    <div className="min-h-screen py-20 px-4 bg-[#002263]">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white uppercase">
              The <span className="gradient-text">Hall of Fame</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Track the top performers from across the country. Points are finalized every Sunday at midnight.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <Tabs defaultValue="global" onValueChange={setView} className="w-full md:w-auto">
            <TabsList className="bg-[#f8f2bf] p-1 rounded-2xl h-12">
              <TabsTrigger value="global" className="rounded-xl px-8 font-bold">
                Global
              </TabsTrigger>
              <TabsTrigger value="north" className="rounded-xl px-8 font-bold">
                North
              </TabsTrigger>
              <TabsTrigger value="south" className="rounded-xl px-8 font-bold">
                South
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search ambassadors..." className="pl-10 h-12 rounded-xl bg-white border-none" />
          </div>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="order-2 md:order-1"
          >
            <Card className="border-border/50 bg-[#f8f2bf] backdrop-blur-sm relative overflow-hidden pt-20 pb-8 px-6 text-center">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-slate-300 flex items-center justify-center border-4 border-background text-2xl font-black">
                2
              </div>
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4 border-2 border-slate-200">
                <Medal className="h-10 w-10" />
              </div>
              <h3 className="font-black text-xl mb-1">{podium[1].name}</h3>
              <p className="text-sm font-bold text-muted-foreground mb-4">{podium[1].zone} Zone</p>
              <div className="text-2xl font-black text-primary">{podium[1].points} PTS</div>
            </Card>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 10 }}
            className="order-1 md:order-2"
          >
            <Card className="border-primary/30 bg-[#890304] backdrop-blur-sm relative overflow-hidden pt-25 pb-10 px-6 text-center shadow-2xl shadow-primary/20 scale-105">
              <div className="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-yellow-400 flex items-center justify-center border-4 border-background text-3xl font-black text-white animate-glow">
                1
              </div>
              <div className="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mx-auto mb-6 border-2 border-yellow-200">
                <Crown className="h-12 w-12" />
              </div>
              <h3 className="font-black text-2xl text-white mb-1">{podium[0].name}</h3>
              <p className="text-sm font-bold text-white mb-6">{podium[0].zone} Zone</p>
              <div className="text-4xl font-black text-white">{podium[0].points} PTS</div>
            </Card>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="order-3"
          >
            <Card className="border-border/50 bg-[#f8f2bf] backdrop-blur-sm relative overflow-hidden pt-20 pb-8 px-6 text-center">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-amber-600/40 flex items-center justify-center border-4 border-background text-2xl font-black">
                3
              </div>
              <div className="h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-4 border-2 border-amber-100">
                <Trophy className="h-10 w-10" />
              </div>
              <h3 className="font-black text-xl mb-1">{podium[2].name}</h3>
              <p className="text-sm font-bold text-muted-foreground mb-4">{podium[2].zone} Zone</p>
              <div className="text-2xl font-black text-primary">{podium[2].points} PTS</div>
            </Card>
          </motion.div>
        </div>

        {/* Rest of Rankings */}
        <div className="space-y-4">
          <AnimatePresence>
            {rest.map((rank, i) => (
              <motion.div
                key={rank.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group">
                  <div className="text-2xl font-black text-muted-foreground w-10">#{rank.id}</div>
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-black text-lg">
                    {rank.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{rank.name}</h4>
                    <p className="text-sm font-medium text-muted-foreground">{rank.zone} Zone</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-primary mb-1">{rank.points}</div>
                    <div className="flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-wider">
                      {rank.change === "up" && (
                        <>
                          <ArrowUp className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">Climbing</span>
                        </>
                      )}
                      {rank.change === "down" && (
                        <>
                          <ArrowDown className="h-3 w-3 text-destructive" />
                          <span className="text-destructive">Falling</span>
                        </>
                      )}
                      {rank.change === "stable" && (
                        <>
                          <Minus className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Stable</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
