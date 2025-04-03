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
  const [upvotes, setUpvotes] = useState<number>(1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUpvotes = async () => {
      try {
        const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_PRODUCT_HUNT_TOKEN,
          },
          body: JSON.stringify({
            query: `
              query {
                post(id: "llm-performance-tracker") {
                  votesCount
                }
              }
            `
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data?.data?.post?.votesCount) {
            setUpvotes(data.data.post.votesCount);
          }
        }
      } catch (error) {
        console.error('Error fetching Product Hunt upvotes:', error);
      }
    };

    fetchUpvotes();
  }, []);

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
    <>
      <div className="fixed flex" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
        {!isCollapsed && (
          <a 
            href="https://www.producthunt.com/posts/llm-performance-tracker?comment=4513799"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center bg-[#FF6153] text-white h-[48px] border-r-[2px] border-r-[#0a0a0a]"
          >
            <div className="flex items-center gap-3 px-4">
              <div className="w-8 h-8">
                <svg width="32" height="32" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fillRule="evenodd">
                    <path d="M40 20c0 11.046-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0s20 8.954 20 20" fill="#fff"/>
                    <path d="M22.667 20H17v-6h5.667a3 3 0 0 1 0 6m0-10H13v20h4v-6h5.667a7 7 0 1 0 0-14" fill="#FF6154"/>
                  </g>
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-medium">FEATURED ON</span>
                <span className="text-[18px] font-semibold -mt-[1px]">Product Hunt</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded ml-2">
                <span className="text-[15px]">▲</span>
                <span className="font-medium">{upvotes}</span>
              </div>
            </div>
          </a>
        )}

        <div
          ref={containerRef}
          className={cn(
            'flex items-center bg-[var(--accent)] shadow-lg border-l-[3px] border-l-[#FF6153] pl-0 font-["Roboto"] transition-all duration-150 ease-in-out',
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