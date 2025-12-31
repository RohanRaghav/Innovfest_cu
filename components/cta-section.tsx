"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Rocket } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden bg-foreground text-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.15)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary mx-auto mb-10 animate-float">
            <Rocket className="h-10 w-10" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">THE FUTURE IS CALLING</h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
            Don't just watch the tech revolution from the sidelines. Be the one who brings it to life. Join 800+
            ambassadors across the globe.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button size="lg" className="h-16 px-12 text-xl rounded-full bg-primary hover:bg-primary/90">
                Join Now <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-12 text-xl rounded-full border-white/20 hover:bg-white/10 text-white bg-transparent"
              >
                Get in Touch
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
