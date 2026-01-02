"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"

export default function SubmitProof({ taskId }: { taskId: string }) {
  const { firebaseUser } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [note, setNote] = useState("")

  async function handleUpload() {
    if (!file) return alert("Select a file")
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return alert("Please login to submit")

    setUploading(true)

    try {
      // Upload to Cloudinary unsigned
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      if (!cloudName || !preset) throw new Error("Cloudinary not configured")

      const fd = new FormData()
      fd.append("file", file)
      fd.append("upload_preset", preset)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: fd,
      })

      if (!uploadRes.ok) throw new Error("Upload failed")
      const uploadJson = await uploadRes.json()
      const mediaUrl = uploadJson.secure_url

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ taskId, mediaUrl, note }),
      })

      if (!res.ok) throw new Error("Failed to create submission")

      alert("Submission created — awaiting review")
      setFile(null)
      setNote("")
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Input placeholder="Short note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? "Uploading…" : "Upload Proof"}
      </Button>
    </div>
  )
}
