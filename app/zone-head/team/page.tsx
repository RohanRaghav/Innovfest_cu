"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function ZoneHeadTeamPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [cas, setCAs] = useState<any[]>([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!profile) return router.push("/login")
    if (profile?.role !== "ZONE_HEAD") return router.push("/")
    fetchTeam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, loading])

  async function fetchTeam() {
    setFetching(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return setFetching(false)
    const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      const myZone = (profile as any)?.zone || (profile as any)?.pinCode || null
      const myName = (profile as any)?.fullName || profile?.email
      const zoneCAs = (data.users || []).filter((u: any) => u.role === "CA" && (
        u.zoneHeadId === profile?._id || u.zone === myZone || u.pinCode === myZone || u.zoneHeadName === myName || u.zoneHeadName === profile?.email
      ))
      setCAs(zoneCAs)
    }
    setFetching(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-black mb-4">My Team - {profile?.zone || "Zone"}</h2>
      <div className="text-sm text-muted-foreground mb-6">Total CAs: {cas.length}</div>

      <div className="space-y-3">
        {cas.map((ca) => (
          <div key={ca._id} className="p-4 border rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">{ca.fullName || ca.email}</div>
                <div className="text-sm text-muted-foreground">
  {ca.email} • Phone:{" "}
  {ca.phone ? (
    <a
      href={`https://wa.me/91${ca.phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-600 hover:underline font-medium"
    >
      {ca.phone}
    </a>
  ) : (
    "-"
  )}
</div>

              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{ca.points || 0} pts</div>
                <div className="text-xs text-muted-foreground">Tasks: {ca.tasksDone || 0}</div>
              </div>
            </div>
          </div>
        ))}
        {!cas.length && <p className="text-muted-foreground">No CAs in your team yet</p>}
      </div>
    </div>
  )
}
