"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Loader2, User, Mail, Lock, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  college: z.string().min(2, "College name is required"),
  zone: z.string().min(1, "Please select a zone"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  // Prefill email if user is already signed in (e.g., redirected from login)
  useEffect(() => {
    ;(async () => {
      const { auth } = await import("@/lib/firebaseClient")
      const current = auth.currentUser
      if (current?.email) setValue("email", current.email)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const { auth } = await import("@/lib/firebaseClient")
      const current = auth.currentUser
      let idToken = null

      if (!current) {
        // No signed-in user: create account
        const { createUserWithEmailAndPassword } = await import("firebase/auth")
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
        idToken = await userCredential.user.getIdToken()
      } else {
        // Existing firebase user (signed-in via sign-in): just use token
        idToken = await current.getIdToken()
      }

      // Save profile to backend (MongoDB)
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          college: data.college,
          zone: data.zone,
        }),
      })

      if (!res.ok) throw new Error("Failed to save profile")

      setIsLoading(false)
      router.push("/dashboard")
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      // show minimal error handling
      alert("Registration failed: " + (err as any).message)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12 relative overflow-hidden ">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(var(--secondary-rgb),0.05),transparent_50%)]" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl">
        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/80">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Zap className="h-6 w-6 fill-primary" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight uppercase">Join the Elite Force</CardTitle>
            <CardDescription>Complete your profile to become a Campus Ambassador</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" placeholder="John Doe" className="pl-10 h-11" {...register("fullName")} />
                  </div>
                  {errors.fullName && <p className="text-xs text-destructive font-bold">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@university.edu"
                      className="pl-10 h-11"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive font-bold">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" placeholder="+91 00000 00000" className="pl-10 h-11" {...register("phone")} />
                  </div>
                  {errors.phone && <p className="text-xs text-destructive font-bold">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">University / College</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="college"
                      placeholder="Chandigarh University"
                      className="pl-10 h-11"
                      {...register("college")}
                    />
                  </div>
                  {errors.college && <p className="text-xs text-destructive font-bold">{errors.college.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Assigned Zone</Label>
                  <Select onValueChange={(val) => setValue("zone", val)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORTH">North Zone</SelectItem>
                      <SelectItem value="SOUTH">South Zone</SelectItem>
                      <SelectItem value="EAST">East Zone</SelectItem>
                      <SelectItem value="WEST">West Zone</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.zone && <p className="text-xs text-destructive font-bold">{errors.zone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" className="pl-10 h-11" {...register("password")} />
                  </div>
                  {errors.password && <p className="text-xs text-destructive font-bold">{errors.password.message}</p>}
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full h-14 rounded-xl text-lg font-black" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Register as Ambassador"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center w-full text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
