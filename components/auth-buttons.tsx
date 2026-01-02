"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function AuthButtons() {
  const { firebaseUser, profile, loading, logout } = useAuth()
  const router = useRouter()

  if (loading) return null

  if (!firebaseUser) {
    return (
      <>
        <Link href="/login">
          <Button variant="ghost" size="sm" className="font-bold text-[white]">
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="bg-[#890304] text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold rounded-full px-6">
            Sign Up
          </Button>
        </Link>
      </>
    )
  }

  const handleSignOut = async () => {
    try {
      logout()
      router.push("/")
    } catch (err) {
      console.error(err)
      router.push("/")
    }
  }

  return (
    <>
      <Link href={profile?.role === "ADMIN" ? "/admin" : profile?.role === "ZONE_HEAD" ? "/zone-head" : "/dashboard"}>
        <Button variant="ghost" size="sm" className="font-bold">
          {profile?.fullName ? profile.fullName.split(" ")[0] : profile?.email?.split("@")[0]}
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleSignOut} className="font-bold">
        Sign out
      </Button>
    </>
  )
}
