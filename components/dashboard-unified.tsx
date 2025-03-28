"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingUp,
  Truck,
  DollarSign,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  List,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopRisksTable } from "@/components/top-risks-table"
import { KeyInsightsPanel } from "@/components/key-insights-panel"
import { RiskCategoryChart } from "@/components/risk-category-chart"
import { DataSourcesPanel } from "@/components/data-sources-panel"
import { Separator } from "@/components/ui/separator"

interface DashboardUnifiedProps {
  companyName: string
  industry: string
  region: string
  analysisResults: any
  sources: any[]
  onReset: () => void
}

export function DashboardUnified({
  companyName,
  industry,
  region,
  analysisResults = {},
  sources = [],
  onReset,
}: DashboardUnifiedProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    risks: false,
    insights: false,
    categories: false,
  })

  // Add a ref for the sources section
  const sourcesRef = useRef<HTMLDivElement>(null)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Function to scroll to sources section
  const scrollToSources = () => {
    if (sourcesRef.current) {
      sourcesRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      // Add a small delay to ensure the scroll completes
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        })
      }, 100)
    }
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

  // Ensure a value is a number
  const ensureNumber = (value: any, defaultValue = 0): number => {
    if (typeof value === "number" && !isNaN(value)) {
      return value
    }
    return defaultValue
  }

  // Get risk level color
  const getRiskLevelColor = (score = 0) => {
    if (score < 40) return "bg-emerald-500"
    if (score < 60) return "bg-amber-500"
    if (score < 80) return "bg-orange-500"
    return "bg-red-500"
  }

  // Get risk level text color
  const getRiskLevelTextColor = (score = 0) => {
    if (score < 40) return "text-emerald-500"
    if (score < 60) return "text-amber-500"
    if (score < 80) return "text-orange-500"
    return "text-red-500"
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  // Function to check if we have valid data
  const hasValidData = () => {
    return (
      analysisResults &&
      analysisResults.topRisks &&
      Array.isArray(analysisResults.topRisks) &&
      analysisResults.topRisks.length > 0 &&
      analysisResults.keyInsights &&
      Array.isArray(analysisResults.keyInsights) &&
      analysisResults.keyInsights.length > 0
    )
  }

  // Safely get properties with fallbacks
  const getOverallRiskScore = () => ensureNumber(analysisResults?.overallRiskScore, 0)
  const getRiskLevel = () => analysisResults?.riskLevel || "Unknown"
  const getTopRisks = () => (Array.isArray(analysisResults?.topRisks) ? analysisResults.topRisks : [])
  const getKeyInsights = () => (Array.isArray(analysisResults?.keyInsights) ? analysisResults.keyInsights : [])
  const getRiskCategories = () => (Array.isArray(analysisResults?.riskCategories) ? analysisResults.riskCategories : [])
  const getSupplyChainDisruptions = () =>
    analysisResults?.supplyChainDisruptions || { count: 0, changeFromLastYear: 0, insight: "No data available" }
  const getCostIncrease = () =>
    analysisResults?.costIncrease || { percentage: 0, period: "YOY", insight: "No data available" }

  // Check if an item has multiple sources
  const hasMultipleSources = (item: any) => {
    return item && item.source && (item.source.includes(",") || item.source.toLowerCase().includes("multiple sources"))
  }

  // Component to show when no data is found
  const NoDataMessage = () => (
    <div className="bg-gray-50 p-8 rounded-lg text-center my-8">
      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">No Analysis Data Found</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-4">
        We couldn't find enough relevant data for your specific business context. This could be due to limited
        information available or very specific industry parameters.
      </p>
      <Button onClick={onReset} className="bg-amber-600 hover:bg-amber-700">
        <RefreshCw className="h-4 w-4 mr-2" />
        Start New Analysis
      </Button>
    </div>
  )

  // Render source link or "View Sources" button
  const renderSourceLink = (item: any) => {
    if (!item) return null

    if (hasMultipleSources(item)) {
      return (
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto text-xs text-blue-500 hover:underline flex items-center"
          onClick={scrollToSources}
        >
          <List className="h-3 w-3 mr-1" />
          View Sources
        </Button>
      )
    } else if (item.sourceUrl) {
      return (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-500 hover:underline text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View Source
        </a>
      )
    }

    return null
  }

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="bg-white border-b sticky top-0 z-10 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Arcscan Logo" width={40} height={40} className="mr-2" />
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="text-amber-600">Arc</span>
                  <span className="text-gray-900">scan</span>
                  <span className="mx-2">|</span>
                  {companyName || "Company"}
                </h1>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-amber-500 mr-1.5 rounded-full"></div>
                  <span>{industry || "Industry"} Risk Assessment</span>
                  <span className="mx-2">•</span>
                  <span>{region || "Region"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Powered by Google Gemini</div>

              <Button onClick={onReset} size="sm" variant="outline" className="text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                New Analysis
              </Button>
            </div>
          </div>

          {/* Risk Score Banner */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-sm font-medium mr-2">Overall Risk:</div>
              <div
                className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                  getOverallRiskScore() < 40
                    ? "bg-emerald-100 text-emerald-800"
                    : getOverallRiskScore() < 60
                      ? "bg-amber-100 text-amber-800"
                      : getOverallRiskScore() < 80
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                }`}
              >
                {getOverallRiskScore()}/100 - {getRiskLevel()}
              </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        {!hasValidData() ? (
          <NoDataMessage />
        ) : (
          <>
            {/* Summary Cards */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            >
              <Card className="shadow-sm hover:shadow transition-shadow border-t-4 border-t-amber-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Risk Score</h3>
                      <p className="text-sm text-gray-500">Overall supply chain vulnerability</p>
                    </div>
                    <div className={`text-4xl font-bold ${getRiskLevelTextColor(getOverallRiskScore())}`}>
                      {getOverallRiskScore()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">{getRiskLevel()} Risk Level</span>
                      <span className="text-gray-500">out of 100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getRiskLevelColor(getOverallRiskScore())}`}
                        style={{ width: `${getOverallRiskScore()}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Supply Chain Disruptions</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{ensureNumber(getSupplyChainDisruptions().count)}</div>
                    <div className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />+
                      {ensureNumber(getSupplyChainDisruptions().changeFromLastYear)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 line-clamp-2">{getSupplyChainDisruptions().insight}</div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Cost Increase</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{ensureNumber(getCostIncrease().percentage)}%</div>
                    <div className="text-sm text-gray-500">{getCostIncrease().period}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 line-clamp-2">{getCostIncrease().insight}</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Risks Section */}
            <motion.div variants={slideUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card className="shadow-sm hover:shadow transition-shadow mb-6">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center text-gray-800">
                    <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                    Top Risk Factors
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleSection("risks")}>
                    {expandedSections.risks ? (
                      <>
                        View Less
                        <ChevronUp className="h-3.5 w-3.5 ml-1" />
                      </>
                    ) : (
                      <>
                        View All
                        <ChevronDown className="h-3.5 w-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <AnimatePresence>
                    {!expandedSections.risks ? (
                      <div className="divide-y">
                        {getTopRisks()
                          .slice(0, 3)
                          .map((risk: any, index: number) => (
                            <div key={index} className="p-3 hover:bg-gray-50">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm font-medium text-gray-800">{risk.factor || "Unknown Risk"}</div>
                                <div
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    ensureNumber(risk.score) < 5
                                      ? "bg-emerald-100 text-emerald-800"
                                      : ensureNumber(risk.score) < 7
                                        ? "bg-amber-100 text-amber-800"
                                        : ensureNumber(risk.score) < 9
                                          ? "bg-orange-100 text-orange-800"
                                          : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {ensureNumber(risk.score).toFixed(1)}
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

                                  {renderSourceLink(risk)}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3"
                      >
                        <TopRisksTable risks={getTopRisks()} onViewSources={scrollToSources} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Insights Section */}
            <motion.div variants={slideUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="shadow-sm hover:shadow transition-shadow mb-6">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center text-gray-800">
                    <Lightbulb className="h-4 w-4 mr-1.5 text-amber-500" />
                    Risk Insights
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleSection("insights")}>
                    {expandedSections.insights ? (
                      <>
                        View Less
                        <ChevronUp className="h-3.5 w-3.5 ml-1" />
                      </>
                    ) : (
                      <>
                        View All
                        <ChevronDown className="h-3.5 w-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <AnimatePresence>
                    {!expandedSections.insights ? (
                      <div className="divide-y">
                        {getKeyInsights()
                          .slice(0, 2)
                          .map((insight: any, index: number) => (
                            <div key={index} className="p-3 hover:bg-gray-50">
                              <div className="text-sm font-medium text-gray-800 mb-1">
                                {insight.title || "Unknown Insight"}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-2 mb-1">
                                {insight.description || "No description available"}
                              </div>

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

                                  {renderSourceLink(insight)}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3"
                      >
                        <KeyInsightsPanel insights={getKeyInsights()} onViewSources={scrollToSources} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Risk Categories Section with Bar Chart */}
            <motion.div variants={slideUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card className="shadow-sm hover:shadow transition-shadow mb-6">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center text-gray-800">
                    <BarChart3 className="h-4 w-4 mr-1.5 text-amber-500" />
                    Risk Categories
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleSection("categories")}>
                    {expandedSections.categories ? (
                      <>
                        View Less
                        <ChevronUp className="h-3.5 w-3.5 ml-1" />
                      </>
                    ) : (
                      <>
                        View All
                        <ChevronDown className="h-3.5 w-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="p-3">
                  <AnimatePresence>
                    {!expandedSections.categories ? (
                      <div className="space-y-4">
                        {getRiskCategories()
                          .slice(0, 4)
                          .map((category: any, index: number) => {
                            // Ensure businessScore and industryAverage are numbers
                            const businessScore = ensureNumber(category.businessScore, 0)
                            const industryAverage = ensureNumber(category.industryAverage, 0)

                            return (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <div className="text-sm font-medium text-gray-700">
                                    {category.name || "Unknown Category"}
                                  </div>
                                  <div
                                    className="text-sm font-medium"
                                    style={{
                                      color:
                                        businessScore < 5
                                          ? "#10b981"
                                          : businessScore < 7
                                            ? "#f59e0b"
                                            : businessScore < 9
                                              ? "#f97316"
                                              : "#ef4444",
                                    }}
                                  >
                                    {businessScore.toFixed(1)}
                                  </div>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full`}
                                    style={{
                                      width: `${(businessScore / 10) * 100}%`,
                                      backgroundColor:
                                        businessScore < 5
                                          ? "#10b981"
                                          : businessScore < 7
                                            ? "#f59e0b"
                                            : businessScore < 9
                                              ? "#f97316"
                                              : "#ef4444",
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <div>Your Score</div>
                                  <div className="flex items-center">
                                    Industry Avg: {industryAverage.toFixed(1)}
                                    {businessScore > industryAverage ? (
                                      <ArrowUpRight className="h-3 w-3 ml-1 text-red-500" />
                                    ) : (
                                      <ArrowDownRight className="h-3 w-3 ml-1 text-emerald-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RiskCategoryChart categories={getRiskCategories()} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Sources Section - Redesigned */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              ref={sourcesRef}
              id="research-sources"
            >
              <DataSourcesPanel
                sources={(sources || []).map((source) => ({
                  title: source?.name || "Unknown Source",
                  url: source?.url || "",
                  description: "Source used for market research and analysis",
                }))}
                hideLinks={true}
              />
            </motion.div>

            <Separator className="my-6" />

            {/* Footer with Branding */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="flex items-center mb-2">
                <Image src="/logo.png" alt="Arcscan Logo" width={24} height={24} className="mr-2" />
                <span className="text-lg font-bold">
                  <span className="text-amber-600">Arc</span>
                  <span className="text-gray-900">scan</span>
                </span>
              </div>
              <div className="text-xs text-gray-500">Supply Chain Risk Analysis powered by Google Gemini</div>
              <div className="text-xs text-gray-400 mt-1">Analysis completed on {new Date().toLocaleDateString()}</div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

