"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

interface ResearchStepAnimationProps {
  step: number
  title: string
  currentStep: number
  completedSteps: number[]
  searchQueries?: string[]
  activeQuery?: number
  sources?: Array<{
    name: string
    icon: string
    url?: string
    publishedDate?: string
    publishedTime?: string
  }>
  visibleSources?: number
  progress?: number
  insights?: Array<{
    title: string
    description: string
  }>
  visibleInsights?: number
}

export function ResearchStepAnimation({
  step,
  title,
  currentStep,
  completedSteps = [],
  searchQueries = [],
  activeQuery = 0,
  sources = [],
  visibleSources = 0,
  progress = 0,
  insights = [],
  visibleInsights = 0,
}: ResearchStepAnimationProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const [processingText, setProcessingText] = useState("Analyzing data")
  const [microProgress, setMicroProgress] = useState(0)

  useEffect(() => {
    if (currentStep === step) {
      setShowDetails(true)

      // Start pulse animation when this step is active
      setPulseAnimation(true)

      // For step 4 (Analyzing supply chain data), add dynamic text changes
      if (step === 4) {
        const texts = [
          "Analyzing supply chain data",
          "Processing risk factors",
          "Calculating risk scores",
          "Evaluating industry benchmarks",
          "Identifying key vulnerabilities",
          "Compiling insights",
        ]

        let textIndex = 0
        const textInterval = setInterval(() => {
          textIndex = (textIndex + 1) % texts.length
          setProcessingText(texts[textIndex])
        }, 3000)

        // Add micro-progress animation to make progress bar appear active
        const microProgressInterval = setInterval(() => {
          setMicroProgress((prev) => (prev + 1) % 100)
        }, 150)

        return () => {
          clearInterval(textInterval)
          clearInterval(microProgressInterval)
        }
      }
    } else {
      setPulseAnimation(false)
    }
  }, [currentStep, step])

  const getStepIcon = () => {
    const baseClass = "h-5 w-5 transition-colors duration-500"
    const activeClass = "text-green-500"
    const inactiveClass = "text-gray-300"

    return (
      <CheckCircle
        className={`${baseClass} ${currentStep >= step || completedSteps.includes(step) ? activeClass : inactiveClass}`}
      />
    )
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom easing curve
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const detailsVariants = {
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

  // Create a custom progress component with shimmer effect
  const CustomProgress = ({ value = 0, isActive = false }) => {
    return (
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />

        {/* Add shimmer effect when active */}
        {isActive && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{
              x: "100%",
              transition: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                ease: "linear",
              },
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          />
        )}

        {/* Add micro-progress indicator for step 4 when progress seems stuck */}
        {step === 4 && progress < 70 && progress > 0 && (
          <motion.div
            className="absolute top-0 h-full bg-amber-300"
            style={{
              width: "4px",
              left: `calc(${progress}% - 2px)`,
              opacity: 0.8,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              transition: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.2,
              },
            }}
          />
        )}
      </div>
    )
  }

  // Activity indicator dots
  const ActivityIndicator = () => (
    <div className="flex space-x-1 ml-2">
      <motion.div
        className="w-1 h-1 rounded-full bg-amber-500"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
      />
      <motion.div
        className="w-1 h-1 rounded-full bg-amber-500"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
      />
      <motion.div
        className="w-1 h-1 rounded-full bg-amber-500"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, delay: 0.8 }}
      />
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="mb-6">
      <div
        className={`flex items-start mb-2 cursor-pointer transition-all duration-500 ${
          currentStep === step
            ? "bg-gradient-to-r from-amber-50 to-transparent p-3 rounded-md shadow-sm border-l-2 border-amber-400"
            : "hover:bg-gray-50 p-3 rounded-md"
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: {
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1], // Spring-like effect
            },
          }}
          className="mt-1 mr-3 relative"
        >
          {completedSteps.includes(step) ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : currentStep === step ? (
            <div className="relative">
              <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
              <motion.div
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{
                  opacity: [0, 0.2, 0],
                  scale: [1, 1.5, 1.8],
                  transition: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeOut",
                  },
                }}
                className="absolute inset-0 bg-amber-400 rounded-full -z-10"
              />
            </div>
          ) : (
            getStepIcon()
          )}
        </motion.div>
        <div className="flex-1">
          <motion.h2
            variants={itemVariants}
            className={`font-medium transition-colors duration-500 ${
              currentStep === step ? "text-amber-700" : "text-gray-800"
            }`}
          >
            {title}
            {currentStep === step && progress > 0 && progress < 100 && (
              <span className="ml-2 text-xs font-normal bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                {progress}%
              </span>
            )}
          </motion.h2>
        </div>
      </div>

      <AnimatePresence>
        {(showDetails || currentStep === step) && (
          <motion.div
            variants={detailsVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="ml-8 overflow-hidden"
          >
            {step === 1 && (
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  {currentStep === step ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  )}
                  <span>Analyzing industry-specific risk factors</span>
                  {currentStep === step && <ActivityIndicator />}
                </div>
                {currentStep === step && (
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${progress}%`,
                      transition: {
                        duration: 0.8,
                        ease: [0.34, 1.56, 0.64, 1],
                      },
                    }}
                  >
                    <CustomProgress value={progress} isActive={currentStep === step} />
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && currentStep === step && (
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-500" />
                  <span>Searching for latest information</span>
                  <ActivityIndicator />
                </div>

                <div className="space-y-2">
                  {searchQueries.slice(0, activeQuery + 1).map((query, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: index === activeQuery ? 1 : 0.6,
                        x: 0,
                        transition: {
                          duration: 0.5,
                          delay: index * 0.1,
                          ease: "easeOut",
                        },
                      }}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <CheckCircle
                        className={`h-4 w-4 mr-2 ${index === activeQuery ? "text-amber-500" : "text-gray-400"}`}
                      />
                      <span className={index === activeQuery ? "font-medium" : ""}>{query}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${progress}%`,
                    transition: {
                      duration: 0.8,
                      ease: [0.34, 1.56, 0.64, 1],
                    },
                  }}
                >
                  <CustomProgress value={progress} isActive={currentStep === step} />
                </motion.div>
              </motion.div>
            )}

            {step === 3 && currentStep === step && (
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-500" />
                  <span>Gathering reliable sources</span>
                  <ActivityIndicator />
                </div>

                {sources.length === 0 && progress > 50 ? (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    Having difficulty finding relevant sources. This may indicate limited public data for your specific
                    business context.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sources.slice(0, visibleSources).map((source, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          transition: {
                            duration: 0.4,
                            delay: index * 0.05,
                            ease: [0.34, 1.56, 0.64, 1],
                          },
                        }}
                        className="flex items-center text-xs p-1.5 border border-gray-200 rounded-md bg-white shadow-sm"
                      >
                        <div className="w-4 h-4 flex items-center justify-center mr-2 text-amber-500">
                          {source.icon}
                        </div>
                        <span className="text-gray-700 truncate">{source.name}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {sources.length > 0 &&
                  sources.some((source) => {
                    // Check if any source is potentially outdated
                    if (!source.publishedDate) return false

                    try {
                      const date = new Date(source.publishedDate)
                      const twoYearsAgo = new Date()
                      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

                      return date < twoYearsAgo
                    } catch (e) {
                      return false
                    }
                  }) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 mt-2"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="font-medium">Some sources may contain outdated information.</span>
                      </div>
                      <p className="mt-1 text-xs">
                        We're prioritizing recent sources to ensure your analysis is based on the latest data.
                      </p>
                    </motion.div>
                  )}

                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${progress}%`,
                    transition: {
                      duration: 0.8,
                      ease: [0.34, 1.56, 0.64, 1],
                    },
                  }}
                >
                  <CustomProgress value={progress} isActive={currentStep === step} />
                </motion.div>
              </motion.div>
            )}

            {step === 4 && currentStep === step && (
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-500" />
                  <span>{processingText}</span>
                  <ActivityIndicator />
                </div>

                {/* Add some dynamic processing indicators */}
                <div className="grid grid-cols-3 gap-2 my-2">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 bg-amber-100 rounded-full overflow-hidden"
                      animate={{
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.3,
                      }}
                    >
                      <motion.div
                        className="h-full bg-amber-400"
                        animate={{
                          width: ["0%", "100%", "0%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.3,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${progress}%`,
                    transition: {
                      duration: 0.8,
                      ease: [0.34, 1.56, 0.64, 1],
                    },
                  }}
                >
                  <CustomProgress value={progress} isActive={true} />
                </motion.div>

                {/* Add processing status messages */}
                {progress < 70 && (
                  <div className="text-xs text-gray-500 italic">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      {progress < 30
                        ? "Extracting key risk factors from multiple sources..."
                        : progress < 50
                          ? "Calculating risk scores based on industry benchmarks..."
                          : "Compiling insights and recommendations..."}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 5 && currentStep === step && (
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-500" />
                  <span>Finalizing your risk assessment</span>
                  <ActivityIndicator />
                </div>

                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${progress}%`,
                    transition: {
                      duration: 0.8,
                      ease: [0.34, 1.56, 0.64, 1],
                    },
                  }}
                >
                  <CustomProgress value={progress} isActive={currentStep === step} />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

