'use client'

import { useEffect } from 'react'
import { initSentry } from '@/lib/sentry'

export default function SentryInitializer() {
  useEffect(() => {
    // Initialize Sentry on client side
    initSentry()
  }, [])

  return null
}
