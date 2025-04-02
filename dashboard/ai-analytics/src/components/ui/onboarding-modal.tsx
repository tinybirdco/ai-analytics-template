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

// Add this CSS at the top of the file, after the imports
const highlightStyles = `
  .onboarding-highlight {
    position: relative;
    z-index: 51;
  }
  
  .onboarding-highlight::before {
    content: '';
    position: absolute;
    inset: -4px;
    background: rgba(39, 247, 149, 0.1);
    border: 2px solid #27F795;
    border-radius: 4px;
    pointer-events: none;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(39, 247, 149, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(39, 247, 149, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(39, 247, 149, 0);
    }
  }
`;

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { currentStep, setCurrentStep } = useOnboarding()
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!isOpen) return

    const targetElement = document.querySelector(ONBOARDING_STEPS[currentStep].targetSelector)
    if (!targetElement) return

    // Add highlight class to target element
    targetElement.classList.add('onboarding-highlight')

    const rect = targetElement.getBoundingClientRect()
    const modalWidth = 400 // Approximate modal width
    const modalHeight = 300 // Approximate modal height
    const padding = 20

    let top = rect.top - modalHeight - padding
    let left = rect.left + (rect.width - modalWidth) / 2

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
  }, [currentStep, isOpen])

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
    <div className="fixed inset-0 z-50 font-['Roboto']">
      <div className="fixed inset-0 bg-black/50" onClick={handleSkip} />
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
            <span className="text-[#27F795]">✧</span>
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
            {/* We'll replace this with actual components later */}
            <div className="h-full flex items-center justify-center text-gray-500">
              {ONBOARDING_STEPS[currentStep].component} Preview
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#1C1C1C]">
            <div className="flex gap-2 pl-6">
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
                className="h-[48px] px-6 text-[#F4F4F4] hover:text-white transition-colors"
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