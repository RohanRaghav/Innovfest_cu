"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminZonesPage() {
  const [zones, setZones] = useState<any[]>([])

  const [name, setName] = useState("")
  const [prefixes, setPrefixes] = useState("")
  const [headUserId, setHeadUserId] = useState("")

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

  async function createZone(e: any) {
    e.preventDefault()
    const payload = { name: name.trim(), pinPrefixes: prefixes.split(',').map(s => s.trim()).filter(Boolean), headUserId: headUserId || undefined }
    const res = await fetch('/api/admin/zones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setName('')
      setPrefixes('')
      setHeadUserId('')
      const d = await res.json()
      setZones(prev => [...prev, d.zone])
    } else {
      const err = await res.json().catch(() => ({}))
      alert('Failed: ' + (err.error || res.status))
    }
  }

  async function runBackfill() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return alert('Please login as ADMIN')
    const res = await fetch('/api/admin/assign-zones', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const d = await res.json().catch(() => ({}))
      alert('Backfill complete. Updated: ' + (d.updated ?? 'unknown'))
      // reload zones
      const r2 = await fetch('/api/admin/zones')
      if (r2.ok) {
        const dd = await r2.json().catch(() => ({}))
        setZones(dd.zones || [])
      }
    } else {
      const err = await res.json().catch(() => ({}))
      alert('Failed: ' + (err.error || res.status))
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-2xl font-black mb-4">Manage Zones</h1>
      <div className="space-y-4">
        <form onSubmit={createZone} className="p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input placeholder="Zone name" value={name} onChange={e => setName(e.target.value)} className="p-2 border rounded" />
            <input placeholder="Pin prefixes (comma separated) e.g. 12,13" value={prefixes} onChange={e => setPrefixes(e.target.value)} className="p-2 border rounded" />
            <input placeholder="Optional head userId" value={headUserId} onChange={e => setHeadUserId(e.target.value)} className="p-2 border rounded" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-primary text-white font-bold" type="submit">Create Zone</button>
            <button type="button" onClick={runBackfill} className="px-4 py-2 rounded bg-secondary text-white">Backfill Assign Zones</button>
          </div>
        </form>
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
