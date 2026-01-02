"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Trophy, Medal, Crown, Search, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LeaderboardPage() {
  const [view, setView] = useState("global")
  const [rankings, setRankings] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/leaderboard')
      if (res.ok) {
        const d = await res.json()
        // ✅ Filter out admin users
        const nonAdmins = (d.users || []).filter((u: any) => u.role !== "ADMIN")
        setRankings(nonAdmins)
      }
    }
    load()
  }, [])

  const podium = rankings.slice(0, 3)
  const rest = rankings.slice(3)

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#f8f2bf]/70" />
            <Input placeholder="Search ambassadors..." className="pl-10 h-12 rounded-xl bg-[#f8f2bf] border-none text-[#002263]" />
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
            <Card className="border-[#002263]/50 bg-[#f8f2bf] backdrop-blur-sm relative overflow-hidden pt-20 pb-8 px-6 text-center">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-[#002263]/20 flex items-center justify-center border-4 border-[#002263] text-2xl font-black">
                2
              </div>
              <div className="h-20 w-20 rounded-full bg-[#f8f2bf] flex items-center justify-center text-[#002263] mx-auto mb-4 border-2 border-[#002263]">
                <Medal className="h-10 w-10 text-[#890304]" />
              </div>
              <h3 className="font-black text-xl mb-1 text-[#002263]">{podium[1]?.fullName ?? podium[1]?.email}</h3>
              <p className="text-sm font-bold text-[#002263]/70 mb-4">{podium[1]?.zone ?? "—"} Zone</p>
              <div className="text-2xl font-black text-[#890304]">{podium[1]?.points ?? 0} PTS</div>
            </Card>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 10 }}
            className="order-1 md:order-2"
          >
            <Card className="border-[#890304]/50 bg-[#890304] backdrop-blur-sm relative overflow-hidden pt-25 pb-10 px-6 text-center shadow-2xl shadow-[#890304]/20 scale-105">
              <div className="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-[#f8f2bf] flex items-center justify-center border-4 border-[#f8f2bf] text-3xl font-black text-[#002263] animate-glow">
                1
              </div>
              <div className="h-24 w-24 rounded-full bg-[#f8f2bf] flex items-center justify-center text-[#890304] mx-auto mb-6 border-2 border-[#f8f2bf]">
                <Crown className="h-12 w-12" />
              </div>
              <h3 className="font-black text-2xl text-[#f8f2bf] mb-1">{podium[0]?.fullName ?? podium[0]?.email}</h3>
              <p className="text-sm font-bold text-[#f8f2bf]/80 mb-6">{podium[0]?.zone ?? "—"} Zone</p>
              <div className="text-4xl font-black text-[#f8f2bf]">{podium[0]?.points ?? 0} PTS</div>
            </Card>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="order-3"
          >
            <Card className="border-[#002263]/50 bg-[#f8f2bf] backdrop-blur-sm relative overflow-hidden pt-20 pb-8 px-6 text-center">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-[#890304]/30 flex items-center justify-center border-4 border-[#002263] text-2xl font-black">
                3
              </div>
              <div className="h-20 w-20 rounded-full bg-[#f8f2bf] flex items-center justify-center text-[#890304] mx-auto mb-4 border-2 border-[#002263]">
                <Trophy className="h-10 w-10" />
              </div>
              <h3 className="font-black text-xl mb-1 text-[#002263]">{podium[2]?.fullName ?? podium[2]?.email}</h3>
              <p className="text-sm font-bold text-[#002263]/70 mb-4">{podium[2]?.zone ?? "—"} Zone</p>
              <div className="text-2xl font-black text-[#890304]">{podium[2]?.points ?? 0} PTS</div>
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
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-[#f8f2bf] border border-[#002263]/50 hover:border-[#890304]/50 transition-all group">
                  <div className="text-2xl font-black text-[#002263] w-10">#{rank.id}</div>
                  <div className="h-12 w-12 rounded-full bg-[#002263]/10 flex items-center justify-center font-black text-lg text-[#002263]">
                    {((rank.fullName || rank.email) && (rank.fullName || rank.email).slice(0,2).toUpperCase()) || "—"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-[#002263]">{rank.fullName ?? rank.email}</h4>
                    <p className="text-sm font-medium text-[#002263]/70">{rank.zone ?? "—"} Zone</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-[#890304] mb-1">{rank.points ?? 0}</div>
                    <div className="flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-wider">
                      {rank.change === "up" && (
                        <>
                          <ArrowUp className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">Climbing</span>
                        </>
                      )}
                      {rank.change === "down" && (
                        <>
                          <ArrowDown className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">Falling</span>
                        </>
                      )}
                      {rank.change === "stable" && (
                        <>
                          <Minus className="h-3 w-3 text-[#002263]/60" />
                          <span className="text-[#002263]/60">Stable</span>
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
