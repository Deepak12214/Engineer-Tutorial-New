const BREVO_API_KEY = process.env.BREVO_API_KEY!
const FROM_EMAIL = process.env.BREVO_SENDER_EMAIL!
const FROM_NAME = process.env.BREVO_SENDER_NAME ?? 'EngineerTutorial'

async function sendEmail(to: string, subject: string, htmlContent: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Brevo error: ${err}`)
  }
}

export async function sendOTPEmail(to: string, name: string, otp: string) {
  await sendEmail(
    to,
    'Your EngineerTutorial verification code',
    `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#1e293b">Hi ${name},</h2>
      <p style="color:#475569">Use this OTP to verify your email address. It expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <span style="display:inline-block;background:#0f172a;color:#fff;font-size:32px;font-weight:700;letter-spacing:12px;padding:16px 32px;border-radius:12px">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:13px">If you didn't sign up, ignore this email.</p>
    </div>
    `
  )
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail(
    to,
    'Welcome to EngineerTutorial! 🎉',
    `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#1e293b">Welcome, ${name}!</h2>
      <p style="color:#475569">Your account is verified. Start learning System Design, Kafka, LLD, and more.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/learn"
         style="display:inline-block;margin-top:16px;padding:12px 28px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Start Learning →
      </a>
    </div>
    `
  )
}

export async function sendForgotPasswordOTP(to: string, name: string, otp: string) {
  await sendEmail(
    to,
    'Reset your EngineerTutorial password',
    `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#1e293b">Hi ${name},</h2>
      <p style="color:#475569">Use this OTP to reset your password. It expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <span style="display:inline-block;background:#0f172a;color:#fff;font-size:32px;font-weight:700;letter-spacing:12px;padding:16px 32px;border-radius:12px">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:13px">If you didn't request this, ignore this email.</p>
    </div>
    `
  )
}

export async function sendPaymentReceipt(to: string, name: string, orderId: string) {
  await sendEmail(
    to,
    'Your Pro subscription is active! ⚡',
    `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#1e293b">You're now Pro, ${name}!</h2>
      <p style="color:#475569">Payment received. All premium content is now unlocked.</p>
      <p style="color:#94a3b8;font-size:13px">Order ID: ${orderId}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="display:inline-block;margin-top:16px;padding:12px 28px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Go to Dashboard →
      </a>
    </div>
    `
  )
}
