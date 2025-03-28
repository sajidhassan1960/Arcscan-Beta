"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BusinessForm } from "@/components/business-form"
import { ApiKeyForm } from "@/components/api-key-form"
import { ResearchStepAnimation } from "@/components/research-step-animation"
import { DashboardUnified } from "@/components/dashboard-unified"
import { createResearchSession, startResearch, getResearchStatus, type BusinessData } from "@/lib/api"

export default function Home() {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [isResearching, setIsResearching] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [sourceCount, setSourceCount] = useState(0)
  const [visibleFindings, setVisibleFindings] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [searchQueries, setSearchQueries] = useState<string[]>([])
  const [activeQuery, setActiveQuery] = useState(0)
  const [requirements, setRequirements] = useState("")
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sources, setSources] = useState<
    { name: string; icon: string; url?: string; publishedDate?: string; publishedTime?: string }[]
  >([])
  const [visibleSources, setVisibleSources] = useState(0)
  const [stepProgress, setStepProgress] = useState<Record<number, number>>({
    1: 0, // Requirements analysis progress
    2: 0, // Research progress
    3: 0, // Source analysis progress
    4: 0, // Compilation progress
  })
  const [insights, setInsights] = useState<Array<{ title: string; description: string }>>([])

  // Form flow states
  const [formStage, setFormStage] = useState<"business" | "aiApi" | "serperApi">("business")
  const [formData, setFormData] = useState<any>({
    companyName: "",
    industry: "",
    region: "",
    supplyChainConcern: "",
    apiProvider: "gemini",
    apiKey: "",
    serperApiKey: "",
  })

  // Function to map source domains to icons
  const getSourceIcon = (domain: string): string => {
    const iconMap: Record<string, string> = {
      "mckinsey.com": "🔴",
      "gartner.com": "🔵",
      "deloitte.com": "🟠",
      "weforum.org": "⚪",
      "hbr.org": "🔴",
      "mit.edu": "🔴",
      "bloomberg.com": "🟠",
      "supplychaindive.com": "⚫",
      "logisticsmgmt.com": "🟡",
      "forbes.com": "🟢",
      "economist.com": "🔵",
      "ft.com": "🔵",
      "wsj.com": "🔴",
      "reuters.com": "🟡",
      "ibm.com": "🔵",
      "accenture.com": "🟣",
      "pwc.com": "🟠",
      "ey.com": "🟡",
      "kpmg.com": "🔵",
    }

    for (const [key, value] of Object.entries(iconMap)) {
      if (domain.includes(key)) return value
    }
    return "🔹" // Default icon
  }

  // Handle business form submission
  const handleBusinessFormSubmit = (data: any) => {
    setFormData({
      ...formData,
      companyName: data.companyName || "",
      industry: data.industry || "",
      region: data.region || "",
      supplyChainConcern: data.supplyChainConcern || "",
    })
    setFormStage("aiApi")
  }

  // Handle AI API form submission
  const handleAiApiSubmit = (data: any) => {
    setFormData({
      ...formData,
      apiProvider: "gemini",
      apiKey: data.apiKey || "",
    })
    setFormStage("serperApi")
  }

  // Handle Serper API form submission and start research
  const handleSerperApiSubmit = (data: any) => {
    const completeData = {
      ...formData,
      serperApiKey: data.serperApiKey || "",
    }
    startResearchProcess(completeData)
  }

  // Start the research process with real API calls
  const startResearchProcess = async (data: any) => {
    try {
      setError(null)
      setBusinessData(data)
      setIsResearching(true)

      // Reset all states
      setCurrentStep(0)
      setSourceCount(0)
      setVisibleFindings(0)
      setCompletedSteps([])
      setAnalysisResults(null)
      setSources([])
      setVisibleSources(0)
      setActiveQuery(0)
      setStepProgress({ 1: 0, 2: 0, 3: 0, 4: 0 })
      setInsights([])

      // Create a new research session
      const newSessionId = createResearchSession()
      setSessionId(newSessionId)

      // Start the research process with user-provided API keys
      await startResearch(newSessionId, {
        ...data,
        suppliers: data.supplyChainConcern || "", // Ensure suppliers field is set
      })
    } catch (error: any) {
      console.error("Error starting research:", error)
      setError(error.message || "An error occurred while starting the research")
      setIsResearching(false) // Reset the researching state on error
    }
  }

  // Poll for research status updates
  useEffect(() => {
    if (!sessionId || !isResearching) return

    const pollInterval = setInterval(() => {
      try {
        const status = getResearchStatus(sessionId)

        if (!status) {
          clearInterval(pollInterval)
          setError("Research session not found")
          return
        }

        // Update UI based on research progress
        if (status.status === "error") {
          clearInterval(pollInterval)
          setError(status.errorMessage || "An error occurred during research")
          return
        }

        // Update requirements and queries when available
        if (status.requirements && status.requirements !== requirements) {
          setRequirements(status.requirements)
          setCurrentStep(1)
          setStepProgress((prev) => ({ ...prev, 1: 50 }))

          // Extract key insights from requirements for animation
          const reqLines = status.requirements
            .split(".")
            .filter((line: string) => line.trim().length > 10)
            .slice(0, 3)
            .map((line: string) => ({
              title: line.trim(),
              description: "Analyzing industry-specific factors and regional considerations",
            }))

          if (reqLines.length > 0) {
            setInsights(reqLines)
          }
        }

        if (status.researchQueries && status.researchQueries.length > 0) {
          setSearchQueries(status.researchQueries)
          setStepProgress((prev) => ({ ...prev, 1: 100 }))
        }

        // Update research progress
        if (status.researchProgress >= 20 && !completedSteps.includes(1)) {
          setCompletedSteps((prev) => [...prev, 1])
          setCurrentStep(2)
        }

        // Animate through search queries
        if (currentStep === 2 && searchQueries.length > 0) {
          const queryProgress = Math.floor((status.researchProgress - 20) / (80 / searchQueries.length))
          setActiveQuery(Math.min(queryProgress, searchQueries.length - 1))
          setStepProgress((prev) => ({ ...prev, 2: status.researchProgress }))
        }

        // Update source count for animation
        if (status.researchProgress > 20) {
          const sourceProgress = Math.floor((status.researchProgress - 20) / 10)
          setSourceCount(Math.min(sourceProgress, searchQueries.length))
        }

        // Update sources when available
        if (status.sources && status.sources.length > 0) {
          // Get source details from search results
          const sourcesWithDetails = status.sources.map((source: string) => {
            // Find matching search result to get URL and date
            const matchingResult = status.results?.searchResults?.find((result: any) => result.source === source)

            return {
              name: source,
              icon: getSourceIcon(source),
              url: matchingResult?.link || undefined,
              publishedDate: matchingResult?.publishedDate || undefined,
              publishedTime: matchingResult?.publishedTime || undefined,
            }
          })

          setSources(sourcesWithDetails)

          // Animate sources appearing
          const visibleCount = Math.floor((status.researchProgress / 100) * sourcesWithDetails.length)
          setVisibleSources(Math.min(visibleCount, sourcesWithDetails.length))
        }

        // Update analysis progress
        if (status.researchProgress >= 100 && status.analysisProgress > 0) {
          if (!completedSteps.includes(2)) {
            setCompletedSteps((prev) => [...prev, 2])
            setCurrentStep(3)
          }

          setStepProgress((prev) => ({ ...prev, 3: status.analysisProgress }))

          // When analysis is complete
          if (status.analysisProgress >= 100 && !completedSteps.includes(3)) {
            setCompletedSteps((prev) => [...prev, 3])
            setCurrentStep(4)
          }
        }

        // Update compilation progress
        if (status.compilationProgress > 0) {
          setStepProgress((prev) => ({ ...prev, 4: status.compilationProgress }))

          // Show findings gradually
          if (status.results?.keyInsights) {
            // Create insights for animation
            const insightData = status.results.keyInsights.map((insight: any) => ({
              title: insight.title,
              description: insight.description.substring(0, 100) + (insight.description.length > 100 ? "..." : ""),
            }))

            if (insightData.length > 0) {
              setInsights(insightData)
            }

            const insightCount = Math.floor(status.compilationProgress / 25)
            setVisibleFindings(Math.min(insightCount, status.results.keyInsights.length))
          }

          // When compilation is complete
          if (status.compilationProgress >= 100 && !completedSteps.includes(4)) {
            setCompletedSteps((prev) => [...prev, 4])
            setCurrentStep(5)

            // Set final results
            if (status.results) {
              setAnalysisResults(status.results)
            }
          }
        }

        // If research is complete, stop polling
        if (status.status === "completed") {
          // Check if we have valid results
          if (
            !status.results ||
            !status.results.topRisks ||
            status.results.topRisks.length === 0 ||
            !status.results.keyInsights ||
            status.results.keyInsights.length === 0
          ) {
            setError(
              "Analysis complete, but no significant risk factors were identified. This may indicate either low risk or insufficient public data for your specific business context.",
            )
          }
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error("Error polling research status:", error)
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [sessionId, isResearching, completedSteps, requirements, searchQueries, currentStep])

  // Reset the research
  const resetResearch = () => {
    setIsResearching(false)
    setBusinessData(null)
    setSessionId(null)
    setError(null)
    setFormStage("business")
    setFormData({})
  }

  // Render the appropriate form based on the current stage
  const renderForm = () => {
    switch (formStage) {
      case "business":
        return <BusinessForm onSubmit={handleBusinessFormSubmit} />
      case "aiApi":
        return (
          <ApiKeyForm
            title="AI Provider API Key"
            description="Please provide your Google Gemini API key to power the analysis"
            type="ai"
            onSubmit={handleAiApiSubmit}
            onBack={() => setFormStage("business")}
            initialData={formData}
          />
        )
      case "serperApi":
        return (
          <ApiKeyForm
            title="Search API Key"
            description="Please provide your Serper API key for web search capabilities"
            type="serper"
            onSubmit={handleSerperApiSubmit}
            onBack={() => setFormStage("aiApi")}
            initialData={formData}
          />
        )
      default:
        return <BusinessForm onSubmit={handleBusinessFormSubmit} />
    }
  }

  // Simplified rendering to avoid potential issues
  const renderResearchSteps = () => {
    if (currentStep === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="mb-6">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-center text-gray-600">Initializing research process...</p>
          </div>
        </div>
      )
    }

    return (
      <>
        <ResearchStepAnimation
          step={1}
          title="Analyzing your supply chain requirements"
          currentStep={currentStep}
          completedSteps={completedSteps}
          progress={stepProgress[1]}
          insights={insights.slice(0, 3)}
          visibleInsights={Math.min(3, insights.length)}
        />

        <ResearchStepAnimation
          step={2}
          title="Conducting relevant research"
          currentStep={currentStep}
          completedSteps={completedSteps}
          searchQueries={searchQueries}
          activeQuery={activeQuery}
          progress={stepProgress[2]}
        />

        <ResearchStepAnimation
          step={3}
          title={`Analyzing insights from ${sources.length || "multiple"} unique websites`}
          currentStep={currentStep}
          completedSteps={completedSteps}
          sources={sources}
          visibleSources={visibleSources}
          progress={stepProgress[3]}
        />

        <ResearchStepAnimation
          step={4}
          title="Compiling risk assessment and recommendations"
          currentStep={currentStep}
          completedSteps={completedSteps}
          insights={insights}
          visibleInsights={visibleFindings}
          progress={stepProgress[4]}
        />

        <ResearchStepAnimation
          step={5}
          title="Finalizing your risk assessment"
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        {!isResearching ? (
          <div className="p-6">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <Image src="/logo.png" alt="Arcscan Logo" width={60} height={60} className="mr-3" />
                <h1 className="text-3xl font-bold">
                  <span className="text-amber-600">Arc</span>
                  <span className="text-gray-900">scan</span>
                </h1>
              </div>
            </div>

            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Supply Chain Risk Analysis</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Analyze your supply chain vulnerabilities and get actionable insights to improve resilience
              </p>
            </div>

            <div className="max-w-2xl mx-auto">{renderForm()}</div>
          </div>
        ) : (
          <div className="w-full">
            {/* Error message if any */}
            {error && (
              <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Research Content */}
            {currentStep < 5 ? (
              <div className="p-6 border-l border-r border-b rounded-b-lg bg-white shadow-sm">
                {renderResearchSteps()}
              </div>
            ) : (
              // Results Dashboard - Unified View
              analysisResults && (
                <DashboardUnified
                  companyName={businessData?.companyName || ""}
                  industry={businessData?.industry || ""}
                  region={businessData?.region || ""}
                  analysisResults={analysisResults}
                  sources={sources || []}
                  onReset={resetResearch}
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  )
}

