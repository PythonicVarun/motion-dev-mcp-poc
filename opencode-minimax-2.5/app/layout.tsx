import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Magnetic Dock',
  description: 'macOS-style magnetic dock with Motion.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}