'use client'

import { type ReactNode } from 'react'
import Script from 'next/script'

// Pendo snippet key — set NEXT_PUBLIC_NOVUS_API_KEY in .env.local
const PENDO_KEY       = process.env.NEXT_PUBLIC_NOVUS_API_KEY  ?? ''
const PENDO_ACCOUNT   = process.env.NEXT_PUBLIC_NOVUS_PROJECT_ID ?? 'drift-app'

interface Props {
  children: ReactNode
}

export function Providers({ children }: Props) {
  return (
    <>
      {PENDO_KEY ? (
        <Script
          id="pendo-sdk"
          strategy="afterInteractive"
          src={`https://cdn.pendo.io/agent/static/${PENDO_KEY}/pendo.js`}
          onLoad={() => {
            console.log('PENDO LOADED', window.pendo)
            if (typeof window.pendo?.initialize === 'function') {
              window.pendo.initialize({
                visitor: { id: 'anonymous' },
                account: { id: PENDO_ACCOUNT },
              })
              console.log('PENDO INITIALIZED')
            } else {
              console.warn('[Drift] pendo.initialize not available after script load')
            }
          }}
          onError={() => {
            console.error('[Drift] Pendo SDK failed to load — check NEXT_PUBLIC_NOVUS_API_KEY')
          }}
        />
      ) : (
        // Log once so the developer knows analytics are inactive
        // This runs only in client-side rendering, never on the server
        <script
          dangerouslySetInnerHTML={{
            __html: `console.warn('[Drift] NEXT_PUBLIC_NOVUS_API_KEY is not set — Pendo analytics disabled')`,
          }}
        />
      )}
      {children}
    </>
  )
}
