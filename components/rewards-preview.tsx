"use client"

import { Button } from "@/components/ui/button"

import Link from "next/link"

import { motion } from "framer-motion"
import { Trophy, Gift, Smartphone, Monitor } from "lucide-react"

export function RewardsPreview() {
  const tiers = [
    {
      rank: "Top 1-3",
      title: "Grand Tech Pack",
      rewards: ["Premium Laptop", "Core Team Internship", "VIP Pass to TechFest"],
      icon: Monitor,
      color: "from-yellow-400 to-orange-500",
    },
    {
      rank: "Top 4-10",
      title: "Mobile Pro Pack",
      rewards: ["Flagship Smartphone", "Industry Mentorship", "Official Merchandise"],
      icon: Smartphone,
      color: "from-blue-400 to-primary",
    },
    {
      rank: "Top 11-50",
      title: "Essential Kit",
      rewards: ["Tech Accessories", "Recognition Certificate", "Discount Coupons"],
      icon: Gift,
      color: "from-secondary to-purple-600",
    },
  ]

  return (
    <section className="py-32 bg-muted/30 relative" id="rewards">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Epic Rewards for Top Performers</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your hard work pays off. Climb the leaderboard and unlock rewards that will supercharge your tech journey.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative p-1 rounded-[2.5rem] bg-gradient-to-br transition-transform hover:scale-[1.02]"
              style={{
                backgroundImage: `linear-gradient(to bottom right, var(--primary), var(--secondary))`,
                opacity: 0.9,
              }}
            >
              <div className="bg-card rounded-[2.4rem] p-10 h-full flex flex-col">
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-white mb-8 shadow-xl`}
                >
                  <tier.icon className="h-8 w-8" />
                </div>
                <div className="font-black text-primary text-sm uppercase tracking-widest mb-2">{tier.rank}</div>
                <h3 className="text-3xl font-black mb-8 leading-tight">{tier.title}</h3>
                <ul className="space-y-4 mb-12 flex-1">
                  {tier.rewards.map((reward, j) => (
                    <li key={j} className="flex items-center gap-3 text-muted-foreground font-medium">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {reward}
                    </li>
                  ))}
                </ul>
                <div className="pt-8 border-t border-border/40">
                  <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-primary text-primary-foreground text-center overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4">Ready to climb the leaderboard?</h3>
            <p className="mb-8 text-primary-foreground/80 max-w-xl mx-auto">
              Points are calculated weekly based on task consistency and quality. The global leaderboard refreshes every
              Sunday.
            </p>
            <Link href="/leaderboard">
              <Button variant="secondary" size="lg" className="rounded-full px-10 font-bold">
                View Real-time Ranks
              </Button>
            </Link>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/3 bg-white/10 -skew-x-12 transform translate-x-10" />
          <div className="absolute bottom-0 left-0 h-full w-1/4 bg-black/10 -skew-x-12 transform -translate-x-10" />
        </div>
      </div>
    </section>
  )
}
