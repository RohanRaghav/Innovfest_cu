"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminZonesPage() {
  const [zones, setZones] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/zones')
      if (res.ok) {
        const d = await res.json()
        setZones(d.zones || [])
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-2xl font-black mb-4">Manage Zones</h1>
      <div className="space-y-4">
        {zones.map((z, i) => (
          <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
            <div>
              <div className="font-bold">{z.zone}</div>
              <div className="text-sm text-muted-foreground">Head: {z.head ?? '—'} • Ambassadors: {z.ambassadors}</div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/users">
                <button className="px-4 py-2 rounded bg-primary text-white font-bold">Manage Users</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
