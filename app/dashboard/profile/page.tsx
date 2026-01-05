"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const { firebaseUser, profile, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading profile…</div>
  }

  const user = profile || firebaseUser
  if (!user) {
    return <div className="p-6 text-center text-red-500">User not logged in</div>
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarFallback className="text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <CardDescription>{user.college}</CardDescription>

          <div className="mt-2">
            <Badge variant="secondary">{user.role}</Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileItem label="UID" value={user.uid} />
          <ProfileItem label="Email" value={user.email} />
          <ProfileItem label="Phone" value={user.phone} />
          <ProfileItem label="College" value={user.college} />

          <ProfileItem
            label="Tasks Allocated"
            value={user.tasksAllocated ?? 0}
          />
          <ProfileItem
            label="Tasks Completed"
            value={user.tasksCompleted ?? 0}
          />

          <ProfileItem
            label="Referral Code"
            value={user.referralCode || "—"}
          />

          <ProfileItem
            label="Zone"
            value={user.zone || "—"}
          />

          <ProfileItem
            label="Zone Head"
            value={user.zoneHead ? `${user.zoneHead.fullName || user.zoneHead.email} (${user.zoneHead.email})` : "—"}
          />

          <ProfileItem
            label="Points"
            value={user.points ?? 0}
            highlight
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileItem({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-lg font-semibold ${
          highlight ? "text-green-600" : ""
        }`}
      >
        {value}
      </span>
    </div>
  )
}
