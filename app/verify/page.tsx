"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function VerifyPage({ searchParams }: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Verifying...')

  useEffect(() => {
    async function verify() {
      const token = searchParams?.token
      if (!token) {
        setMessage('Missing token')
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token)
          router.push('/dashboard')
          return
        }
        setMessage(data.error || 'Verification failed')
      } catch (e) {
        setMessage('Verification failed')
      }
      setLoading(false)
    }
    verify()
  }, [searchParams, router])

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12">
      <div>
        {loading ? <div>{message}</div> : <div>{message}</div>}
      </div>
    </div>
  )
}
