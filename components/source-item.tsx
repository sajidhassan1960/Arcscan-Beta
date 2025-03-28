"use client"

import { motion } from "framer-motion"
import { Clock, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SourceItemProps {
  source: {
    name: string
    icon: string
    url?: string
    publishedDate?: string
    publishedTime?: string
  }
  index: number
}

export function SourceItem({ source, index }: SourceItemProps) {
  // Check if the source is potentially outdated
  const isOutdated = () => {
    if (!source.publishedDate) return false

    try {
      // Try to parse the date
      const date = new Date(source.publishedDate)
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

      return date < twoYearsAgo
    } catch (e) {
      // If we can't parse the date, check if it contains a year
      if (typeof source.publishedDate === "string") {
        const yearMatch = source.publishedDate.match(/\b(20\d{2})\b/)
        if (yearMatch) {
          const year = Number.parseInt(yearMatch[1])
          const currentYear = new Date().getFullYear()
          return currentYear - year > 2
        }
      }
      return false
    }
  }

  const outdated = isOutdated()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: outdated ? 0.5 : 0.7, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex items-center text-xs p-1 border rounded text-gray-500 relative group ${
        outdated ? "border-amber-200 bg-amber-50" : ""
      }`}
    >
      <span className="mr-1">{source.icon}</span>
      <span className="truncate">{source.name}</span>

      {(source.publishedDate || source.publishedTime) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {outdated ? (
                <AlertCircle className="h-3 w-3 ml-1 text-amber-500" />
              ) : (
                <Clock className="h-3 w-3 ml-1 text-gray-400" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {outdated && <span className="text-amber-500 font-bold">Potentially outdated: </span>}
                {source.publishedDate ? source.publishedDate : ""}
                {source.publishedDate && source.publishedTime ? " · " : ""}
                {source.publishedTime ? source.publishedTime : ""}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 opacity-0"
          aria-label={`Visit ${source.name}`}
        />
      )}
    </motion.div>
  )
}

