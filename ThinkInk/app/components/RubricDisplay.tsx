import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface RubricDisplayProps {
  thesisText: string
  activeAssignment: number
  markComplete: () => void
  assignmentInstructions: {
    _id: string
    title: string
    instructions: string
    goal: string
    placeholder: string
    examples?: {
      strong1: { example: string; explanation: string }
      strong2: { example: string; explanation: string }
      weak1: { example: string; explanation: string }
      weak2: { example: string; explanation: string }
    }
    rubric?: {
      criteria: string
      points: number
      excellent: string
      good: string
      needsImprovement: string
    }[]
  }[]
  feedback: {
    overallFeedback: string;
    criteriaFeedback: {
      criteria: string;
      points: number;
      feedback: string;
      level: 'excellent' | 'good' | 'needsImprovement';
    }[];
  } | null
  onCheckWork: () => Promise<void>
}

export function RubricDisplay({
  thesisText,
  activeAssignment,
  markComplete,
  assignmentInstructions,
  feedback,
  onCheckWork
}: RubricDisplayProps) {
  const currentAssignment = assignmentInstructions[activeAssignment]

  if (!currentAssignment) {
    return null
  }

  const getLevelIcon = (level: 'excellent' | 'good' | 'needsImprovement') => {
    switch (level) {
      case 'excellent':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'good':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'needsImprovement':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getScoreColor = (points: number, maxPoints: number) => {
    const percentage = (points / maxPoints) * 100
    if (percentage >= 90) return 'bg-green-100 text-green-800'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rubric</CardTitle>
          <Button onClick={onCheckWork}>Check My Work</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentAssignment.rubric?.map((criterion, index) => {
            const feedbackItem = feedback?.criteriaFeedback.find(
              f => f.criteria === criterion.criteria
            )
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{criterion.criteria}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feedbackItem ? (
                        <span className="flex items-center gap-2">
                          {getLevelIcon(feedbackItem.level)}
                          {feedbackItem.feedback}
                        </span>
                      ) : (
                        `Worth ${criterion.points} points`
                      )}
                    </p>
                  </div>
                  {feedbackItem && (
                    <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(feedbackItem.points, criterion.points)}`}>
                      {feedbackItem.points}/{criterion.points} pts
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Excellent: {criterion.excellent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-600">Good: {criterion.good}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Needs Improvement: {criterion.needsImprovement}</span>
                  </div>
                </div>
              </div>
            )
          })}
          
          {feedback && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Overall Feedback</h4>
              <p className="text-sm">{feedback.overallFeedback}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 