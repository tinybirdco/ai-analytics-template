import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboarding } from '@/app/context/OnboardingContext'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const ONBOARDING_STEPS = [
  {
    title: 'AI Cost Calculator',
    description: 'Visualize your AI costs using natural language and AI',
    component: 'CostCalculator',
    targetSelector: '[data-calculator-button]'
  },
  {
    title: 'Filter Chips',
    description: 'Filter your data by multiple criteria using AI',
    component: 'FilterChips',
    targetSelector: '[data-search-input]'
  },
  {
    title: 'Vector Search',
    description: 'Search your LLM calls using vector search',
    component: 'VectorSearch',
    targetSelector: '[data-table-search]'
  }
]

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { currentStep, setCurrentStep } = useOnboarding()
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if all target elements are available
    const checkTargets = () => {
      const allTargetsAvailable = ONBOARDING_STEPS.every(step => {
        const element = document.querySelector(step.targetSelector)
        return element !== null
      })

      if (allTargetsAvailable) {
        setIsReady(true)
      } else {
        // If not all targets are available, try again in 100ms
        setTimeout(checkTargets, 100)
      }
    }

    checkTargets()
  }, [])

  useEffect(() => {
    if (!isOpen || !isReady) return

    const targetElement = document.querySelector(ONBOARDING_STEPS[currentStep].targetSelector)
    if (!targetElement) return

    // Add highlight class to target element
    targetElement.classList.add('onboarding-highlight')

    const rect = targetElement.getBoundingClientRect()
    const modalWidth = 573 // Exact modal width
    const modalHeight = 540 // Exact modal height
    const padding = 20

    let top = rect.top - modalHeight - padding
    let left = rect.left // Align with target's left edge

    // Adjust position if modal would go off screen
    if (top < padding) {
      top = rect.bottom + padding
    }

    if (left < padding) {
      left = padding
    }

    if (left + modalWidth > window.innerWidth - padding) {
      left = window.innerWidth - modalWidth - padding
    }

    setPosition({ top, left })

    // Cleanup function to remove highlight
    return () => {
      targetElement.classList.remove('onboarding-highlight')
    }
  }, [currentStep, isOpen, isReady])

  if (!isOpen || !isReady) return null

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
      setCurrentStep(0)
    }
  }

  const handleSkip = () => {
    onClose()
    setCurrentStep(0)
  }

  return (
    <div className="fixed inset-0 z-50 font-['Roboto']">
      <div className="fixed inset-0 bg-black/75" onClick={handleSkip} />
      <div
        data-onboarding-modal
        className="fixed bg-[#1C1C1C] w-[573px] h-[540px] overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translate(0, 0)',
        }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 pb-0">
          <div className="flex items-center space-x-2">
            <h2 className="title-font">
              {ONBOARDING_STEPS[currentStep].title}
            </h2>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <button 
            onClick={handleSkip}
            className="settings-button"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Description */}
        <div className="px-4 pt-1">
          <p className="text-[#8D8D8D] text-sm">
            {ONBOARDING_STEPS[currentStep].description}
          </p>
        </div>

        {/* Rest of modal content */}
        <div className="flex flex-col h-[calc(540px-88px)] pt-8">
          <div className="flex-1 bg-black/50 mb-8">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              src={`/onboarding/${ONBOARDING_STEPS[currentStep].component.toLowerCase()}.mp4`}
            />
          </div>

          <div className="flex items-center justify-between bg-[#1C1C1C]">
            <div className="flex gap-2 pl-4">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-3 h-3 rounded-full',
                    currentStep === index ? 'bg-[#27F795]' : 'bg-[#C6C6C6]'
                  )}
                />
              ))}
            </div>

            <div className="flex">
              <button
                onClick={handleSkip}
                className="h-[48px] px-12 text-[#F4F4F4] hover:text-white transition-colors"
              >
                Skip tour
              </button>
              <button
                onClick={handleNext}
                className="h-[48px] px-12 bg-[#27F795] text-black hover:bg-[#20C77A] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 