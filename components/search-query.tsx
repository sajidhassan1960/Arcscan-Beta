"use client"

import { motion } from "framer-motion"
import { Search } from "lucide-react"

interface SearchQueryProps {
  query: string
  index: number
}

export function SearchQuery({ query, index }: SearchQueryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 0.7, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-center mb-2 text-sm text-gray-500"
    >
      <Search className="h-4 w-4 text-gray-400 mr-2" />
      <span>{query}</span>
    </motion.div>
  )
}

