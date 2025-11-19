import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../contexts/AuthContext'
import EmailVerificationBanner from '../components/auth/EmailVerificationBanner'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import ServiceWorkerRegistration from './ServiceWorkerRegistration'

const GTM_ID = 'GTM-MT2LDFM3'

// Optimize font loading with display swap
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://skilldash.live'),
  title: {
    default: 'SkillDash: AI-Powered Career Platform for Bangladesh\'s Youth',
    template: '%s | SkillDash',
  },
  description: 'Discover skills, learn courses, get AI resume feedback, and find job opportunities. The leading career development platform for Bangladesh\'s youth with personalized learning paths.',
  keywords: [
    "Bangladesh jobs", "skill development", "AI career platform", "resume feedback", 
    "digital skills Bangladesh", "youth employment", "career opportunities", 
    "freelancing Bangladesh", "job training", "professional development",
    "AI powered learning", "career readiness", "skill assessment"
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
  // ✅ UPDATED: Better Open Graph with dynamic support
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://skilldash.live',
    siteName: 'SkillDash',
    title: 'SkillDash - AI Gateway for Career Readiness',
    description: "Unlock your potential with AI-powered skill discovery, personalized learning, and career opportunities designed for Bangladesh's youth.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SkillDash - AI Gateway for Career Readiness',
      },
    ],
  },
  // ✅ UPDATED: Better Twitter card
  twitter: {
    card: 'summary_large_image',
    title: 'SkillDash - AI Gateway for Career Readiness',
    description: 'Unlock your potential with AI-powered skill discovery and career opportunities for Bangladesh\'s youth.',
    images: ['/og-image.jpg'],
    creator: '@SkillDashBD',
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
  alternates: {
    canonical: 'https://skilldash.live',
  },
  verification: {
    google: 'NRcmZt1gkRaisYql52KCRUqEJCyGeTGyXsntWkqYFFk',
  },
  category: 'education',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Essential Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="application-name" content="SkillDash" />
        <meta name="apple-mobile-web-app-title" content="SkillDash" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Performance optimizations */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        
        {/* SAFE FIX: CSS preload for performance */}
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
        {/* Enhanced Favicon Links */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Canonical URL */}
        <link rel="canonical" href="https://skilldash.live" />
        
        {/* 🚀 DEFERRED GTM - Loads AFTER page loads (MOBILE FIX) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              });
            `
          }}
        />
        {/* Enhanced Structured Data */}
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
              "sameAs": [
                "https://www.facebook.com/skilldash",
                "https://twitter.com/skilldashbd",
                "https://www.linkedin.com/company/skilldash"
              ],
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://skilldash.live/discover?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "SkillDash",
                "url": "https://skilldash.live",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://skilldash.live/og-image.jpg",
                  "width": 1200,
                  "height": 630
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "areaServed": "BD",
                  "availableLanguage": ["English", "Bengali"]
                }
              }
            })
          }}
        />
        {/* Additional Structured Data for Educational Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "SkillDash",
              "description": "AI-powered skill development and career platform for Bangladesh's youth",
              "url": "https://skilldash.live",
              "logo": "https://skilldash.live/og-image.jpg",
              "areaServed": "BD",
              "educationalCredentialAwarded": "Digital Skills Certificate",
              "offers": [
                {
                  "@type": "Course",
                  "name": "AI-Powered Skill Discovery",
                  "description": "Discover your hidden talents and potential career paths"
                },
                {
                  "@type": "Course", 
                  "name": "Resume Feedback Service",
                  "description": "Get AI-powered feedback on your resume"
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 transition-colors duration-300`} suppressHydrationWarning={true}>
        <ServiceWorkerRegistration /> {/* ✅ Only addition for service worker */}
        {/* GTM Body Script - UNCHANGED */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          ></iframe>
        </noscript>
        <AuthProvider>
          <EmailVerificationBanner />
          <div className="relative min-h-screen">
            <Navbar />
            <main role="main">{children}</main>
          </div>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
