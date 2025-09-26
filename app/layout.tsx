import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../contexts/AuthContext'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const GTM_ID = 'GTM-MT2LDFM3'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillDash: AI-Powered Skill Platform for Bangladesh\'s Youth',
  description: 'The AI-Powered platform for Bangladesh\'s youth to discover skills, learn new courses, get resume feedback, and find opportunities.',
  keywords: [
    "skills", "Bangladesh", "youth", "AI", "jobs", "resume", "courses", "freelancing", "digital skills"
  ],
  openGraph: {
    title: "SkillDash - AI Gateway for Career Readiness",
    description: "Unlock your skills, grow your career. Discover, Learn, Get Hired.",
    url: "https://skilldash.live",
    type: "website"
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* SEO & OpenGraph */}
        <meta property="og:title" content="SkillDash - AI Gateway for Career Readiness" />
        <meta property="og:description" content="Unlock your skills, grow your career. Discover, Learn, Get Hired." />
        <meta property="og:url" content="https://skilldash.live" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://skilldash.live/og-image.png" />
        <meta name="keywords" content="skills, Bangladesh, youth, AI, jobs, resume, courses, freelancing, digital skills" />
        {/* Google Tag Manager (head) using Next.js Script */}
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 transition-colors duration-300`}>
        {/* Google Tag Manager (body) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
