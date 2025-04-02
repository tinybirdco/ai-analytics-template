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
  title = 'Learn more:',
  links = {},
}: FloatingNotificationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Check if it's first load
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
      localStorage.setItem('hasSeenOnboarding', 'true')
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'fixed flex items-center bg-[#262626] shadow-lg border-l-[3px] border-l-[#27F795] pl-0 font-["Roboto"] transition-[width] duration-150 ease-in-out w-auto',
          isCollapsed ? 'gap-0' : 'gap-4',
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
            className="p-4 text-muted-foreground transition-colors hover:bg-transparent hover:text-[var(--accent)] active:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          {!isCollapsed && (
            <div className="text-sm text-muted-foreground !-ml-4">{title}</div>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-0">
            {links.tinybird && (
              <a
                href={links.tinybird}
                target="_blank"
                className="p-4 text-muted-foreground transition-colors hover:bg-transparent hover:text-[var(--accent)] active:text-white"
              >
                <TinybirdIcon className="h-4 w-4" />
              </a>
            )}
            {links.github && (
              <a
                href={links.github}
                target="_blank"
                className="p-4 text-muted-foreground transition-colors hover:bg-transparent hover:text-[var(--accent)] active:text-white"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="floating-notification-button text-muted-foreground transition-colors hover:bg-[#27F795] hover:text-[#262626] active:bg-[#267A52] active:border-none active:text-[#FFFFFF] ml-4"
            >
              {isCollapsed ? '+' : <X className="h-4 w-4" />}
            </button>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="floating-notification-button text-muted-foreground transition-colors hover:bg-[#27F795] hover:text-[#262626] active:bg-[#267A52] active:border-none active:text-[#FFFFFF]"
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