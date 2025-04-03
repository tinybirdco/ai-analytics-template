'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Github, X, HelpCircle } from 'lucide-react'
import { TinybirdIcon } from '@/app/components/icons'
import { OnboardingModal } from './onboarding-modal'

interface FloatingNotificationProps {
  className?: string
  title?: string
  links?: {
    github?: string
    tinybird?: string
    close?: () => void
  }
}

export function FloatingNotification({
  className,
  title = 'Fork and build your own LLM tracker',
  links = {},
}: FloatingNotificationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [position, setPosition] = useState({ x: 16, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)
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
    setShowOnboarding(true)
  }, [])

  // Add highlight when onboarding closes
  useEffect(() => {
    if (!showOnboarding) {
      setIsHighlighted(true)
      // Remove highlight after 5 seconds
      const timer = setTimeout(() => {
        setIsHighlighted(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showOnboarding])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      // Remove highlight when user interacts with the notification
      setIsHighlighted(false)
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

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'fixed flex items-center bg-[var(--accent)] shadow-lg border-l-[3px] border-l-[#27F795] pl-0 font-["Roboto"] transition-all duration-150 ease-in-out w-auto',
          isCollapsed ? 'gap-0' : 'gap-4',
          isHighlighted && 'floating-notification-highlight',
          className
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-4'}`}>
          <button
            onClick={() => setShowOnboarding(true)}
            className="p-4 text-[#262626] transition-colors hover:bg-[#267A52] hover:text-white active:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          {!isCollapsed && (
            <div className="text-sm text-[#262626] !-ml-4 whitespace-nowrap">{title}</div>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-0">
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
                <Github className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-4 text-[#262626] transition-colors hover:bg-[#267A52] hover:text-white active:text-white ml-4"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-4 text-[#262626] transition-colors hover:bg-[#267A52] hover:text-white active:text-white"
          >
            <div className="h-4 w-4 flex items-center justify-center">+</div>
          </button>
        )}
      </div>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  )
} 