"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Loader2, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Login failed")
      }

      const payload = await res.json()
      const token = payload?.token
      const user = payload?.user

      if (!token || !user) throw new Error("Invalid response from server")

      localStorage.setItem("token", token)

      const role = user?.role || "CA"
      setIsLoading(false)

      if (role === "ADMIN") router.push("/admin")
      else if (role === "ZONE_HEAD") router.push("/zone-head")
      else router.push("/dashboard")
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      alert("Login failed: " + (err as any).message)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden bg-[#002263] text-white font-primary">
      {/* Background radial gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(248,242,191,0.05),transparent_50%)]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-[#f8f2bf]/50 shadow-2xl backdrop-blur-sm bg-[#002263]/80 text-white">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-[#f8f2bf]/20 flex items-center justify-center text-[#f8f2bf] mb-2">
              <Zap className="h-6 w-6 fill-[#f8f2bf]" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-[#f8f2bf]">Welcome Back</CardTitle>
            <CardDescription className="text-[#f8f2bf]">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#f8f2bf]">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#f8f2bf]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-11 text-white"
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-xs text-[#890304] font-bold">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#f8f2bf]">Password</Label>
                  <Link href="#" className="text-xs text-[#f8f2bf] font-bold hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#f8f2bf]" />
                  <Input id="password" type="password" className="pl-10 h-11 text-white" {...register("password")} />
                </div>
                {errors.password && <p className="text-xs text-[#890304] font-bold">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-lg font-black bg-[#f8f2bf] text-[#002263] hover:bg-[#890304] hover:text-white"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign In to Portal"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-[#f8f2bf]">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#890304] font-bold hover:underline">
                Register as Ambassador
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
