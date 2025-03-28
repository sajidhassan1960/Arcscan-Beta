import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface RiskScoreCardProps {
  score: number
  level: string
}

export function RiskScoreCard({ score, level }: RiskScoreCardProps) {
  // Determine color based on risk level
  const getColorClass = () => {
    if (score < 40) return "text-green-500"
    if (score < 60) return "text-amber-500"
    if (score < 80) return "text-orange-500"
    return "text-red-500"
  }

  // Get background color for the card
  const getBackgroundClass = () => {
    if (score < 40) return "from-green-50 to-white"
    if (score < 60) return "from-amber-50 to-white"
    if (score < 80) return "from-orange-50 to-white"
    return "from-red-50 to-white"
  }

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardContent
        className="p-6 bg-gradient-to-r h-full flex flex-col justify-between"
        style={{ backgroundImage: `linear-gradient(to right, ${getBackgroundClass()})` }}
      >
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className={`h-5 w-5 ${getColorClass()}`} />
            <h3 className="font-medium">Overall Risk Score</h3>
          </div>
          <div className="flex items-end gap-2">
            <div className={`text-5xl font-bold ${getColorClass()}`}>{score}</div>
            <div className="text-sm text-gray-500 mb-2">/100</div>
          </div>
          <div className="mt-2 text-sm font-medium">{level} Risk Level</div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div
            className={`h-2.5 rounded-full ${score < 40 ? "bg-green-500" : score < 60 ? "bg-amber-500" : score < 80 ? "bg-orange-500" : "bg-red-500"}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  )
}

