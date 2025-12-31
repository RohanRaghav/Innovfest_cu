"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  ClipboardList,
  Trophy,
  User,
  Settings,
  LogOut,
  Zap,
  Map,
  Users,
  ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  role: "CA" | "ZONE_HEAD" | "ADMIN"
}

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const links = {
    CA: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "My Tasks", href: "/dashboard/tasks", icon: ClipboardList },
      { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
      { name: "Profile", href: "/dashboard/profile", icon: User },
    ],
    ZONE_HEAD: [
      { name: "Zone Overview", href: "/zone-head", icon: LayoutDashboard },
      { name: "Review Tasks", href: "/zone-head/reviews", icon: ClipboardList },
      { name: "Ambassadors", href: "/zone-head/ambassadors", icon: Users },
      { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    ],
    ADMIN: [
      { name: "Core Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Manage Zones", href: "/admin/zones", icon: Map },
      { name: "All Users", href: "/admin/users", icon: Users },
      { name: "System Logs", href: "/admin/logs", icon: ShieldAlert },
    ],
  }

  const currentLinks = links[role]

  return (
    <aside className="hidden lg:flex w-72 flex-col bg-card border-r border-border/50 sticky top-0 h-screen">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight">
          <Zap className="h-6 w-6 text-primary fill-primary" />
          <span className="gradient-text leading-tight">TECHFEST CA</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {currentLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link key={link.name} href={link.href}>
              <span
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all group",
                  isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted",
                )}
              >
                <link.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {link.name}
                {isActive && (
                  <motion.div layoutId="sidebar-pill" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl font-bold text-muted-foreground">
          <Settings className="h-5 w-5" />
          Settings
        </Button>
        <Link href="/login">
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl font-bold text-destructive">
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </Link>
      </div>
    </aside>
  )
}
