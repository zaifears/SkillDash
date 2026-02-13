'use client'

import { useEffect } from 'react'
import { initSentry } from '@/lib/sentry'

export default function SentryInitializer() {
  useEffect(() => {
    // ✅ OPTIMIZATION: Defer initialization to avoid blocking page load
    const timer = setTimeout(() => {
      initSentry()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return null
}
