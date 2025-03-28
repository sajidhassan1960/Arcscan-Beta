"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Globe, Database, BarChartIcon as ChartBar, Lightbulb } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ResearchAnimationProps {
  step: number
  searchQueries: string[]
  sources: { name: string; icon: string; url?: string; publishedDate?: string }[]
  progress: number
  onComplete?: () => void
}

export function ResearchAnimation({ step, searchQueries, sources, progress, onComplete }: ResearchAnimationProps) {
  const [activeQuery, setActiveQuery] = useState(0)
  const [visibleSources, setVisibleSources] = useState<number[]>([])
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Animation variants
  const stepVariants = {
    initial: { opacity: 0, x: -20 },
    animate: (custom: number) => ({
      opacity: step >= custom ? 1 : 0.5,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom easing curve
        delay: custom * 0.1,
      },
    }),
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  useEffect(() => {
    if (step !== 2 || searchQueries.length === 0) return

    const interval = setInterval(() => {
      setActiveQuery((prev) => {
        if (prev >= searchQueries.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [step, searchQueries])

  useEffect(() => {
    if (step !== 3 || sources.length === 0) return

    let count = 0
    const interval = setInterval(() => {
      if (count >= sources.length) {
        clearInterval(interval)
        return
      }
      setVisibleSources((prev) => [...prev, count])
      count++
    }, 250)

    return () => clearInterval(interval)
  }, [step, sources])

  useEffect(() => {
    if (step !== 4) return

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          if (onComplete) setTimeout(onComplete, 500) // Slight delay before completion
          return 100
        }
        return prev + 4
      })
    }, 150)

    return () => clearInterval(interval)
  }, [step, onComplete])

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        {/* Timeline line with gradient effect */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-100 z-0"></div>

        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            custom={index + 1}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 mb-8"
          >
            <div className="flex items-start">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.34, 1.56, 0.64, 1], // Spring-like effect
                  },
                }}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                  step >= index + 1 ? "bg-gradient-to-br from-amber-50 to-amber-100 shadow-md" : "bg-gray-100"
                } mr-4`}
              >
                {[Database, Search, Globe, ChartBar, Lightbulb][index]({
                  className: `h-6 w-6 transition-colors duration-500 ${
                    step >= index + 1 ? "text-amber-500" : "text-gray-400"
                  }`,
                })}

                {/* Pulsing effect for active step */}
                {step === index + 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{
                      opacity: [0, 0.2, 0],
                      scale: [1, 1.5, 1.8],
                      transition: {
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeOut",
                      },
                    }}
                    className="absolute inset-0 bg-amber-200 rounded-full -z-10"
                  />
                )}
              </motion.div>

              <div className="pt-1 flex-1">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      duration: 0.5,
                      delay: index * 0.1 + 0.2,
                    },
                  }}
                  className={`text-lg font-medium transition-colors duration-500 ${
                    step >= index + 1 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {
                    [
                      "Analyzing Business Context",
                      "Searching Latest Information",
                      "Gathering Reliable Sources",
                      "Analyzing Supply Chain Data",
                      "Finalizing Your Risk Assessment",
                    ][index]
                  }
                </motion.h3>

                {step >= index + 1 && (
                  <AnimatePresence>
                    <motion.div
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="mt-2"
                    >
                      <div className="relative">
                        <Progress
                          value={step === index + 1 ? progress : 100}
                          className="h-1.5 mb-4 bg-gray-100"
                          indicatorClassName="bg-gradient-to-r from-amber-400 to-amber-500"
                        />

                        {/* Shimmer effect on progress bar */}
                        {step === index + 1 && (
                          <motion.div
                            initial={{ x: "-100%" }}
                            animate={{
                              x: "100%",
                              transition: {
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                              },
                            }}
                            className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                          />
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

