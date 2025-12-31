"use client"

import Link from "next/link"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Zap, Menu, X } from "lucide-react"
import { useState } from "react"
import { navItems } from "@/lib/navigation"
import { usePathname } from "next/navigation"
import AuthButtons from "@/components/auth-buttons"

export function Navbar() {
  const pathname = usePathname()

  // ⛔ Hide navbar on dashboard routes
  if (pathname.startsWith("/dashboard")) {
    return null
  }
  if (pathname.startsWith("/admin")) {
    return null
  }
  const [isOpen, setIsOpen] = useState(false)
  const { scrollY } = useScroll()
  const backgroundColor = useTransform(
  scrollY,
  [0, 60],
  [
    "linear-gradient(135deg, #cfe0f6, #c9def7, #dee4f3, #e1e5f2, #d6e1f4)",
    "transparent"
  ]
)
  const [hidden, setHidden] = useState(false);


useMotionValueEvent(scrollY, "change", (latest) => {
  const previous = scrollY.getPrevious();
  if (previous !== undefined && latest > previous && latest > 80) {
    setHidden(true);   // scrolling down
  } else {
    setHidden(false);  // scrolling up
  }
});

  // navItems moved to `lib/navigation.tsx`

  return (
<motion.header
  style={{
    background: backgroundColor
  }}
  className="
    sticky top-0 z-50 w-full
    transition-all duration-300
  "
>


      <div className="container mx-auto px-4 flex h-20 items-center justify-between">
       <Link
      href="/"
      className="flex items-center gap-2 font-bold text-2xl tracking-tight z-50 overflow-hidden"
    >
      {/* ⚡ Zap ICON — NEVER MOVES */}
      <Zap className="h-7 w-7 text-primary fill-primary shrink-0" />

      {/* TEXT — SLIDES & DISAPPEARS */}
      <motion.span
        initial={false}
        animate={{
          x: hidden ? -40 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="whitespace-nowrap"
      >
        <span className="gradient-text">
          CU Innovfest <span className="text-foreground">CA</span>
        </span>
      </motion.span>
    </Link>

        {/* Desktop Nav */}
      <nav
  className="hidden md:flex gap-20 text-sm font-semibold 
  bg-[#0f2a53] 
  px-6 py-3 
  rounded-xl 
  shadow-md"
>
  {navItems.map((item) => (
    <Link
      key={item.name}
      href={item.href}
      className="relative flex flex-col items-center text-white 
      hover:text-gray-200 transition-colors group"
    >
      {item.icon}
      <span>{item.name}</span>

      {/* underline */}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
    </Link>
  ))}
</nav>


        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {/* Show login/register when not signed in, otherwise show profile / sign out */}
            {/* useAuth */}
            <AuthButtons />
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden z-50 p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: "100%" }}
        className="fixed inset-0 bg-background md:hidden pt-24 px-6 z-40"
      >
        <div className="flex flex-col gap-6 text-2xl font-bold">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
              {item.name}
            </Link>
          ))}
          <hr className="border-border/50" />
          <div className="flex flex-col gap-4">
            <AuthButtons />
          </div>
        </div>
      </motion.div>
    </motion.header>
  )
}
