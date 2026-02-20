import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your LMS",
  description: "Learn smarter. Build faster.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          min-h-screen 
          flex flex-col
          bg-fixed 
          bg-gradient-to-br from-slate-50 via-white to-indigo-50/30
          selection:bg-indigo-100 selection:text-indigo-900
        `}
      >
        {/* The flex-1 ensures main takes up all available space */}
        <main className="flex-1">
          {children}
        </main>
        
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          theme="light"
        />
      </body>
    </html>
  );
}