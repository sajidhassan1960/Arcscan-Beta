"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, BookOpen, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataSourcesPanelProps {
  sources: Array<{
    title: string
    url: string
    description?: string
  }>
  maxVisible?: number
  hideLinks?: boolean
}

export function DataSourcesPanel({ sources, maxVisible = 10, hideLinks = false }: DataSourcesPanelProps) {
  const [showAll, setShowAll] = useState(false)
  const visibleSources = showAll ? sources : sources.slice(0, maxVisible)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  // Function to determine source popularity score
  const getSourcePopularityScore = (url = ""): number => {
    // Popular domains ranked by approximate popularity
    const popularDomains = [
      "bloomberg.com",
      "wsj.com",
      "reuters.com",
      "ft.com",
      "economist.com",
      "forbes.com",
      "mckinsey.com",
      "gartner.com",
      "deloitte.com",
      "pwc.com",
      "ey.com",
      "kpmg.com",
      "weforum.org",
      "hbr.org",
      "mit.edu",
      "supplychaindive.com",
      "logisticsmgmt.com",
      "ibm.com",
      "accenture.com",
    ]

    // Extract domain from URL
    let domain = ""
    try {
      domain = new URL(url).hostname.replace("www.", "")
    } catch (e) {
      // If URL parsing fails, try to extract domain using regex
      const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^/]+)/i)
      domain = match ? match[1] : url
    }

    // Find index in popularity list (lower index = more popular)
    const index = popularDomains.findIndex((d) => domain.includes(d))

    // Return score (higher = more popular)
    return index >= 0 ? popularDomains.length - index : 0
  }

  const isOutdatedSource = (url: string, description?: string): boolean => {
    if (!description) return false

    // Check for year mentions in the description
    const yearRegex = /\b(20\d{2})\b/g
    const yearMatches = description.match(yearRegex)

    if (yearMatches) {
      const years = yearMatches.map((y) => Number.parseInt(y))
      const oldestYear = Math.min(...years)
      const currentYear = new Date().getFullYear()

      // Consider it outdated if the oldest year mentioned is more than 2 years ago
      return currentYear - oldestYear > 2
    }

    return false
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
      <div className="flex items-center mb-3">
        <BookOpen className="h-5 w-5 text-amber-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">Research Sources</h3>
        <span className="ml-2 text-sm text-gray-500">{sources.length} references cited</span>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-1">
        {/* Sort sources by popularity score before mapping */}
        {visibleSources
          .sort((a, b) => getSourcePopularityScore(b.url) - getSourcePopularityScore(a.url))
          .map((source, index) => {
            const outdated = isOutdatedSource(source.url, source.description)

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`border-b border-gray-100 last:border-0 hover:bg-gray-100/50 transition-colors duration-200 rounded-md ${
                  outdated ? "bg-amber-50/50" : ""
                }`}
              >
                <div className="py-2 px-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`mr-2 mt-1 ${outdated ? "text-amber-500" : "text-amber-500"}`}>
                        {outdated ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800">{source.title}</h4>
                        <p className="text-xs text-gray-600">
                          {outdated ? (
                            <span className="text-amber-600">Note: This source may contain older information</span>
                          ) : (
                            "Source used for market research and analysis"
                          )}
                        </p>
                        {!hideLinks && source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-500 hover:text-amber-600 flex items-center mt-1 font-medium"
                          >
                            {source.url.length > 60 ? `${source.url.substring(0, 60)}...` : source.url}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-xs px-2 py-1 ${
                          outdated ? "bg-amber-100 text-amber-800" : "bg-amber-100 text-amber-800"
                        } rounded-full`}
                      >
                        {outdated ? "Older Source" : `Rank: ${index + 1}`}
                      </span>
                      <ChevronRight className="h-4 w-4 text-amber-400 ml-2 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
      </motion.div>

      {sources.length > maxVisible && (
        <div className="mt-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          >
            {showAll ? "Show Less" : `View All (${sources.length})`}
          </Button>
        </div>
      )}
    </div>
  )
}

