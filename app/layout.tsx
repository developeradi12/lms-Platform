import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import AuthProvider from "@/lib/AuthProvider"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "LearnHub - Learning Management System",
  description:
    "A modern learning management system to discover, enroll, and track your courses.",
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body
        className={`${_inter.variable} ${_spaceGrotesk.variable} font-sans antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          {/* Page Content */}
          <main className="flex-1">
            <AuthProvider>
              {children}
            </AuthProvider>

          </main>
        </div>

        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="light"
        />
      </body>
    </html>
  )
}