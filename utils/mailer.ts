import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendOtpMail = async (to: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"LMS Platform" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Your OTP Code</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    })
  } catch (error) {
    console.log("SEND OTP MAIL ERROR:", error)
    throw new Error("Failed to send OTP email")
  }
}
