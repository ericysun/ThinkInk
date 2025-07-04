"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Sparkles, Award, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { gradeAssignment } from "@/app/actions"

interface RubricDisplayProps {
  assignmentText: string
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
    overallFeedback: string
    criteriaFeedback: {
      criteria: string
      points: number
      feedback: string
      level: 'excellent' | 'good' | 'needsImprovement'
    }[]
    annotations: {
      text: string
      type: 'positive' | 'negative'
      comment: string
    }[]
  } | null
  onCheckWork: () => Promise<void>
  isGrading: boolean
}

export default function RubricDisplay({ assignmentText, activeAssignment, markComplete, assignmentInstructions, feedback, onCheckWork, isGrading }: RubricDisplayProps) {
  const currentAssignment = assignmentInstructions[activeAssignment]

  const handleGrade = async () => {
    if (!currentAssignment || !currentAssignment._id) return
    await onCheckWork()
  }

  return (
    <Card className="h-[calc(100vh-100px)] bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Rubric & Feedback
        </CardTitle>
        <CardDescription className="text-green-100 mt-2">
          Review the criteria and get feedback on your work
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-6">
          {currentAssignment?.rubric && (
            <div className="space-y-4">
              {currentAssignment.rubric.map((criterion, index) => {
                const feedbackItem = feedback?.criteriaFeedback.find(
                  f => f.criteria === criterion.criteria
                )
                
                return (
                  <div
                    key={index}
                    className={`bg-white/80 backdrop-blur-sm rounded-lg p-4 border ${
                      feedbackItem
                        ? feedbackItem.level === 'excellent'
                          ? 'border-green-200'
                          : feedbackItem.level === 'good'
                          ? 'border-amber-200'
                          : 'border-red-200'
                        : 'border-green-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-green-900">{criterion.criteria}</h3>
                      <div className="flex items-center gap-2">
                        {feedbackItem ? (
                          <>
                            <span className="text-sm font-medium text-green-700">
                              {feedbackItem.points}/{criterion.points} points
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                feedbackItem.level === 'excellent'
                                  ? 'bg-green-100 text-green-800'
                                  : feedbackItem.level === 'good'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {feedbackItem.level.charAt(0).toUpperCase() + feedbackItem.level.slice(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-green-700">
                            {criterion.points} points
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {feedbackItem && (
                      <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-100">
                        <p className="text-sm text-green-800">{feedbackItem.feedback}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm text-green-800">{criterion.excellent}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          <CheckCircle className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-sm text-amber-800">{criterion.good}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          <CheckCircle className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-sm text-red-800">{criterion.needsImprovement}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {feedback && (
            <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-2">Overall Feedback</h3>
              <p className="text-sm text-green-800">{feedback.overallFeedback}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={onCheckWork}
              disabled={isGrading || !assignmentText.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
            >
              {isGrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Work...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Check My Work
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 