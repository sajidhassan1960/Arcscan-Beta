"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, ExternalLink, Calendar, List, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface Insight {
  title: string
  description: string
  source: string
  sourceUrl?: string
  publishedDate?: string
  category?: string
}

interface KeyInsightsPanelProps {
  insights: Insight[]
  onViewSources?: () => void
}

export function KeyInsightsPanel({ insights, onViewSources }: KeyInsightsPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Show a message if no insights are available
  if (!insights || insights.length === 0) {
    return (
      <Card className="shadow-sm hover:shadow transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No key insights available for this business context.</p>
          </div>
        </CardContent>
      </Card>
    )
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
  const renderSourceLink = (insight: Insight) => {
    if (hasMultipleSources(insight)) {
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
    } else if (insight.sourceUrl) {
      return (
        <a
          href={insight.sourceUrl}
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

  // Get unique categories from insights
  const categories = Array.from(new Set(insights.map((insight) => insight.category).filter(Boolean)))

  // Filter insights by category if a filter is selected
  const filteredInsights = categoryFilter ? insights.filter((insight) => insight.category === categoryFilter) : insights

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
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Key Insights & Recommendations
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
          {filteredInsights.map((insight, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="text-sm font-medium flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 text-xs font-normal">
                  {index + 1}
                </Badge>
                <div>
                  <div className="font-medium text-gray-800">{insight.title}</div>

                  {insight.category && (
                    <div className="my-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-flex items-center ${getCategoryColor(insight.category)}`}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {insight.category}
                      </span>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 mt-1">{insight.description}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <div className="flex items-center">
                  Source: {insight.source}
                  {insight.publishedDate && (
                    <span className="flex items-center ml-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(insight.publishedDate)}
                    </span>
                  )}
                </div>

                {renderSourceLink(insight)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

