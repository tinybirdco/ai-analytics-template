'use client'
import { useEffect, useState } from 'react'
import { Inter } from "next/font/google"
import "./globals.css"
import { TinybirdProvider } from '@/providers/TinybirdProvider'
import { ClerkProvider } from '@clerk/nextjs'
import { useTinybirdToken } from '@/providers/TinybirdProvider'

const inter = Inter({ subsets: ["latin"] })

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { setToken } = useTinybirdToken()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    console.log('Fetching token...');
    fetch(window.location.pathname)
      .then(response => {
        const token = response.headers.get('x-tinybird-token')
        console.log('Got token:', token);
        if (token) {
          console.log('Setting token...');
          setToken(token)
          setIsReady(true)
        }
      })
  }, [setToken])

  if (!isReady) return <div>Loading...</div>

  return children
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClerkProvider>
          <TinybirdProvider>
            <RootLayoutContent>{children}</RootLayoutContent>
          </TinybirdProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}