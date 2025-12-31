"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Zap, Github, Twitter, Instagram, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 bg-gradient-to-br 
  from-[#cfe0f6] 
  via-[#c9def7] 
  via-[#dee4f3] 
  via-[#e1e5f2] 
  to-[#d6e1f4] backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-6">
              <Zap className="h-8 w-8 text-primary fill-primary animate-pulse" />
              <span className="gradient-text">CU TechFest CA</span>
            </Link>
            <p className="text-muted-foreground text-lg max-w-sm mb-8">
              Empowering student leaders to bridge the gap between innovation and campus life. Represent, Lead, and
              Grow.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Github, href: "#" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Program
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-primary transition-colors">
                  Rewards Structure
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-primary transition-colors">
                  Global Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>techfest@cu.ac.in</span>
              </li>
              <li>Chandigarh University, NH-95, Mohali, Punjab</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 CU TechFest. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
