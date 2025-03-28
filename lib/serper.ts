// Default API key - will be set by user input, not environment variables
let serperApiKey = ""

// Function to set API key during runtime from user input
export function setSerperApiKey(apiKey: string): void {
  serperApiKey = apiKey
}

const SERPER_API_URL = "https://google.serper.dev/search"

export interface SearchResult {
  title: string
  link: string
  snippet: string
  position: number
  source?: string
  publishedDate?: string
  publishedTime?: string
}

// Update searchWeb to not check for environment variables
export async function searchWeb(query: string, numResults = 10): Promise<SearchResult[]> {
  try {
    // Only check if the API key has been set by the user
    if (!serperApiKey || serperApiKey.trim() === "") {
      // If no API key is provided, return an empty array - we don't want to show mock data
      throw new Error("Serper API key is required to perform web searches. Please provide a valid API key.")
    }

    const response = await fetch(SERPER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": serperApiKey,
      },
      body: JSON.stringify({
        q: query,
        num: numResults,
        // Enhanced search parameters for better results
        timeRange: "m", // Last month for recency
        gl: "us", // Default to US but could be customized based on region
        hl: "en", // English language
        autocorrect: true, // Enable autocorrect for better results
        // Add news search to get more recent information
        type: "search",
        tbs: "qdr:m", // Material from past month
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Serper API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()

    // Extract and normalize the search results
    const organicResults = data.organic || []

    // If no results were found, return an empty array with clear message
    if (organicResults.length === 0) {
      console.warn(`No search results found for query: ${query}`)
      return []
    }

    // Process and filter results
    const processedResults = organicResults.map((result: any, index: number) => {
      // Extract date information if available
      const publishedInfo = extractDateFromSnippet(result.snippet)

      return {
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        position: index + 1,
        source: extractDomain(result.link),
        publishedDate: result.date || publishedInfo.date || "",
        publishedTime: publishedInfo.timeAgo || "",
      }
    })

    // Filter out results that appear to be too old (older than 2 years)
    // This helps eliminate sources that were just recently edited but contain old content
    const filteredResults = processedResults.filter((result) => {
      // If we have a clear date, check if it's recent enough
      if (result.publishedDate) {
        try {
          const date = new Date(result.publishedDate)
          const twoYearsAgo = new Date()
          twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

          // Filter out results older than 2 years
          return date >= twoYearsAgo
        } catch (e) {
          // If date parsing fails, check for year mentions in the snippet
          const yearMatch = result.snippet.match(/\b(20\d{2})\b/g)
          if (yearMatch) {
            // Get the most recent year mentioned
            const years = yearMatch.map((y) => Number.parseInt(y))
            const mostRecentYear = Math.max(...years)
            const currentYear = new Date().getFullYear()

            // Keep only if the most recent year mentioned is within 2 years
            return currentYear - mostRecentYear <= 2
          }
        }
      }

      // If we can't determine the age, keep it by default
      return true
    })

    return filteredResults
  } catch (error: any) {
    console.error("Error searching with Serper:", error)
    // Don't use mock data, just propagate the error
    throw error
  }
}

// Helper function to extract date information from snippets
function extractDateFromSnippet(snippet: string): { date: string; timeAgo: string } {
  const result = { date: "", timeAgo: "" }

  // Look for common date patterns (more comprehensive)
  const dateRegex =
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})|(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})/i
  const dateMatch = snippet.match(dateRegex)
  if (dateMatch) {
    result.date = dateMatch[0]
  }

  // Look for "X days/hours ago" patterns
  const timeAgoRegex = /(\d+\s+(?:minute|hour|day|week|month)s?\s+ago)/i
  const timeAgoMatch = snippet.match(timeAgoRegex)
  if (timeAgoMatch) {
    result.timeAgo = timeAgoMatch[1]
  }

  // Look for year mentions to detect potentially old content
  const yearRegex = /\b(20\d{2})\b/g
  const yearMatches = snippet.match(yearRegex)
  if (yearMatches && !result.date) {
    // If we found years but no formatted date, use the most recent year
    const years = yearMatches.map((y) => Number.parseInt(y))
    const mostRecentYear = Math.max(...years)
    const currentYear = new Date().getFullYear()

    // Only set the date if it's within the last 2 years
    if (currentYear - mostRecentYear <= 2) {
      result.date = `${mostRecentYear}`
    }
  }

  return result
}

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.startsWith("www.") ? hostname.substring(4) : hostname
  } catch (e) {
    return url
  }
}

// Helper function to fetch article content
export async function fetchArticleContent(url: string): Promise<string> {
  try {
    // In a real implementation, this would use a proper web scraping approach
    throw new Error("Article content fetching is not implemented in this version.")
  } catch (error) {
    console.error(`Error fetching article content from ${url}:`, error)
    throw error
  }
}

