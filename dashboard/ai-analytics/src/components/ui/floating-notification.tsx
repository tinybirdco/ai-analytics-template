'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X, HelpCircle } from 'lucide-react'
import { TinybirdIcon, GithubIcon } from '@/app/components/icons'
import { OnboardingModal } from './onboarding-modal'

interface FloatingNotificationProps {
  className?: string
  title?: string
  links?: {
    github?: string
    tinybird?: string
    close?: () => void
  }
  hideSignIn?: boolean
}

export function FloatingNotification({
  className,
  title = 'Fork and deploy your own LLM tracker',
  links = {},
  hideSignIn = false,
}: FloatingNotificationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [position, setPosition] = useState({ x: 16, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Set initial position and handle window resize
  useEffect(() => {
    const updatePosition = () => {
      setPosition({
        x: 16,
        y: window.innerHeight - 64 // 64px is the height of the notification
      })
    }

    // Set initial position
    updatePosition()

    // Add resize listener
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [])

  // Show onboarding modal on page load
  useEffect(() => {
    if (!hideSignIn) {
      setShowOnboarding(true)
    }
  }, [hideSignIn])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  if (hideSignIn) return null;

  return (
    <>
      <div className="fixed flex" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
        <div
          ref={containerRef}
          className={cn(
            'flex items-center bg-[var(--accent)] shadow-lg pl-0 font-["Roboto"] transition-all duration-150 ease-in-out',
            isCollapsed ? 'w-auto' : 'w-auto gap-4',
            className
          )}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
        >
          <button
            onClick={() => setShowOnboarding(true)}
            className="p-4 text-[#262626] transition-colors hover:bg-[#267A52] hover:text-white active:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {!isCollapsed && (
            <>
              <div className="text-sm text-[#262626] !-ml-4 whitespace-nowrap">{title}</div>
              <div className="flex items-center gap-0 ml-auto">
                {links.tinybird && (
                  <a
                    href={links.tinybird}
                    target="_blank"
                    className="p-4 text-[#262626] transition-colors hover:bg-[#267A52] hover:text-white active:text-white"
                  >
                    <TinybirdIcon className="h-4 w-4" />
                  </a>
                )}
                {links.github && (
                  <a
                    href={links.github}
                    target="_blank"
                    className="p-4 text-[#262626] transition-colors hover:bg-[#267A52] hover:text-white active:text-white"
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-4 text-[#262626] transition-colors hover:bg-[#267A52] hover:text-white active:text-white -ml-4"
          >
            {isCollapsed ? (
              <div className="h-4 w-4 flex items-center justify-center">+</div>
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  )
} 