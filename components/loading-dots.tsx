"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface LoadingDotsProps {
  color?: string
  size?: number
  className?: string
}

export function LoadingDots({ color = "#1E293B", size = 8, className = "" }: LoadingDotsProps) {
  const [dots, setDots] = useState<number[]>([0, 1, 2])

  // Optional: Rotate the active dot for more dynamic animations
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => [(prev[0] + 1) % 3, (prev[1] + 1) % 3, (prev[2] + 1) % 3])
    }, 600)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          initial={{ opacity: 0.4, scale: 0.8 }}
          animate={{
            opacity: dots.includes(dot) ? 1 : 0.4,
            scale: dots.includes(dot) ? 1 : 0.8,
          }}
          transition={{ duration: 0.5 }}
          className="rounded-full"
          style={{
            backgroundColor: color,
            width: size,
            height: size,
          }}
        />
      ))}
    </div>
  )
}

