import {
  processBusinessData as processWithGemini,
  analyzeResearchData as analyzeWithGemini,
  setGeminiApiKey,
} from "./gemini"
import { searchWeb, setSerperApiKey } from "./serper"

// Types
export interface BusinessData {
  companyName: string
  industry: string
  region: string
  suppliers: string
  annualRevenue?: string
  supplyChainDescription?: string
  apiProvider: "gemini" // Only allow "gemini"
  apiKey: string
  serperApiKey: string
}

export interface ResearchSession {
  id: number
  status: string
  requirements?: string
  researchProgress: number
  researchQueries?: string[]
  analysisProgress: number
  sources?: string[]
  compilationProgress: number
  results?: any
  errorMessage?: string
}

// Session storage
let nextSessionId = 1
const activeSessions = new Map<number, ResearchSession>()

// Create a new research session
export function createResearchSession(): number {
  const sessionId = nextSessionId++

  activeSessions.set(sessionId, {
    id: sessionId,
    status: "created",
    researchProgress: 0,
    analysisProgress: 0,
    compilationProgress: 0,
  })

  return sessionId
}

// Start research with the provided business data
export async function startResearch(sessionId: number, businessData: BusinessData): Promise<void> {
  const session = activeSessions.get(sessionId)
  if (!session) {
    throw new Error(`Research session ${sessionId} not found`)
  }

  // Update session status
  session.status = "processing"
  activeSessions.set(sessionId, session)

  // Process in background
  processResearchSession(sessionId, businessData).catch((error: any) => {
    console.error(`Error processing research for session ${sessionId}:`, error)
    const session = activeSessions.get(sessionId)
    if (session) {
      session.status = "error"
      session.errorMessage = error.message || "An unknown error occurred during research"
      activeSessions.set(sessionId, session)
    }
  })
}

// Get the current status of a research session
export function getResearchStatus(sessionId: number): ResearchSession | undefined {
  return activeSessions.get(sessionId)
}

// Process the research session
async function processResearchSession(sessionId: number, businessData: BusinessData): Promise<void> {
  const session = activeSessions.get(sessionId)
  if (!session) return

  try {
    // Set API keys
    setGeminiApiKey(businessData.apiKey)
    setSerperApiKey(businessData.serperApiKey)

    // Step 1: Determine research requirements
    const requirements = await processWithGemini(businessData)
    session.requirements = requirements.requirements
    session.researchQueries = requirements.searchQueries
    session.researchProgress = 20
    activeSessions.set(sessionId, session)

    // Step 2: Conduct research
    const searchResultsPromises = requirements.searchQueries.map(async (query, i) => {
      try {
        const results = await searchWeb(query)

        // Update progress after each query
        const progressIncrement = Math.floor(80 / requirements.searchQueries.length)
        session.researchProgress = Math.min(20 + (i + 1) * progressIncrement, 100)
        activeSessions.set(sessionId, session)

        return results
      } catch (error) {
        console.error(`Error searching for query "${query}":`, error)
        return []
      }
    })

    // Run searches
    const searchResultsArrays = await Promise.all(searchResultsPromises)
    let searchResults = searchResultsArrays.flat()

    // Check if we have any search results
    if (searchResults.length === 0) {
      throw new Error(
        "No search results found. We couldn't find any relevant data for your business. Please try with more specific industry details or check your Serper API key.",
      )
    }

    // Filter and prioritize recent sources
    searchResults = searchResults
      // Sort by recency (most recent first)
      .sort((a, b) => {
        // If both have dates, compare them
        if (a.publishedDate && b.publishedDate) {
          try {
            return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
          } catch (e) {
            // If date parsing fails, fall back to string comparison
            return b.publishedDate.localeCompare(a.publishedDate)
          }
        }
        // If only one has a date, prioritize the one with a date
        if (a.publishedDate) return -1
        if (b.publishedDate) return 1
        return 0
      })
      // Prioritize results with clear publication dates
      .sort((a, b) => {
        const aHasDate = !!a.publishedDate
        const bHasDate = !!b.publishedDate
        if (aHasDate && !bHasDate) return -1
        if (!aHasDate && bHasDate) return 1
        return 0
      })

    // Step 3: Begin analysis phase
    session.researchProgress = 100
    session.sources = Array.from(new Set(searchResults.map((r) => r.source || ""))).filter(Boolean)
    session.analysisProgress = 30
    activeSessions.set(sessionId, session)

    // Step 4: Analyze data
    session.analysisProgress = 100
    session.compilationProgress = 40
    activeSessions.set(sessionId, session)

    // Step 5: Generate insights from research data
    const insights = await analyzeWithGemini(searchResults, businessData)
    session.compilationProgress = 90
    activeSessions.set(sessionId, session)

    // Step 6: Finalize report
    session.status = "completed"
    session.compilationProgress = 100
    session.results = insights
    activeSessions.set(sessionId, session)
  } catch (error: any) {
    console.error(`Error in research process for session ${sessionId}:`, error)
    session.status = "error"
    session.errorMessage = error.message || "An unknown error occurred during research"
    activeSessions.set(sessionId, session)
    throw error
  }
}

// Get the final research report
export function getResearchReport(sessionId: number): any {
  const session = activeSessions.get(sessionId)
  if (!session) {
    throw new Error(`Research session ${sessionId} not found`)
  }

  if (session.status !== "completed") {
    throw new Error(`Research report not yet ready for session ${sessionId}`)
  }

  return session.results
}

// Set API key
export function setApiKey(key: string): void {
  setGeminiApiKey(key)
}

// Handle errors
export function handleApiError(error: any): string {
  if (error.message?.includes("API key")) {
    return "Invalid or unauthorized API key. Please check your API key and try again."
  } else if (error.message?.includes("quota") || error.status === 429) {
    return "API quota exceeded. Please try again later or use a different API key."
  } else if (error.status >= 500) {
    return "Server error. Please try again later."
  } else {
    return `Error: ${error.message || "Unknown error"}`
  }
}

