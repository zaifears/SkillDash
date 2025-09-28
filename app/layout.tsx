import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../contexts/AuthContext'
import EmailVerificationBanner from '../components/auth/EmailVerificationBanner'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const GTM_ID = 'GTM-MT2LDFM3'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillDash: AI-Powered Skill Platform for Bangladesh\'s Youth',
  description: 'The AI-Powered platform for Bangladesh\'s youth to discover skills, learn new courses, get resume feedback, and find opportunities.',
  keywords: [
    "skills", "Bangladesh", "youth", "AI", "jobs", "resume", "courses", "freelancing", "digital skills", "career development"
  ],
  authors: [{ name: 'SkillDash Team' }],
  creator: 'SkillDash',
  publisher: 'SkillDash',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "SkillDash - AI Gateway for Career Readiness",
    description: "Unlock your skills, grow your career. Discover, Learn, Get Hired.",
    url: "https://skilldash.live",
    siteName: "SkillDash",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://skilldash.live/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "SkillDash - AI Gateway for Career Readiness",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillDash - AI Gateway for Career Readiness',
    description: 'Unlock your skills, grow your career. Discover, Learn, Get Hired.',
    images: ['https://skilldash.live/web-app-manifest-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://skilldash.live'),
  alternates: {
    canonical: 'https://skilldash.live',
  },
  verification: {
    google: 'NRcmZt1gkRaisYql52KCRUqEJCyGeTGyXsntWkqYFFk',
  },
  category: 'education',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="application-name" content="SkillDash" />
        <meta name="apple-mobile-web-app-title" content="SkillDash" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Enhanced Favicon Links */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* SEO & OpenGraph */}
        <meta property="og:title" content="SkillDash - AI Gateway for Career Readiness" />
        <meta property="og:description" content="Unlock your skills, grow your career. Discover, Learn, Get Hired." />
        <meta property="og:url" content="https://skilldash.live" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://skilldash.live/web-app-manifest-512x512.png" />
        <meta name="keywords" content="skills, Bangladesh, youth, AI, jobs, resume, courses, freelancing, digital skills" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://skilldash.live" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* 🔧 GTM HEAD SCRIPT */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `
          }}
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SkillDash",
              "alternateName": "SkillDash - AI Gateway for Career Readiness",
              "description": "AI-Powered platform for Bangladesh's youth to discover skills, learn new courses, get resume feedback, and find opportunities.",
              "url": "https://skilldash.live",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://skilldash.live/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "SkillDash",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://skilldash.live/web-app-manifest-512x512.png",
                  "width": 512,
                  "height": 512
                }
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 transition-colors duration-300`}>
        {/* GTM Body Script */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        
        <AuthProvider>
          {/* 🔧 EMAIL VERIFICATION BANNER */}
          <EmailVerificationBanner />
          
          <div className="relative">
            <Navbar />
            <main>{children}</main>
          </div>
        </AuthProvider>
        
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
