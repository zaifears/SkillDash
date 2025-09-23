import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../contexts/AuthContext'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration'  // ✅ ONLY NEW LINE ADDED

// ✅ OPTIMIZED: Enhanced font loading with display swap and subset optimization
const inter = Inter({
  subsets: ['latin'],
  // ✅ OPTIMIZED: Only load necessary font weights
  weight: ['400', '500', '600', '700'],
  // ✅ OPTIMIZED: Font display swap for faster loading
  display: 'swap',
  // ✅ OPTIMIZED: Preload the most common weight
  preload: true,
  // ✅ OPTIMIZED: Variable font for better performance
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'SkillDash - AI-Powered Skill Platform for Bangladesh\'s Youth',
  description: 'The AI-Powered platform for Bangladesh\'s youth to discover skills, learn new courses, get resume feedback, and find opportunities.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* ✅ OPTIMIZED: Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* ✅ OPTIMIZED: DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      {/* ✅ OPTIMIZED: Use CSS variable for better font rendering */}
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </AuthProvider>
        <ServiceWorkerRegistration />  {/* ✅ ONLY NEW COMPONENT ADDED */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
