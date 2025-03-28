import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Add the autotable type to jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface ReportData {
  companyName: string
  industry: string
  region: string
  overallRiskScore: number
  riskLevel: string
  supplyChainDisruptions: {
    count: number
    changeFromLastYear: number
    insight: string
    source?: string
    sourceUrl?: string
  }
  costIncrease: {
    percentage: number
    period: string
    insight: string
    source?: string
    sourceUrl?: string
  }
  supplierRisk: {
    percentage: number
    level: string
    insight: string
    source?: string
    sourceUrl?: string
  }
  topRisks: Array<{
    factor: string
    score: number
    source?: string
    sourceUrl?: string
    publishedDate?: string
  }>
  keyInsights: Array<{
    title: string
    description: string
    source: string
    sourceUrl?: string
    publishedDate?: string
  }>
  riskCategories: Array<{
    name: string
    businessScore: number
    industryAverage: number
  }>
  sources?: string[]
  generatedDate: Date
  apiProvider?: string
}

export function generatePdfReport(data: ReportData): string {
  // Create a new PDF document - use A4 portrait
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15 // Reduced margins
  const contentWidth = pageWidth - margin * 2

  // Helper function to add text with word wrap
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 5, // Reduced line height
    options: any = {},
  ): number => {
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y, options)
    return y + lines.length * lineHeight
  }

  // Helper function to get risk color
  const getRiskColor = (score: number) => {
    if (score < 40) return [16, 185, 129] // Green
    if (score < 60) return [245, 158, 11] // Amber
    if (score < 80) return [249, 115, 22] // Orange
    return [239, 68, 68] // Red
  }

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Set default font styles for professional look
  doc.setFont("helvetica", "normal")
  doc.setTextColor(50, 50, 50)

  // Add header with title and company info
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("SUPPLY CHAIN RISK ASSESSMENT", pageWidth / 2, margin, { align: "center" })

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(
    `Prepared for: ${data.companyName} | Industry: ${data.industry} | Region: ${data.region}`,
    pageWidth / 2,
    margin + 5,
    { align: "center" },
  )

  // Add date and confidentiality
  doc.setFontSize(8)
  doc.text(`Report Date: ${formatDate(data.generatedDate)} | CONFIDENTIAL`, pageWidth / 2, margin + 10, {
    align: "center",
  })

  // Add horizontal line
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, margin + 12, pageWidth - margin, margin + 12)

  // Risk score section - compact design
  let yPos = margin + 18

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("RISK ASSESSMENT SUMMARY", margin, yPos)

  // Risk score box
  yPos += 5
  const scoreBoxWidth = 60
  const scoreBoxHeight = 25

  // Draw score box with risk color
  doc.setFillColor(...getRiskColor(data.overallRiskScore))
  doc.roundedRect(margin, yPos, scoreBoxWidth, scoreBoxHeight, 2, 2, "F")

  // Add score text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(`${data.overallRiskScore}`, margin + 10, yPos + 15)

  doc.setFontSize(10)
  doc.text(`/100`, margin + 25, yPos + 15)

  doc.setFontSize(12)
  doc.text(`${data.riskLevel} Risk`, margin + 40, yPos + 15)

  // Reset text color
  doc.setTextColor(50, 50, 50)

  // Key metrics in compact table to the right of the score box
  const metricsX = margin + scoreBoxWidth + 10
  const metricsWidth = contentWidth - scoreBoxWidth - 10

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("KEY METRICS", metricsX, yPos + 5)

  // Create a compact metrics table
  const metricsData = [
    [
      `Supply Chain Disruptions: ${data.supplyChainDisruptions.count} (${data.supplyChainDisruptions.changeFromLastYear > 0 ? "+" : ""}${data.supplyChainDisruptions.changeFromLastYear})`,
    ],
    [`Cost Increase: ${data.costIncrease.percentage}% (${data.costIncrease.period})`],
    [`Supplier Risk: ${data.supplierRisk.percentage}% (${data.supplierRisk.level})`],
  ]

  doc.autoTable({
    startY: yPos + 7,
    head: [],
    body: metricsData,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 1,
    },
    columnStyles: {
      0: { cellWidth: metricsWidth },
    },
    margin: { left: metricsX },
  })

  // Update yPos to after the risk score section
  yPos += scoreBoxHeight + 5

  // Add horizontal line
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 5

  // Top risks section - compact table
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("TOP RISK FACTORS", margin, yPos)

  // Create a compact table for top risks
  const topRisksHead = [["Risk Factor", "Score", "Source"]]
  const topRisksBody = data.topRisks.slice(0, 5).map((risk) => [risk.factor, risk.score.toFixed(1), risk.source || ""])

  doc.autoTable({
    startY: yPos + 3,
    head: topRisksHead,
    body: topRisksBody,
    theme: "grid",
    headStyles: {
      fillColor: [80, 80, 80],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      lineWidth: 0.2,
      cellPadding: 2,
      fontSize: 8,
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      lineWidth: 0.2,
      lineColor: [200, 200, 200],
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.6 },
      1: { cellWidth: contentWidth * 0.1, halign: "center" },
      2: { cellWidth: contentWidth * 0.3 },
    },
    margin: { left: margin, right: margin },
  })

  // Update yPos to after the risks table
  yPos = (doc as any).lastAutoTable.finalY + 5

  // Risk categories section - horizontal bar chart
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("RISK CATEGORIES", margin, yPos)
  yPos += 5

  // Create a compact visualization of risk categories
  const categoryBarWidth = contentWidth * 0.6
  const categoryNameWidth = contentWidth * 0.25
  const categoryScoreWidth = contentWidth * 0.15

  // Draw category headers
  doc.setFontSize(7)
  doc.text("Category", margin, yPos)
  doc.text("Score", margin + categoryNameWidth + categoryBarWidth + 5, yPos)
  yPos += 3

  // Draw each category as a horizontal bar
  data.riskCategories.slice(0, 5).forEach((category, index) => {
    const barY = yPos + index * 7

    // Category name
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.text(category.name, margin, barY)

    // Bar background
    doc.setFillColor(240, 240, 240)
    doc.rect(margin + categoryNameWidth, barY - 3, categoryBarWidth, 4, "F")

    // Bar value
    const barValueWidth = (category.businessScore / 10) * categoryBarWidth
    doc.setFillColor(...getRiskColor(category.businessScore * 10))
    doc.rect(margin + categoryNameWidth, barY - 3, barValueWidth, 4, "F")

    // Score value
    doc.setFont("helvetica", "bold")
    doc.text(category.businessScore.toFixed(1), margin + categoryNameWidth + categoryBarWidth + 5, barY)

    // Industry average marker
    const avgX = margin + categoryNameWidth + (category.industryAverage / 10) * categoryBarWidth
    doc.setDrawColor(100, 100, 100)
    doc.setLineWidth(0.5)
    doc.line(avgX, barY - 4, avgX, barY + 1)
  })

  // Update yPos to after the categories
  yPos += 38

  // Key insights section - compact list
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("KEY INSIGHTS", margin, yPos)
  yPos += 5

  // Add top insights in a compact format
  doc.setFontSize(7)
  data.keyInsights.slice(0, 3).forEach((insight, index) => {
    doc.setFont("helvetica", "bold")
    const insightTitle = `${index + 1}. ${insight.title}`
    doc.text(insightTitle, margin, yPos)

    doc.setFont("helvetica", "normal")
    yPos =
      addWrappedText(
        insight.description.length > 100 ? insight.description.substring(0, 100) + "..." : insight.description,
        margin,
        yPos + 3,
        contentWidth,
        4,
      ) + 2
  })

  // Data sources section - compact list
  yPos += 3
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("DATA SOURCES", margin, yPos)
  yPos += 5

  // List top sources in a compact grid
  if (data.sources && data.sources.length > 0) {
    const sourcesPerRow = 3
    const sourceWidth = contentWidth / sourcesPerRow

    doc.setFontSize(6)
    doc.setFont("helvetica", "normal")

    for (let i = 0; i < Math.min(data.sources.length, 9); i++) {
      const rowIndex = Math.floor(i / sourcesPerRow)
      const colIndex = i % sourcesPerRow
      const sourceX = margin + colIndex * sourceWidth
      const sourceY = yPos + rowIndex * 4

      doc.text(`• ${data.sources[i]}`, sourceX, sourceY)
    }

    // If there are more sources, add a note
    if (data.sources.length > 9) {
      yPos += 12
      doc.setFontSize(6)
      doc.text(`+ ${data.sources.length - 9} more sources`, margin, yPos)
    } else {
      yPos += Math.ceil(Math.min(data.sources.length, 9) / sourcesPerRow) * 4
    }
  }

  // Add footer with attribution
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, pageHeight - margin - 8, pageWidth - margin, pageHeight - margin - 8)

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  doc.text("Analyzed by Arcscan", margin, pageHeight - margin - 3)
  doc.text("Powered by Google Gemini", pageWidth - margin, pageHeight - margin - 3, { align: "right" })

  // Return the PDF as a data URL
  return doc.output("datauristring")
}

