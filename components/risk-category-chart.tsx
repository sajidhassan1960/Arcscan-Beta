"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RiskCategory {
  name: string
  businessScore: number
  industryAverage: number
}

interface RiskCategoryChartProps {
  categories: RiskCategory[]
}

export function RiskCategoryChart({ categories }: RiskCategoryChartProps) {
  // Ensure a value is a number
  const ensureNumber = (value: any, defaultValue = 0): number => {
    if (typeof value === "number" && !isNaN(value)) {
      return value
    }
    return defaultValue
  }

  // Function to determine color based on risk score
  const getBusinessScoreColor = (score: number) => {
    score = ensureNumber(score, 0)
    if (score < 5) return "#10b981" // green
    if (score < 7) return "#f59e0b" // amber
    if (score < 9) return "#f97316" // orange
    return "#ef4444" // red
  }

  // Get category description
  const getCategoryDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      Geopolitical: "Risks from political instability, conflicts, and trade restrictions",
      Logistics: "Challenges with shipping, transportation, and delivery networks",
      Cost: "Financial risks from inflation, currency fluctuations, and price volatility",
      Visibility: "Issues with tracking, monitoring, and data transparency",
      Workforce: "Challenges with labor shortages and talent acquisition",
      Cybersecurity: "Vulnerabilities to data breaches and digital attacks",
      Sustainability: "Environmental compliance and carbon footprint concerns",
      Supplier: "Risks from supplier concentration and lack of diversification",
      Demand: "Challenges with forecasting and inventory management",
      Regulatory: "Compliance with changing laws, tariffs, and standards",
      Manufacturing: "Production-related risks and facility disruptions",
      Inventory: "Stock management, warehousing, and storage challenges",
      Technology: "Digital transformation and tech adoption risks",
      Quality: "Product quality control and standards compliance",
      Financial: "Cash flow, capital, and financial stability risks",
    }

    return descriptions[name] || "Supply chain risk category"
  }

  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : []

  // Sort categories by business score (highest risk first)
  const sortedCategories = [...safeCategories].sort(
    (a, b) => ensureNumber(b.businessScore, 0) - ensureNumber(a.businessScore, 0),
  )

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Risk Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCategories.map((category, index) => {
            // Ensure businessScore and industryAverage are numbers
            const businessScore = ensureNumber(category.businessScore, 0)
            const industryAverage = ensureNumber(category.industryAverage, 0)

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center text-sm font-medium text-gray-700">
                        {category.name || "Unknown"}
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">{getCategoryDescription(category.name)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="text-sm font-medium" style={{ color: getBusinessScoreColor(businessScore) }}>
                    {businessScore.toFixed(1)}
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full`}
                    style={{
                      width: `${(businessScore / 10) * 100}%`,
                      backgroundColor: getBusinessScoreColor(businessScore),
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <div>Your Score</div>
                  <div>Industry Avg: {industryAverage.toFixed(1)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

