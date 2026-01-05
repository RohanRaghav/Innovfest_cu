import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"

const EMAIL_SECRET = process.env.EMAIL_SECRET || process.env.JWT_SECRET || "email-secret"
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || "587")
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@example.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

let transporter: nodemailer.Transporter | null = null
if (SMTP_HOST && SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

export function smtpStatus() {
  return { configured: !!transporter, host: SMTP_HOST || null, port: SMTP_PORT || null, user: SMTP_USER || null, from: FROM_EMAIL }
}

export async function checkSmtp() {
  if (!transporter) return { configured: false }
  try {
    await transporter.verify()
    return { configured: true, verified: true }
  } catch (err: any) {
    return { configured: true, verified: false, error: (err && err.message) ? err.message : String(err) }
  }
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.warn("SMTP not configured - skipping email to", to)
    throw new Error("SMTP not configured")
  }
  try {
    const info = await transporter.sendMail({ from: FROM_EMAIL, to, subject, html })
    return info
  } catch (err) {
    console.error("Failed to send email", err)
    throw err
  }
}

export async function sendVerificationEmail(user: any) {
  if (!user?.email) return
  const token = jwt.sign({ userId: String(user._id), action: "verify" }, EMAIL_SECRET, { expiresIn: "7d" })
  const link = `${APP_URL}/api/auth/verify?token=${token}`
  const html = `
    <p>Hello ${user.fullName || user.email},</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${link}">Verify my email</a></p>
    <p>If you didn't sign up, please ignore.</p>
  `
  await sendEmail(user.email, "Verify your email", html)
}

export async function sendRolePromotionEmail(user: any, newRole: string) {
  if (!user?.email) return
  const html = `
    <p>Congrats ${user.fullName || user.email}!</p>
    <p>You have been promoted to <strong>${newRole}</strong>. Welcome aboard!</p>
  `
  await sendEmail(user.email, "You're now a Zone Head", html)
}
