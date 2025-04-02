import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboarding } from '@/app/context/OnboardingContext'
import { useEffect, useState } from 'react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const ONBOARDING_STEPS = [
  {
    title: 'AI Calculator',
    description: 'Visualize your expenses with a simple click',
    component: 'CostCalculator',
    targetSelector: '[data-calculator-button]'
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track your AI usage and costs in real-time',
    component: 'AnalyticsDashboard',
    targetSelector: '[data-search-input]'
  },
  {
    title: 'API Integration',
    description: 'Seamlessly integrate with your existing infrastructure',
    component: 'ApiIntegration',
    targetSelector: '[data-table-search]'
  }
]

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { currentStep, setCurrentStep } = useOnboarding()
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const targetElement = document.querySelector(ONBOARDING_STEPS[currentStep].targetSelector)
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        const modalElement = document.querySelector('[data-onboarding-modal]')
        const modalRect = modalElement?.getBoundingClientRect()
        const modalHeight = modalRect?.height || 0
        const modalWidth = modalRect?.width || 0

        // Calculate position based on step
        let top = 0
        let left = 0

        switch (currentStep) {
          case 0: // Under AI Calculator button
            top = rect.bottom + 20
            left = rect.left - (modalWidth / 2) + (rect.width / 2)
            break
          case 1: // Under top bar search
            top = rect.bottom + 20
            left = rect.left - (modalWidth / 2) + (rect.width / 2)
            break
          case 2: // Above table search
            top = rect.top - modalHeight - 20
            left = rect.left - (modalWidth / 2) + (rect.width / 2)
            break
        }

        // Ensure modal stays within viewport
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        left = Math.max(20, Math.min(left, viewportWidth - modalWidth - 20))
        top = Math.max(20, Math.min(top, viewportHeight - modalHeight - 20))

        setPosition({ top, left })
      }
    }

    // Update position initially and on window resize
    updatePosition()
    window.addEventListener('resize', updatePosition)

    // Update position when step changes
    const observer = new MutationObserver(updatePosition)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('resize', updatePosition)
      observer.disconnect()
    }
  }, [isOpen, currentStep])

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={handleSkip} />
      <div
        data-onboarding-modal
        className="fixed bg-[#1C1C1C] rounded-lg w-full max-w-md mx-4 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translate(0, 0)',
        }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-roboto text-white">
              {ONBOARDING_STEPS[currentStep].title}
            </h2>
            <span className="text-[#27F795]">✧</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-400 mb-8 font-roboto">
            {ONBOARDING_STEPS[currentStep].description}
          </p>

          <div className="bg-black/50 rounded-lg p-8 mb-8">
            {/* We'll replace this with actual components later */}
            <div className="h-64 flex items-center justify-center text-gray-500">
              {ONBOARDING_STEPS[currentStep].component} Preview
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    currentStep === index ? 'bg-[#27F795]' : 'bg-gray-600'
                  )}
                />
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSkip}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors font-roboto"
              >
                Skip tour
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-[#27F795] text-black rounded hover:bg-[#20C77A] transition-colors font-roboto"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 