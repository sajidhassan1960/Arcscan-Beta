"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ExternalLink, Calendar, List, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface TopRisk {
  factor: string
  score: number
  source?: string
  sourceUrl?: string
  publishedDate?: string
  category?: string
}

interface TopRisksTableProps {
  risks: TopRisk[]
  onViewSources?: () => void
}

export function TopRisksTable({ risks, onViewSources }: TopRisksTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Ensure a value is a number
  const ensureNumber = (value: any, defaultValue = 0): number => {
    if (typeof value === "number" && !isNaN(value)) {
      return value
    }
    return defaultValue
  }

  // Function to determine color based on risk score
  const getRiskColor = (score: number) => {
    score = ensureNumber(score, 0)
    if (score < 5) return "bg-green-100 text-green-800"
    if (score < 7) return "bg-amber-100 text-amber-800"
    if (score < 9) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  // Check if an item has multiple sources
  const hasMultipleSources = (item: any) => {
    return item && item.source && (item.source.includes(",") || item.source.toLowerCase().includes("multiple sources"))
  }

  // Render source link or "View Sources" button
  const renderSourceLink = (risk: TopRisk) => {
    if (hasMultipleSources(risk)) {
      return (
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto text-xs text-blue-500 hover:underline flex items-center"
          onClick={onViewSources}
        >
          <List className="h-3 w-3 mr-1" />
          View Sources
        </Button>
      )
    } else if (risk.sourceUrl) {
      return (
        <a
          href={risk.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-500 hover:underline"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View Source
        </a>
      )
    }

    return null
  }

  // Get unique categories from risks
  const categories = Array.from(new Set(risks.map((risk) => risk.category).filter(Boolean)))

  // Filter risks by category if a filter is selected
  const filteredRisks = categoryFilter ? risks.filter((risk) => risk.category === categoryFilter) : risks

  // Ensure risks is an array
  const safeRisks = Array.isArray(filteredRisks) ? filteredRisks : []

  // Get category badge color
  const getCategoryColor = (category?: string) => {
    if (!category) return "bg-gray-100 text-gray-800"

    const categoryMap: Record<string, string> = {
      "Supply Chain Disruptions & Geopolitical Issues": "bg-red-100 text-red-800",
      "Shipping & Logistics Bottlenecks": "bg-blue-100 text-blue-800",
      "Inflation & Rising Costs": "bg-amber-100 text-amber-800",
      "Lack of Supply Chain Visibility": "bg-purple-100 text-purple-800",
      "Labor Shortages & Workforce Challenges": "bg-orange-100 text-orange-800",
      "Cybersecurity Risks & Data Breaches": "bg-indigo-100 text-indigo-800",
      "Sustainability & ESG Compliance": "bg-green-100 text-green-800",
      "Over-reliance on Single Suppliers & Lack of Resilience": "bg-pink-100 text-pink-800",
      "Demand Forecasting Challenges": "bg-cyan-100 text-cyan-800",
      "Regulatory & Compliance Challenges": "bg-slate-100 text-slate-800",
    }

    return categoryMap[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Top Risk Factors
        </CardTitle>

        {categories.length > 0 && (
          <div className="mt-2">
            <div className="text-sm font-medium mb-2">Filter by category:</div>
            <div className="flex flex-wrap gap-2">
              {categoryFilter && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setCategoryFilter(null)}
                >
                  All Categories
                </Badge>
              )}

              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className={`cursor-pointer ${categoryFilter === category ? "bg-amber-100 border-amber-300" : "hover:bg-gray-100"}`}
                  onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {safeRisks.map((risk, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium flex items-center">
                    <Badge variant="outline" className="mr-2 text-xs font-normal">
                      {index + 1}
                    </Badge>
                    {risk.factor || "Unknown Risk"}
                  </div>
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${getRiskColor(ensureNumber(risk.score))}`}>
                  {ensureNumber(risk.score).toFixed(1)}
                </div>
              </div>

              {risk.category && (
                <div className="mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full inline-flex items-center ${getCategoryColor(risk.category)}`}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {risk.category}
                  </span>
                </div>
              )}

              {(risk.source || risk.publishedDate) && (
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <div className="flex items-center">
                    {risk.source && <span>Source: {risk.source}</span>}
                    {risk.publishedDate && (
                      <span className="flex items-center ml-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(risk.publishedDate)}
                      </span>
                    )}
                  </div>

                  {renderSourceLink(risk)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

