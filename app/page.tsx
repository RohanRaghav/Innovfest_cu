"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, ShieldCheck, Zap, Globe } from "lucide-react"
import Link from "next/link"
import { AboutProgram } from "@/components/about-program"
import { RewardsPreview } from "@/components/rewards-preview"
import { CTASection } from "@/components/cta-section"

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden bg-[#002263]">

      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
            className="absolute top-1/4 -right-20 h-[600px] w-[600px] bg-primary/20 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY }}
            className="absolute -bottom-20 -left-20 h-[500px] w-[500px] bg-secondary/20 blur-[100px] rounded-full"
          />
          <div className="absolute inset-0 bg-[url('/abstract-grid.png')] opacity-[0.03] dark:opacity-[0.07]" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-1xl md:text-3xl lg:text-4xl font-markpro font-bold tracking-tighter mb-8 leading-[0.9] text-[white]"
            >
              Innovfest, Chandigarh University
            </motion.h2>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-markpro font-bold tracking-tighter mb-8 leading-[0.9] text-[white]"
            >
              COLLEGE AMBASSADOR<br />
              <span className="gradient-text">PROGRAM</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-lg md:text-2xl text-white mb-12 max-w-2xl mx-auto leading-relaxed "
            >
              Not just a role—it’s your space to collaborate, create, celebrate, and make your mark.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 bg-[#890304] text-lg rounded-full group animate-glow">
                  Join Elite Force{" "}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/rewards">
                <Button
                  size="lg"
                  className="h-16 px-10 text-white text-lg rounded-full bg-[#890304]"
                >
                  Explore Benefits
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

 <section className="relative bg-[#e8e5c3] w-full py-25 overflow-hidden">
  
  {/* TOP CURVED BORDER */}
  <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
   <svg
  viewBox="0 0 1200 100"
  preserveAspectRatio="none"
  style={{
    display: "block",
    height: "200px",
    position: "relative",
    width: "calc(279% + 1.3px)",
  }}
>
  

  <path
    d="M 321.39 56.44 
       c 58 -10.79 114.16 -30.13 172 -41.86 
       c 82.39 -16.72 168.19 -17.73 250.45 -0.39 
       C 823.78 31 906.67 72 985.66 92.83 
       c 70.05 18.48 146.53 26.09 214.34 3 
       V 0 H 0 V 27.35 
       A 600.21 600.21 0 0 0 321.39 56.44 Z"
    fill="#002263"
  />
</svg>

  </div>

  {/* CONTENT */}
  <div className="relative z-10 flex flex-col items-center justify-center py-20 px-4">
    {/* Heading */}
    <h2 className="text-black text-4xl lg:text-5xl font-markpro font-bold tracking-tighter mb-12 text-center">
      OUR REACH
    </h2>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 text-center text-black">
      {[
        { icon: Sparkles, label: "Indian Universities", value: "1500+" },
        { icon: ShieldCheck, label: "College Ambassadors", value: "1500+" },
        { icon: Globe, label: "International Universities", value: "100+" },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
          className="group"
        >
          <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <stat.icon className="h-6 w-6 text-black" />
          </div>
          <div className="text-4xl font-black mb-1">{stat.value}</div>
          <div className="text-sm font-bold text-black/70 uppercase tracking-widest">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>


      <AboutProgram />
      <CTASection />
    </div>
  )
}
