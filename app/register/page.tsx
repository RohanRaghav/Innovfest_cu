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
import { Zap, Loader2, User, Mail, Lock, Phone, MapPin, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  pinCode: z.string().min(6, "Pin code is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  college: z.string().optional(),
  uid: z.string().optional(),
  referralCode: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const pinCode = watch("pinCode")

  // Autofill city and state based on pin code
  useEffect(() => {
    if (typeof pinCode === "string" && pinCode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${pinCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data[0]?.Status === "Success") {
            const postOffice = data[0].PostOffice[0]
            setValue("city", postOffice.District)
            setValue("state", postOffice.State)
          } else {
            setValue("city", "")
            setValue("state", "")
          }
        })
        .catch((err) => {
          console.error("Failed to fetch city/state:", err)
          setValue("city", "")
          setValue("state", "")
        })
    } else {
      setValue("city", "")
      setValue("state", "")
    }
  }, [pinCode, setValue])

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          phone: data.phone,
          pinCode: data.pinCode,
          city: data.city,
          state: data.state,
          college: data.college,
          uid: data.uid,
          referralCode: data.referralCode,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Registration failed")
      }

      const payload = await res.json()

      // Server will ask to verify email before accessing account
      if (payload?.ok) {
        setIsLoading(false)
        alert("Registration successful. Please check your email and verify your account before logging in.")
        router.push("/login")
        return
      }

      throw new Error("Unexpected response from server")
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      alert("Registration failed: " + (err as any).message)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12 relative overflow-hidden bg-[#002263] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(248,242,191,0.05),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <Card className="border-[#f8f2bf]/50 shadow-2xl bg-[#002263]/80 backdrop-blur-sm text-white">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-[#f8f2bf]/20 flex items-center justify-center text-[#f8f2bf] mb-2">
              <Zap className="h-6 w-6 fill-[#f8f2bf]" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight uppercase text-[#f8f2bf]">
              Join the Elite Force
            </CardTitle>
            <CardDescription className="text-[#f8f2bf]">
              Complete your profile to become a Campus Ambassador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[#f8f2bf]">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#f8f2bf]" />
                    <Input id="fullName" placeholder="John Doe" className="pl-10 h-11 text-white" {...register("fullName")} />
                  </div>
                  {errors.fullName && <p className="text-xs text-[#890304] font-bold">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#f8f2bf]">College Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#f8f2bf]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@university.edu"
                      className="pl-10 h-11 text-white"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-[#890304] font-bold">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#f8f2bf]">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-[#f8f2bf]" />
                    <Input id="phone" type="number" placeholder="+91 00000 00000" className="pl-10 h-11 text-white" {...register("phone")} />
                  </div>
                  {errors.phone && <p className="text-xs text-[#890304] font-bold">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinCode" className="text-[#f8f2bf]">Pin Code</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-[#f8f2bf]" />
                    <Input id="pinCode" placeholder="160047" className="pl-10 h-11 text-white" {...register("pinCode")} />
                  </div>
                  {errors.pinCode && <p className="text-xs text-[#890304] font-bold">{errors.pinCode.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[#f8f2bf]">City</Label>
                  <Input id="city" placeholder="City" className="h-11 text-white" {...register("city")} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-[#f8f2bf]">State</Label>
                  <Input id="state" placeholder="State" className="h-11 text-white" {...register("state")} readOnly />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password" className="text-[#f8f2bf]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#f8f2bf]" />
                    <Input id="password" type="password" className="pl-10 h-11 text-white" {...register("password")} />
                  </div>
                  {errors.password && <p className="text-xs text-[#890304] font-bold">{errors.password.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="college" className="text-[#f8f2bf]">College</Label>
                  <Input id="college" placeholder="College name" className="h-11 text-white" {...register("college")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uid" className="text-[#f8f2bf]">UID</Label>
                  <Input id="uid" placeholder="UID" className="h-11 text-white" {...register("uid")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode" className="text-[#f8f2bf]">Referral Code (optional)</Label>
                  <Input id="referralCode" placeholder="ABC123" className="h-11 text-white" {...register("referralCode")} />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full h-14 rounded-xl text-lg font-black bg-[#f8f2bf] text-[#002263] hover:bg-[#890304] hover:text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Register as Ambassador"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center w-full text-[#f8f2bf]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#890304] font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
