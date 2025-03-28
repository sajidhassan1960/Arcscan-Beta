import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Default research sources for UI display when real sources aren't available
export const DEFAULT_RESEARCH_SOURCES = [
  "McKinsey & Company",
  "Gartner Supply Chain",
  "Deloitte Insights",
  "World Economic Forum",
  "Harvard Business Review",
  "MIT Supply Chain",
  "Bloomberg Markets",
  "Supply Chain Dive",
  "Logistics Management",
  "Journal of Supply Chain",
  "Forbes Business",
  "The Economist",
  "Financial Times",
  "Wall Street Journal",
  "Reuters Business",
  "Supply Chain Digital",
]

// Helper function for API requests
export async function apiRequest(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Format currency values
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format percentage values
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

// Get risk level color
export function getRiskLevelColor(score: number): string {
  if (score < 40) return "green"
  if (score < 60) return "yellow"
  if (score < 80) return "orange"
  return "red"
}

// Get risk level text
export function getRiskLevelText(score: number): string {
  if (score < 40) return "Low"
  if (score < 60) return "Moderate"
  if (score < 80) return "High"
  return "Critical"
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

