"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface ResearchStepProps {
  step: number
  title: string
  currentStep: number
  completedSteps: number[]
  content: React.ReactNode
}

export function ResearchStep({ step, title, currentStep, completedSteps, content }: ResearchStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: currentStep >= step ? 1 : 0.5, y: 0 }}
      transition={{ duration: 0.5, delay: currentStep >= step ? 0 : 0.3 }}
      className="mb-6"
    >
      <div className="flex items-start mb-2">
        <div className="mt-1 mr-3">
          <CheckCircle
            className={`h-5 w-5 ${
              currentStep >= step || completedSteps.includes(step) ? "text-red-500" : "text-gray-300"
            }`}
          />
        </div>
        <div>
          <h2 className="font-medium text-gray-800">{title}</h2>
        </div>
      </div>
      <AnimatePresence>
        {currentStep === step && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

