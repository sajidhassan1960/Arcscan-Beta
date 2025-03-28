import { GoogleGenerativeAI } from "@google/generative-ai"

// Store API key
let geminiApiKey = ""

// Function to set API key during runtime
export function setGeminiApiKey(apiKey: string): void {
  geminiApiKey = apiKey
}

// Function to get Gemini model with the current API key
function getGeminiModel() {
  if (!geminiApiKey) {
    throw new Error("Gemini API key is not set. Please provide a valid API key.")
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey)
  return genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
}

export interface ResearchRequirements {
  requirements: string
  searchQueries: string[]
}

export interface AnalysisInsights {
  overallRiskScore: number
  riskLevel: string
  topRisks: Array<{
    factor: string
    score: number
    source: string
    sourceUrl: string
    publishedDate?: string
  }>
  keyInsights: Array<{
    title: string
    description: string
    source: string
    sourceUrl: string
    publishedDate?: string
  }>
  riskCategories: Array<{ name: string; businessScore: number; industryAverage: number }>
  supplyChainDisruptions: {
    count: number
    changeFromLastYear: number
    insight: string
    source: string
    sourceUrl: string
  }
  costIncrease: {
    percentage: number
    period: string
    insight: string
    source: string
    sourceUrl: string
  }
  supplierRisk: {
    percentage: number
    level: string
    insight: string
    source: string
    sourceUrl: string
  }
}

// Key supply chain risk categories to identify in analysis
const KEY_SUPPLY_CHAIN_RISKS = [
  {
    category: "Supply Chain Disruptions & Geopolitical Issues",
    keywords: [
      "geopolitical",
      "conflict",
      "war",
      "trade war",
      "sanctions",
      "political instability",
      "trade restrictions",
      "border delays",
      "diplomatic tensions",
    ],
  },
  {
    category: "Shipping & Logistics Bottlenecks",
    keywords: [
      "port congestion",
      "shipping delays",
      "container shortage",
      "freight costs",
      "logistics bottleneck",
      "transportation delays",
      "last mile",
      "fuel prices",
      "vessel capacity",
    ],
  },
  {
    category: "Inflation & Rising Costs",
    keywords: [
      "inflation",
      "cost increase",
      "price surge",
      "raw material costs",
      "labor costs",
      "transportation costs",
      "currency fluctuation",
      "exchange rate",
      "price volatility",
    ],
  },
  {
    category: "Lack of Supply Chain Visibility",
    keywords: [
      "visibility",
      "transparency",
      "tracking",
      "monitoring",
      "real-time data",
      "predictive analytics",
      "blind spots",
      "information sharing",
      "data silos",
    ],
  },
  {
    category: "Labor Shortages & Workforce Challenges",
    keywords: [
      "labor shortage",
      "workforce",
      "talent gap",
      "skills shortage",
      "automation",
      "worker retention",
      "staffing",
      "employee turnover",
      "labor market",
    ],
  },
  {
    category: "Cybersecurity Risks & Data Breaches",
    keywords: [
      "cybersecurity",
      "data breach",
      "ransomware",
      "phishing",
      "cyber attack",
      "information security",
      "digital vulnerability",
      "hacking",
      "data protection",
    ],
  },
  {
    category: "Sustainability & ESG Compliance",
    keywords: [
      "sustainability",
      "ESG",
      "carbon footprint",
      "emissions",
      "environmental regulations",
      "green logistics",
      "sustainable sourcing",
      "climate impact",
      "ethical sourcing",
    ],
  },
  {
    category: "Over-reliance on Single Suppliers & Lack of Resilience",
    keywords: [
      "single supplier",
      "supplier concentration",
      "china dependence",
      "reshoring",
      "nearshoring",
      "supplier diversification",
      "backup suppliers",
      "resilience",
      "dependency",
    ],
  },
  {
    category: "Demand Forecasting Challenges",
    keywords: [
      "demand forecasting",
      "inventory planning",
      "stockouts",
      "overstocking",
      "demand volatility",
      "consumer behavior",
      "market prediction",
      "sales forecasting",
      "inventory optimization",
    ],
  },
  {
    category: "Regulatory & Compliance Challenges",
    keywords: [
      "regulatory",
      "compliance",
      "trade laws",
      "tariffs",
      "import regulations",
      "export controls",
      "customs",
      "safety standards",
      "quality standards",
    ],
  },
]

/**
 * Process business data to determine research requirements
 */
export async function processBusinessData(businessData: any): Promise<ResearchRequirements> {
  try {
    // Get current date for real-time context
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.toLocaleString("default", { month: "long" })

    // Create a prompt for Gemini with current time context
    const prompt = `
    You are an AI supply chain analysis expert performing real-time research as of ${currentMonth} ${currentYear}. 
    Based on the business information provided below, identify key requirements for a comprehensive 
    supply chain risk assessment and generate 7-10 highly specific search queries that would provide 
    valuable CURRENT insights into their supply chain risks.

    IMPORTANT SEARCH QUERY GUIDELINES:
    1. Include the current year (${currentYear}) in ALL queries to ensure up-to-date information
    2. Include the EXACT industry name and region in most queries for relevance
    3. Target specific supply chain components: sourcing, manufacturing, logistics, distribution, inventory
    4. Include specific ports, trade routes, or key suppliers relevant to their industry and region
    5. Target quantitative data: "percentage increase", "cost impact", "delay statistics", "risk metrics"
    6. Include terms like "disruption", "shortage", "bottleneck", "vulnerability", "exposure"
    7. Target recent regulatory changes affecting their industry's supply chain
    8. Include competitor or industry leader names when relevant
    9. Target ESG and sustainability impacts on supply chains in their industry
    10. Include specific technology disruptions affecting their industry's supply chain

    CRITICAL SUPPLY CHAIN ISSUES TO FOCUS ON:
    1. Supply Chain Disruptions & Geopolitical Issues (conflicts, trade restrictions)
    2. Shipping & Logistics Bottlenecks (port congestion, container shortages, freight costs)
    3. Inflation & Rising Costs (raw materials, labor, transportation)
    4. Lack of Supply Chain Visibility (tracking systems, real-time data)
    5. Labor Shortages & Workforce Challenges (warehousing, trucking, logistics)
    6. Cybersecurity Risks & Data Breaches (ransomware, phishing, IoT vulnerabilities)
    7. Sustainability & ESG Compliance (carbon footprint, environmental regulations)
    8. Over-reliance on Single Suppliers & Lack of Resilience (supplier diversification)
    9. Demand Forecasting Challenges (post-pandemic consumer behavior, AI planning)
    10. Regulatory & Compliance Challenges (trade laws, safety standards)

    If they mentioned specific concerns, prioritize those in your queries.
    
    Business Information:
    ${JSON.stringify(businessData, null, 2)}

    Please respond with valid JSON in the following format:
    {
      "requirements": "A detailed statement of what needs to be researched based on their business context, mentioning specific aspects of their supply chain that need investigation",
      "searchQueries": [
        "Highly specific query 1 with ${currentYear} and industry terms",
        "Highly specific query 2 with geographic focus and ${currentYear}",
        "Highly specific query 3 about recent disruptions with metrics ${currentYear}",
        "Additional specific queries..."
      ]
    }
    `

    // Get the completion
    const model = getGeminiModel()
    const result = await model.generateContent(prompt)
    const response = result.response
    const responseText = response.text()

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON response from Gemini")
    }

    const jsonContent = JSON.parse(jsonMatch[0])
    return {
      requirements: jsonContent.requirements,
      searchQueries: jsonContent.searchQueries,
    }
  } catch (error: any) {
    console.error("Error in Gemini processing:", error)

    // Throw a more specific error for better error handling
    if (error.message?.includes("API key")) {
      throw new Error("Invalid or unauthorized Gemini API key. Please check your API key and try again.")
    } else if (error.message?.includes("quota") || error.status === 429) {
      throw new Error("API quota exceeded. Please try again later or use a different API key.")
    } else if (error.status >= 500) {
      throw new Error("Google Gemini server error. Please try again later.")
    } else {
      throw new Error(`Error processing data with Gemini API: ${error.message || "Unknown error"}`)
    }
  }
}

/**
 * Analyze research data to generate insights
 */
export async function analyzeResearchData(searchResults: any[], businessData: any): Promise<AnalysisInsights> {
  try {
    // If no search results were found, throw an error
    if (!searchResults || searchResults.length === 0) {
      throw new Error("No search results found. Unable to perform analysis.")
    }

    // Extract sources and snippets from search results with publication dates
    const sourcesWithDates = searchResults.map((result) => ({
      source: result.source || "Unknown source",
      url: result.link || "",
      snippet: result.snippet || "",
      publishedDate: result.publishedDate || "",
      publishedTime: result.publishedTime || "",
    }))

    // Get current date for real-time context
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.toLocaleString("default", { month: "long" })

    // Create a prompt for Gemini with real-time analysis context
    const prompt = `
    You are an AI supply chain risk analyst examining CURRENT data as of ${currentMonth} ${currentYear}.
    Based on the following real-time search results and business information, analyze the supply chain risks 
    and provide a factual assessment that reflects TODAY'S market conditions.
    
    CRITICAL ANALYSIS REQUIREMENTS:
    1. Explicitly reference the SOURCE of the information with the EXACT URL
    2. Include the PUBLICATION DATE of the source when available
    3. Prioritize the MOST RECENT information (within the last 30 days if available)
    4. Include SPECIFIC NUMBERS, PERCENTAGES, and TIMEFRAMES whenever possible
    5. DO NOT provide recommendations, action plans, or suggestions - focus ONLY on factual risk analysis
    6. DO NOT include any "recommended actions" or "next steps" - only present factual findings
    7. Compare the company's situation with industry benchmarks and competitors using only factual data
    8. Identify emerging trends that could impact their supply chain based solely on the research data
    9. Highlight geographic-specific risks relevant to their region with supporting evidence
    10. Analyze regulatory and compliance risks specific to their industry and region with citations

    CRITICAL SUPPLY CHAIN ISSUES TO IDENTIFY AND ANALYZE:
    1. Supply Chain Disruptions & Geopolitical Issues: Analyze how ongoing conflicts, political instability, and trade restrictions are impacting global trade routes relevant to the business.
    
    2. Shipping & Logistics Bottlenecks: Identify specific port congestion, shipping delays, container shortages, and increased freight costs affecting the business's supply routes.
    
    3. Inflation & Rising Costs: Quantify increases in raw material, labor, and transportation costs, and analyze currency fluctuations affecting import/export pricing.
    
    4. Lack of Supply Chain Visibility: Assess if the business's industry is affected by outdated tracking systems and lack of real-time data and predictive analytics.
    
    5. Labor Shortages & Workforce Challenges: Identify skilled labor shortages in warehousing, trucking, and logistics relevant to the business's region and industry.
    
    6. Cybersecurity Risks & Data Breaches: Analyze recent attacks on supply chain networks (ransomware, phishing) and identify cybersecurity vulnerabilities in logistics software and IoT devices.
    
    7. Sustainability & ESG Compliance: Identify pressures to adopt eco-friendly practices and analyze how stricter environmental regulations are affecting the business's industry.
    
    8. Over-reliance on Single Suppliers & Lack of Resilience: Assess if the business's industry has dependencies on single countries or suppliers and identify diversification and reshoring trends.
    
    9. Demand Forecasting Challenges: Analyze how unpredictable consumer behavior is affecting the business's industry and identify if AI-driven demand planning is being underutilized.
    
    10. Regulatory & Compliance Challenges: Identify changing global trade laws, tax regulations, and stricter compliance requirements affecting the business's industry.

    Business Information:
    ${JSON.stringify(businessData, null, 2)}

    Search Results (with publication dates):
    ${JSON.stringify(sourcesWithDates, null, 2)}

    Please provide a comprehensive risk assessment in valid JSON format:
    {
      "overallRiskScore": [a number between 1-100],
      "riskLevel": ["Low", "Medium", "High", or "Critical"],
      "supplyChainDisruptions": {
        "count": [specific number of disruptions identified],
        "changeFromLastYear": [specific increase/decrease from previous year],
        "insight": [specific explanation with data points],
        "source": [exact source name],
        "sourceUrl": [exact URL of the source]
      },
      "costIncrease": {
        "percentage": [specific percentage increase in costs],
        "period": "YOY",
        "insight": [specific explanation with data points],
        "source": [exact source name],
        "sourceUrl": [exact URL of the source]
      },
      "supplierRisk": {
        "percentage": [specific risk percentage for supplier reliability],
        "level": ["Low", "Medium", "High", or "Critical"],
        "insight": [specific explanation with data points],
        "source": [exact source name],
        "sourceUrl": [exact URL of the source]
      },
      "topRisks": [
        {
          "factor": "Specific risk factor with detailed current context",
          "score": [1-10],
          "source": [exact source name],
          "sourceUrl": [exact URL of the source],
          "publishedDate": [publication date if available],
          "category": [one of the 10 supply chain issue categories listed above]
        },
        // Add 6-8 more risk factors, ensuring coverage of different supply chain issue categories
      ],
      "riskCategories": [
        {"name": "Category name", "businessScore": [1-10], "industryAverage": [1-10]},
        // Include at least these categories: Sourcing, Manufacturing, Logistics, Inventory, Regulatory, Technology, Sustainability
      ],
      "keyInsights": [
        {
          "title": "Specific insight title",
          "description": "Detailed description with CURRENT data points and SPECIFIC context for ${businessData.industry} in ${businessData.region}",
          "source": "Exact source name",
          "sourceUrl": "Exact URL of the source",
          "publishedDate": "Publication date if available",
          "category": [one of the 10 supply chain issue categories listed above]
        },
        // Add 4-6 more insights, ensuring they cover different aspects of supply chain risk
      ]
    }
    `

    // Get the completion
    const model = getGeminiModel()
    const result = await model.generateContent(prompt)
    const response = result.response
    const responseText = response.text()

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON response from Gemini")
    }

    const analysisResults = JSON.parse(jsonMatch[0])

    // Post-process the results to ensure all top risks have a category
    if (analysisResults.topRisks && Array.isArray(analysisResults.topRisks)) {
      analysisResults.topRisks = analysisResults.topRisks.map((risk) => {
        // If risk doesn't have a category, try to assign one based on content
        if (!risk.category) {
          const factor = risk.factor || ""

          // Find the most relevant category based on keyword matching
          let bestCategory = null
          let highestMatchCount = 0

          KEY_SUPPLY_CHAIN_RISKS.forEach((categoryInfo) => {
            let matchCount = 0
            categoryInfo.keywords.forEach((keyword) => {
              if (factor.toLowerCase().includes(keyword.toLowerCase())) {
                matchCount++
              }
            })

            if (matchCount > highestMatchCount) {
              highestMatchCount = matchCount
              bestCategory = categoryInfo.category
            }
          })

          // Assign the best matching category or a default
          risk.category = bestCategory || "Other Supply Chain Risk"
        }

        return risk
      })

      // Ensure we have a diverse set of risk categories
      const categories = new Set(analysisResults.topRisks.map((risk) => risk.category))

      // If we have fewer than 5 categories, try to add more diverse risks
      if (categories.size < 5 && analysisResults.topRisks.length < 10) {
        // Find missing categories
        const missingCategories = KEY_SUPPLY_CHAIN_RISKS.filter((cat) => !Array.from(categories).includes(cat.category))

        // For each missing category, try to create a synthetic risk if we have fewer than 10 risks
        missingCategories.forEach((category) => {
          if (analysisResults.topRisks.length < 10) {
            // Create a synthetic risk based on the category
            analysisResults.topRisks.push({
              factor: `${category.category} affecting ${businessData.industry} in ${businessData.region}`,
              score: 5, // Medium risk score
              source: "Industry Analysis",
              sourceUrl: "",
              category: category.category,
            })
          }
        })
      }

      // Sort risks by score (highest first)
      analysisResults.topRisks.sort((a, b) => (b.score || 0) - (a.score || 0))
    }

    return analysisResults
  } catch (error: any) {
    console.error("Error in Gemini analysis:", error)

    // Throw a more specific error for better error handling
    if (error.message?.includes("API key")) {
      throw new Error("Invalid or unauthorized Gemini API key. Please check your API key and try again.")
    } else if (error.message?.includes("quota") || error.status === 429) {
      throw new Error("API quota exceeded. Please try again later or use a different API key.")
    } else if (error.status >= 500) {
      throw new Error("Google Gemini server error. Please try again later.")
    } else {
      throw new Error(`Error analyzing data with Gemini API: ${error.message || "Unknown error"}`)
    }
  }
}

