"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Gift, Smartphone, Monitor, Star, ShieldCheck, Award } from "lucide-react"

export default function RewardsPage() {
  const tiers = [
    {
      rank: "Top 100-150",
      title: "Bronze Badge",
      prize: "25% free Hostel Accomodation",
      benefits: ["Free any one Events", "Goodies and Merchandise", "Offline Certificate"],
      icon: ShieldCheck,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      rank: "Top 100",
      title: "Silver Badge",
      prize: "50% free Hostel Accomodation",
      benefits: ["Free any Two Events", "Goodies and Merchandise", "Offline Certificate"],
      icon: Star,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      rank: "Top 11-50",
      title: "Gold Badge",
      prize: "Free Hostel Accomodation",
      benefits: ["Best CA Award", "Exclusive Event", "Offline LOI", "Goodies and Merchandise"],
      icon: Crown,
      color: "text-amber-600",
      bg: "bg-amber-600/10",
      border: "border-amber-600/20",
    },
  ]

  return (
    <div className="min-h-screen py-24 px-4 relative overflow-hidden bg-[#002263]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.05),transparent_50%)]" />

      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-6 bg-primary/10 text-white border-none px-6 py-1.5 text-sm font-black">
              2026 REWARD SEASON
            </Badge>
            <h1 className="text-4xl md:text-6xl text-white font-black mb-8 tracking-tighter uppercase leading-[0.85]">
              REAP THE <br />
              <span className="gradient-text">BENEFITS</span>
            </h1>
            <p className="text-1xl text-white max-w-2xl mx-auto leading-relaxed ">
              Your dedication to represent CU TechFest earns you more than just a title. Unlock exclusive hardware,
              career opportunities, and recognition.
            </p>
            <p className="inline-block text-base text-white max-w-2xl mx-auto leading-relaxed
  px-6 py-3 rounded-full
  bg-white/10 border border-white/20
  backdrop-blur-sm shadow-lg shadow-white/5"
>
  <span className="font-semibold text-[#f8f2bf]">Note :</span> All CA’s will get Certificate of Excellence and VIP Passes
</p>

          </motion.div>
        </header>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
  {tiers.map((tier, i) => {
    const isCenter = i === 1

    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        whileHover={{ y: -10 }}
      >
        <Card
          className={`h-full border-2 relative overflow-hidden group
            ${isCenter
              ? "bg-[#e8e5c3] text-black border-black/20"
              : "bg-[#890304] text-white border-white/20"
            }
          `}
        >
          <CardHeader className="text-center pb-0">
            <div
              className={`h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110
                ${isCenter
                  ? "bg-black/10 text-black"
                  : "bg-white/10 text-white"
                }
              `}
            >
              <tier.icon className="h-10 w-10" />
            </div>

            <div className={`font-black text-xs uppercase tracking-widest mb-2 ${isCenter ? "opacity-70" : "opacity-80"}`}>
              {tier.rank}
            </div>

            <CardTitle className="text-3xl font-black mb-2 uppercase tracking-tight">
              {tier.title}
            </CardTitle>

            <CardDescription
              className={`text-lg font-bold ${isCenter ? "text-black/80" : "text-white/80"}`}
            >
              {tier.prize}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div
              className={`space-y-4 pt-8 border-t
                ${isCenter ? "border-black/20" : "border-white/20"}
              `}
            >
              {tier.benefits.map((benefit, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Award
                    className={`h-4 w-4 shrink-0 ${isCenter ? "text-black" : "text-[#f8f2bf]"}`}
                  />
                  <span
                    className={`text-sm font-medium ${isCenter ? "text-black/70" : "text-white/80"}`}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  })}
</div>

        <section className="bg-muted/50 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="grid text-white grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6 uppercase leading-tight">
                How are rewards <br />
                <span className="text-white">Allocated?</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Weekly Points", desc: "Points are aggregated from all tasks completed during the week." },
                  { title: "Consistency Factor", desc: "Bonus points for maintaining a 100% completion streak." },
                  { title: "Zone Evaluation", desc: "Your Zone Head's feedback adds to your final ranking weight." },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shrink-0">
                      0{i + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-lg mb-1">{step.title}</h4>
                      <p className="text-white leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
  <div className="aspect-square rounded-[3rem] from-primary/20 to-secondary/20 flex items-center justify-center p-12">
    <div className="grid grid-cols-2 gap-4 w-full h-full">

      {/* CARD 1 */}
      <div className="bg-card rounded-2xl shadow-xl flex items-center justify-center animate-float p-4">
        <div className="w-full h-full rounded-xl overflow-hidden">
          <img
            src="https://tse3.mm.bing.net/th/id/OIP.nvwfYbQACaoSc8amhKEWtAHaD4?pid=Api&P=0&h=220"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      </div>

      {/* CARD 2 */}
      <div className="bg-card rounded-2xl shadow-xl flex items-center justify-center animate-float [animation-delay:0.5s] p-4">
        <div className="w-full h-full rounded-xl overflow-hidden">
          <img
            src="https://tse3.mm.bing.net/th/id/OIP.nvwfYbQACaoSc8amhKEWtAHaD4?pid=Api&P=0&h=220"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      </div>

      {/* CARD 3 */}
      <div className="bg-card rounded-2xl shadow-xl flex items-center justify-center animate-float [animation-delay:1s] p-4">
        <div className="w-full h-full rounded-xl overflow-hidden">
          <img
            src="https://tse3.mm.bing.net/th/id/OIP.nvwfYbQACaoSc8amhKEWtAHaD4?pid=Api&P=0&h=220"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      </div>

      {/* CARD 4 */}
      <div className="bg-card rounded-2xl shadow-xl flex items-center justify-center animate-float [animation-delay:1.5s] p-4">
        <div className="w-full h-full rounded-xl overflow-hidden">
          <img
            src="https://tse3.mm.bing.net/th/id/OIP.nvwfYbQACaoSc8amhKEWtAHaD4?pid=Api&P=0&h=220"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      </div>

    </div>
  </div>
</div>
  </div>
        </section>
      </div>
    </div>
  )
}

import { Crown } from "lucide-react"
