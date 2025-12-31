"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Gift, Smartphone, Monitor, Star, ShieldCheck, Award } from "lucide-react"

export default function RewardsPage() {
  const tiers = [
    {
      rank: "Top 01",
      title: "Diamond Elite",
      prize: "Gaming Laptop + PS5",
      benefits: ["VIP Invite to CU Convocation", "3-Month Paid Internship", "Global Press Release"],
      icon: Crown,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      rank: "Top 02-10",
      title: "Platinum Force",
      prize: "Flagship Smartphone",
      benefits: ["Core Team Direct Entry", "Official CA Toolkit", "Exclusive Workshops"],
      icon: Star,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      rank: "Top 11-50",
      title: "Gold Vanguard",
      prize: "Noise Cancelling Headphones",
      benefits: ["Merchandise Box", "Achievement Trophy", "Digital Badges"],
      icon: ShieldCheck,
      color: "text-amber-600",
      bg: "bg-amber-600/10",
      border: "border-amber-600/20",
    },
  ]

  return (
    <div className="min-h-screen py-24 px-4 relative overflow-hidden bg-gradient-to-br 
  from-[#cfe0f6] 
  via-[#c9def7] 
  via-[#dee4f3] 
  via-[#e1e5f2] 
  to-[#d6e1f4]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.05),transparent_50%)]" />

      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-6 bg-primary/10 text-primary border-none px-6 py-1.5 text-sm font-black">
              2025 REWARD SEASON
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.85]">
              REAP THE <br />
              <span className="gradient-text">BENEFITS</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your dedication to represent CU TechFest earns you more than just a title. Unlock exclusive hardware,
              career opportunities, and recognition.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Card className={`h-full border-2 ${tier.border} relative overflow-hidden group`}>
                <CardHeader className="text-center pb-0">
                  <div
                    className={`h-20 w-20 rounded-3xl ${tier.bg} ${tier.color} flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110`}
                  >
                    <tier.icon className="h-10 w-10" />
                  </div>
                  <div className="font-black text-xs uppercase tracking-widest opacity-60 mb-2">{tier.rank}</div>
                  <CardTitle className="text-3xl font-black mb-2 uppercase tracking-tight">{tier.title}</CardTitle>
                  <CardDescription className="text-lg font-bold text-foreground">{tier.prize}</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4 pt-8 border-t border-border/50">
                    {tier.benefits.map((benefit, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Award className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <section className="bg-muted/50 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6 uppercase leading-tight">
                How are rewards <br />
                <span className="text-primary">Allocated?</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Weekly Points", desc: "Points are aggregated from all tasks completed during the week." },
                  { title: "Consistency Factor", desc: "Bonus points for maintaining a 100% completion streak." },
                  { title: "Zone Evaluation", desc: "Your Zone Head's feedback adds to your final ranking weight." },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black shrink-0">
                      0{i + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-lg mb-1">{step.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-12">
                <div className="grid grid-cols-2 gap-4 w-full h-full">
                  <div className="bg-card rounded-2xl shadow-xl flex items-center justify-center animate-float">
                    <Gift className="h-12 w-12 text-primary" />
                  </div>
                  <div className="bg-card rounded-2xl shadow-xl flex items-center justify-center animate-float [animation-delay:0.5s]">
                    <Smartphone className="h-12 w-12 text-secondary" />
                  </div>
                  <div className="bg-card rounded-2xl shadow-xl flex items-center justify-center animate-float [animation-delay:1s]">
                    <Monitor className="h-12 w-12 text-accent" />
                  </div>
                  <div className="bg-card rounded-2xl shadow-xl flex items-center justify-center animate-float [animation-delay:1.5s]">
                    <Trophy className="h-12 w-12 text-yellow-500" />
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
