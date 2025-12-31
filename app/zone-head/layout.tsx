import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function ZoneHeadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <DashboardSidebar role="ZONE_HEAD" />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
      </div>
    </div>
  )
}
