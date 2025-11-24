import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../contexts/AuthContext'
import EmailVerificationBanner from '../components/auth/EmailVerificationBanner'
import SparkEffectInitializer from '../components/SparkEffectInitializer'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const GTM_ID = 'GTM-MT2LDFM3'
// Optimize font loading with display swap
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'SkillDash - Bridge the Skill Gap for Students',
  description: 'Discover your strengths, complete AI-assessed learning paths, perfect your resume and unlock career opportunities.',
  keywords: [
    "skill assessment platform", "student career readiness", "AI resume feedback", 
    "skills to job", "learn digital skills", "career platform students", 
    "job training platform", "skill verification", "talent-to-employment", 
    "freelance skills platform", "career opportunities", "professional development"
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
    title: "SkillDash - Bridge the Skill Gap",
    description: "Unlock your potential with AI-driven skill discovery, targeted learning, resume workshops and access to career opportunities.",
    url: "https://skilldash.live",
    siteName: "SkillDash",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://skilldash.live/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "SkillDash - Bridge the Skill Gap",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillDash - Bridge the Skill Gap for Students',
    description: 'From skill discovery to job match: AI-powered paths and real opportunities await.',
    images: ['https://skilldash.live/web-app-manifest-512x512.png'],
    creator: '@SkillDash',
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=contain" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="application-name" content="SkillDash" />
        <meta name="apple-mobile-web-app-title" content="SkillDash" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Performance optimizations */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        
        {/* SAFE FIX: CSS preload for performance */}
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />

        {/* Enhanced Favicon Links */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://skilldash.live" />
        
        {/* Sitemap Link for Search Engines */}
        <link rel="sitemap" type="application/xml" href="https://skilldash.live/sitemap.xml" />
        
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
              "alternateName": "SkillDash - Bridge the Skill Gap for Students",
              "description": "Discover your strengths, complete AI-assessed learning paths, perfect your resume and unlock career opportunities.",
              "url": "https://skilldash.live",
              "sameAs": [
                "https://www.facebook.com/skilldash",
                "https://twitter.com/skilldash",
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
                  "url": "https://skilldash.live/web-app-manifest-512x512.png",
                  "width": 512,
                  "height": 512
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": ["English"]
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
              "description": "AI-assessed skill development and career platform for students worldwide",
              "url": "https://skilldash.live",
              "logo": "https://skilldash.live/web-app-manifest-512x512.png",
              "educationalCredentialAwarded": "Digital Skills Certificate",
              "offers": [
                {
                  "@type": "Course",
                  "name": "AI-Assessed Skill Discovery",
                  "description": "Discover your hidden talents and potential career paths"
                },
                {
                  "@type": "Course", 
                  "name": "Resume Feedback Service",
                  "description": "Get expert feedback on your resume with AI insights"
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 transition-colors duration-300`} suppressHydrationWarning={true}>
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
          <SparkEffectInitializer />
          
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
