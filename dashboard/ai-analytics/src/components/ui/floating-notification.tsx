'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Github, X, Send } from 'lucide-react'

interface FloatingNotificationProps {
  className?: string
  title?: string
  links?: {
    github?: string
    telegram?: string
    close?: () => void
  }
}

export function FloatingNotification({
  className,
  title = 'Learn more about this template:',
  links = {},
}: FloatingNotificationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
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

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed flex items-center gap-4 bg-[#262626] shadow-lg border-l-[3px] border-l-[#27F795] pl-4',
        isCollapsed ? 'w-auto' : 'w-auto',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">ⓘ</div>
        {!isCollapsed && (
          <div className="text-sm text-muted-foreground !-ml-2">{title}</div>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex items-center gap-0">
          {links.telegram && (
            <a
              href={links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 text-muted-foreground transition-colors hover:bg-transparent hover:text-[var(--accent)] active:text-white"
            >
              <Send className="h-4 w-4" />
            </a>
          )}
          {links.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
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
  )
} 