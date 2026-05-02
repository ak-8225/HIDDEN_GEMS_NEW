import { NextResponse } from "next/server"

/**
 * /api/contact — receives connect / newsletter signups and forwards them to
 * Akshay's inbox. Two delivery modes are supported:
 *
 *  1. RESEND_API_KEY  – uses Resend's HTTPS API (zero deps, recommended).
 *  2. WEB3FORMS_KEY   – uses Web3Forms' free formspree-style endpoint.
 *
 * If neither env var is set, the route still returns 202 so the client can
 * fall back to a mailto: link. This means the form keeps working in dev / on
 * Vercel previews without any setup.
 */

export const runtime = "nodejs"

const TO_EMAIL = "kumar.akshay60560@gmail.com"

interface Payload {
  kind?: "newsletter" | "connect"
  email?: string
  name?: string
  message?: string
}

function isValidEmail(s: string | undefined): s is string {
  return !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: Request) {
  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 })
  }

  const subject =
    body.kind === "connect"
      ? `Hidden Gems · Connect from ${body.name ?? body.email}`
      : `Hidden Gems · Newsletter signup (${body.email})`

  const text = [
    `Source : Hidden Gems site`,
    `Type   : ${body.kind ?? "newsletter"}`,
    `Email  : ${body.email}`,
    body.name ? `Name   : ${body.name}` : null,
    body.message ? `\n${body.message}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  // ── 1) Resend (https://resend.com) ───────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "Hidden Gems <onboarding@resend.dev>",
          to: [TO_EMAIL],
          reply_to: body.email,
          subject,
          text,
        }),
      })
      if (r.ok) return NextResponse.json({ ok: true, via: "resend" })
    } catch {
      /* fall through */
    }
  }

  // ── 2) Web3Forms (free, no SMTP setup) ───────────────────────────────────
  const w3f = process.env.WEB3FORMS_KEY
  if (w3f) {
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: w3f,
          subject,
          email: body.email,
          message: text,
          to: TO_EMAIL,
        }),
      })
      if (r.ok) return NextResponse.json({ ok: true, via: "web3forms" })
    } catch {
      /* fall through */
    }
  }

  // ── No backend configured: signal the client to fall back to mailto. ────
  // We use 503 so `res.ok` is false on the client side.
  return NextResponse.json(
    { ok: false, fallback: "mailto", to: TO_EMAIL },
    { status: 503 },
  )
}
