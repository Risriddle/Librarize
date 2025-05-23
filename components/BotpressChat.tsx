// components/BotpressChat.jsx
'use client'
import { useEffect } from 'react'

export default function BotpressChat() {
  useEffect(() => {
    const script1 = document.createElement('script')
    script1.src = 'https://cdn.botpress.cloud/webchat/v2.5/inject.js'
    script1.async = true
    document.body.appendChild(script1)

    const script2 = document.createElement('script')
    script2.src = 'https://files.bpcontent.cloud/2025/05/23/10/20250523102246-LYKGHS93.js'
    script2.async = true
    document.body.appendChild(script2)

    return () => {
      document.body.removeChild(script1)
      document.body.removeChild(script2)
    }
  }, [])

  return null // No visible UI, just scripts
}
