"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Info,
  ExternalLink,
  Clock,
  TrendingUp,
  Globe,
  Truck,
  DollarSign,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  RefreshCw,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopRisksTable } from "@/components/top-risks-table"
import { KeyInsightsPanel } from "@/components/key-insights-panel"
import { RiskCategoryChart } from "@/components/risk-category-chart"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface DashboardLayoutProps {
  companyName: string
  industry: string
  region: string
  analysisResults: any
  sources: any[]
  onReset: () => void
}

export function DashboardLayout({
  companyName,
  industry,
  region,
  analysisResults,
  sources,
  onReset,
}: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("summary")
  const [showSources, setShowSources] = useState(false)

  // Get the most critical risk
  const mostCriticalRisk = analysisResults.topRisks.reduce(
    (prev: any, current: any) => (current.score > prev.score ? current : prev),
    analysisResults.topRisks[0],
  )

  // Get the most recent insight
  const mostRecentInsight = analysisResults.keyInsights.reduce((prev: any, current: any) => {
    if (!prev.publishedDate) return current
    if (!current.publishedDate) return prev
    return new Date(current.publishedDate) > new Date(prev.publishedDate) ? current : prev
  }, analysisResults.keyInsights[0])

  // Get risk level color
  const getRiskLevelColor = (score: number) => {
    if (score < 40) return "bg-emerald-500"
    if (score < 60) return "bg-amber-500"
    if (score < 80) return "bg-orange-500"
    return "bg-red-500"
  }

  // Get risk level text color
  const getRiskLevelTextColor = (score: number) => {
    if (score < 40) return "text-emerald-500"
    if (score < 60) return "text-amber-500"
    if (score < 80) return "text-orange-500"
    return "text-red-500"
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"

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

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                {companyName}
                <Badge variant="outline" className="ml-2 text-xs font-normal">
                  {industry}
                </Badge>
              </h1>
              <p className="text-sm text-gray-500 flex items-center">
                <Globe className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Supply Chain Risk Assessment for {region}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSources(!showSources)} className="text-xs">
                {showSources ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 mr-1" />
                    Hide Sources
                  </>
                ) : (
                  <>
                    <Info className="h-3.5 w-3.5 mr-1" />
                    View Sources
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Risk Score Banner */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-sm font-medium mr-2">Overall Risk:</div>
              <div
                className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                  analysisResults.overallRiskScore < 40
                    ? "bg-emerald-100 text-emerald-800"
                    : analysisResults.overallRiskScore < 60
                      ? "bg-amber-100 text-amber-800"
                      : analysisResults.overallRiskScore < 80
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                }`}
              >
                {analysisResults.overallRiskScore}/100 - {analysisResults.riskLevel}
              </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Sources Panel (Collapsible) */}
      {showSources && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border-b shadow-inner"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <Search className="h-4 w-4 mr-1 text-gray-500" />
                Data Sources ({sources.length})
              </h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowSources(false)}>
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Hide
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center text-xs p-2 border rounded bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors group"
                >
                  <span className="mr-1">{source.icon}</span>
                  <span className="truncate flex-1">{source.name}</span>
                  {source.publishedDate && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Clock className="h-3 w-3 ml-1 text-gray-400 flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Published: {formatDate(source.publishedDate)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="h-3 w-3 text-blue-500" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="summary" className="text-sm">
                <Zap className="h-4 w-4 mr-1.5" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="risks" className="text-sm">
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                Top Risks
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-sm">
                <Lightbulb className="h-4 w-4 mr-1.5" />
                Key Insights
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-sm">
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Risk Categories
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {/* Risk Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="col-span-1 md:col-span-2 shadow-sm border-t-4 border-t-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Risk Score</h3>
                      <p className="text-sm text-gray-500">Overall supply chain vulnerability</p>
                    </div>
                    <div className={`text-4xl font-bold ${getRiskLevelTextColor(analysisResults.overallRiskScore)}`}>
                      {analysisResults.overallRiskScore}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">{analysisResults.riskLevel} Risk Level</span>
                      <span className="text-gray-500">out of 100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getRiskLevelColor(analysisResults.overallRiskScore)}`}
                        style={{ width: `${analysisResults.overallRiskScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Critical Risk Factor:</span> {mostCriticalRisk.factor}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center text-gray-700">
                    <Truck className="h-4 w-4 mr-1.5 text-amber-500" />
                    Supply Chain Disruptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{analysisResults.supplyChainDisruptions.count}</div>
                    <div className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />+
                      {analysisResults.supplyChainDisruptions.changeFromLastYear}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 line-clamp-2">
                    {analysisResults.supplyChainDisruptions.insight}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center text-gray-700">
                    <DollarSign className="h-4 w-4 mr-1.5 text-red-500" />
                    Cost Increase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{analysisResults.costIncrease.percentage}%</div>
                    <div className="text-sm text-gray-500">{analysisResults.costIncrease.period}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 line-clamp-2">{analysisResults.costIncrease.insight}</div>
                </CardContent>
              </Card>
            </div>

            {/* Top Risks and Insights Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center text-gray-800">
                    <AlertTriangle className="h-4 w-4 mr-1.5 text-red-500" />
                    Top Risk Factors
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveTab("risks")}>
                    View All
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {analysisResults.topRisks.slice(0, 3).map((risk: any, index: number) => (
                      <div key={index} className="p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-medium text-gray-800">{risk.factor}</div>
                          <div
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              risk.score < 5
                                ? "bg-emerald-100 text-emerald-800"
                                : risk.score < 7
                                  ? "bg-amber-100 text-amber-800"
                                  : risk.score < 9
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {risk.score.toFixed(1)}
                          </div>
                        </div>

                        {(risk.source || risk.publishedDate) && (
                          <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                            <div className="flex items-center">
                              {risk.source && <span>Source: {risk.source}</span>}
                              {risk.publishedDate && (
                                <span className="flex items-center ml-2">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(risk.publishedDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center text-gray-800">
                    <Lightbulb className="h-4 w-4 mr-1.5 text-amber-500" />
                    Key Insights
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveTab("insights")}>
                    View All
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {analysisResults.keyInsights.slice(0, 2).map((insight: any, index: number) => (
                      <div key={index} className="p-3 hover:bg-gray-50">
                        <div className="text-sm font-medium text-gray-800 mb-1">{insight.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-2 mb-1">{insight.description}</div>

                        {(insight.source || insight.publishedDate) && (
                          <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                            <div className="flex items-center">
                              {insight.source && <span>Source: {insight.source}</span>}
                              {insight.publishedDate && (
                                <span className="flex items-center ml-2">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(insight.publishedDate)}
                                </span>
                              )}
                            </div>

                            {insight.sourceUrl && (
                              <a
                                href={insight.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-500 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Source
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Categories Preview */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center text-gray-800">
                  <BarChart3 className="h-4 w-4 mr-1.5 text-blue-500" />
                  Risk Categories
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveTab("categories")}>
                  View All
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResults.riskCategories.slice(0, 4).map((category: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-700">{category.name}</div>
                        <div className="text-sm font-medium">{category.businessScore.toFixed(1)}</div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            category.businessScore < 5
                              ? "bg-emerald-500"
                              : category.businessScore < 7
                                ? "bg-amber-500"
                                : category.businessScore < 9
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${(category.businessScore / 10) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <div>Your Score</div>
                        <div className="flex items-center">
                          Industry Avg: {category.industryAverage.toFixed(1)}
                          {category.businessScore > category.industryAverage ? (
                            <ArrowUpRight className="h-3 w-3 ml-1 text-red-500" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 ml-1 text-emerald-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button onClick={onReset} variant="outline" size="sm" className="text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Start New Analysis
              </Button>
            </div>
          </TabsContent>

          {/* Top Risks Tab */}
          <TabsContent value="risks">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center text-gray-800">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Top Risk Factors
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of the most significant supply chain risks affecting your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopRisksTable risks={analysisResults.topRisks} />
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button onClick={onReset} variant="outline" size="sm" className="text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Start New Analysis
              </Button>
            </div>
          </TabsContent>

          {/* Key Insights Tab */}
          <TabsContent value="insights">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center text-gray-800">
                  <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                  Key Insights & Recommendations
                </CardTitle>
                <CardDescription>
                  Strategic insights and actionable recommendations based on current market data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyInsightsPanel insights={analysisResults.keyInsights} />
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button onClick={onReset} variant="outline" size="sm" className="text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Start New Analysis
              </Button>
            </div>
          </TabsContent>

          {/* Risk Categories Tab */}
          <TabsContent value="categories">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center text-gray-800">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                  Risk Categories Analysis
                </CardTitle>
                <CardDescription>Detailed breakdown of risk categories compared to industry averages</CardDescription>
              </CardHeader>
              <CardContent>
                <RiskCategoryChart categories={analysisResults.riskCategories} />
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button onClick={onReset} variant="outline" size="sm" className="text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Start New Analysis
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Analysis completed on {new Date().toLocaleDateString()}
          </div>
          <Button onClick={onReset} variant="outline" size="sm" className="text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Start New Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}

