import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ThinkInk",
  description: "Master the art of essay writing with AI-powered guidance",
  generator: "v0.dev",
  icons: {
    icon: '/ThinkInk.png',
    apple: '/ThinkInk.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
