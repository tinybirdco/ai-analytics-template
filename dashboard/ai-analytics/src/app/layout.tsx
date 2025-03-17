'use client'
import { useEffect, useState } from 'react'
import { Inter } from "next/font/google"
import "./globals.css"
import { TinybirdProvider } from '@/providers/TinybirdProvider'
import { ClerkProvider } from '@clerk/nextjs'
import { useTinybirdToken } from '@/providers/TinybirdProvider'
import { ModalProvider } from './context/ModalContext'
import CostPredictionModal from './components/CostPredictionModal'
import { useModal } from './context/ModalContext'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

const inter = Inter({ subsets: ["latin"] })

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { setToken, setOrgName } = useTinybirdToken()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    fetch(window.location.pathname)
      .then(response => {
        const token = response.headers.get('x-tinybird-token')
        const orgName = response.headers.get('x-org-name')
        if (token) {
          setToken(token)
          setOrgName(orgName || '')
          setIsReady(true)
        }
      })
  }, [setToken, setOrgName])

  if (!isReady) return <div>Loading...</div>

  return children
}

function ModalController({ filters }: { filters: Record<string, string | undefined> }) {
  const { isCostPredictionOpen, openCostPrediction, closeCostPrediction } = useModal()
  
  // Setup Cmd+K shortcut
  useKeyboardShortcut('k', openCostPrediction, true)
  
  return (
    <CostPredictionModal 
      isOpen={isCostPredictionOpen} 
      onClose={closeCostPrediction}
      currentFilters={filters}
    />
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClerkProvider>
          <TinybirdProvider>
            <ModalProvider>
              <RootLayoutContent>
                {children}
                <ModalController filters={{}} />
              </RootLayoutContent>
            </ModalProvider>
          </TinybirdProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}