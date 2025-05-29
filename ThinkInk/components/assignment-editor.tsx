"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Sparkles, Zap, BookOpen } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getAssignmentInstructions } from "@/app/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import AnnotatedPreview from "./annotated-preview"

interface AssignmentInstruction {
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
}

interface AssignmentEditorProps {
  assignmentText: string
  setAssignmentText: (text: string) => void
  activeAssignment: number
  markComplete: () => void
  feedback: {
    overallFeedback: string;
    criteriaFeedback: {
      criteria: string;
      points: number;
      feedback: string;
      level: 'excellent' | 'good' | 'needsImprovement';
    }[];
    annotations: {
      text: string;
      type: 'positive' | 'negative';
      comment: string;
    }[];
  } | null
}

export default function AssignmentEditor({ assignmentText, setAssignmentText, activeAssignment, markComplete, feedback }: AssignmentEditorProps) {
  const [assignmentInstructions, setAssignmentInstructions] = useState<AssignmentInstruction[]>([])
  const [wordCount, setWordCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isGrading, setIsGrading] = useState(false)

  useEffect(() => {
    async function loadInstructions() {
      try {
        const instructions = await getAssignmentInstructions()
        setAssignmentInstructions(instructions)
      } catch (error) {
        toast({
          title: "Error loading instructions",
          description: "Failed to load assignment instructions. Please try refreshing the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadInstructions()
  }, [])

  const currentAssignment = assignmentInstructions[activeAssignment]

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setAssignmentText(text)
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length)
  }

  if (isLoading) {
    return (
      <Card className="h-[calc(100vh-100px)] bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 shadow-lg">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-green-700">Loading assignment...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentAssignment) {
    return (
      <Card className="h-[calc(100vh-100px)] bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 shadow-lg">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600">Assignment not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-[calc(100vh-100px)] bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {currentAssignment.title}
            </CardTitle>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
              <span>{wordCount}</span>
              <span>words</span>
            </div>
          </div>
          <CardDescription className="text-green-100 mt-2">{currentAssignment.goal}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="write" className="h-[calc(100%-140px)]">
            <TabsList className="w-full rounded-none bg-green-100 p-0 h-10">
              <TabsTrigger
                value="write"
                className="rounded-none data-[state=active]:bg-white data-[state=active]:text-green-800 flex-1 h-10"
              >
                Write
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="rounded-none data-[state=active]:bg-white data-[state=active]:text-green-800 flex-1 h-10"
              >
                Annotated Preview
              </TabsTrigger>
              <TabsTrigger
                value="examples"
                className="rounded-none data-[state=active]:bg-white data-[state=active]:text-green-800 flex-1 h-10"
              >
                Instructions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="mt-0 h-full">
              <Textarea
                value={assignmentText}
                onChange={handleTextChange}
                placeholder={currentAssignment.placeholder}
                className="min-h-[calc(100vh-350px)] resize-none rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0 h-full">
              <div className="bg-white p-4 min-h-[calc(100vh-350px)]">
                {assignmentText ? (
                  feedback ? (
                    <AnnotatedPreview
                      text={assignmentText}
                      annotations={feedback.annotations}
                    />
                  ) : (
                    <div className="prose max-w-none">
                      {assignmentText.split("\n").map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                    <Sparkles className="h-12 w-12 mb-2 text-green-200" />
                    <p>Nothing to preview yet</p>
                    <p className="text-sm">Start writing to see your work here!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="examples" className="mt-0 h-full">
              <div className="bg-white p-4 min-h-[calc(100vh-350px)] overflow-auto">
                {currentAssignment && (
                  <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Instructions</h3>
                      <p className="text-green-800 whitespace-pre-wrap">{currentAssignment.instructions}</p>
                    </div>

                    {currentAssignment.examples && (
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">Examples</h3>
                        <Tabs defaultValue="strong1" className="w-full">
                          <TabsList className="w-full grid grid-cols-4">
                            <TabsTrigger value="strong1" className="text-xs">Strong Example 1</TabsTrigger>
                            <TabsTrigger value="strong2" className="text-xs">Strong Example 2</TabsTrigger>
                            <TabsTrigger value="weak1" className="text-xs">Weak Example 1</TabsTrigger>
                            <TabsTrigger value="weak2" className="text-xs">Weak Example 2</TabsTrigger>
                          </TabsList>

                          <TabsContent value="strong1" className="mt-4">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-green-900 mb-1">
                                  Strong Thesis Example 1
                                </label>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                  <p className="text-green-800 italic">{currentAssignment.examples.strong1.example}</p>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-green-900 mb-1">
                                  Explanation
                                </label>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                  <p className="text-green-700">{currentAssignment.examples.strong1.explanation}</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="strong2" className="mt-4">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-green-900 mb-1">
                                  Strong Thesis Example 2
                                </label>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                  <p className="text-green-800 italic">{currentAssignment.examples.strong2.example}</p>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-green-900 mb-1">
                                  Explanation
                                </label>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                  <p className="text-green-700">{currentAssignment.examples.strong2.explanation}</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="weak1" className="mt-4">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-red-900 mb-1">
                                  Weak Thesis Example 1
                                </label>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                  <p className="text-red-800 italic">{currentAssignment.examples.weak1.example}</p>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-red-900 mb-1">
                                  Explanation
                                </label>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                  <p className="text-red-700">{currentAssignment.examples.weak1.explanation}</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="weak2" className="mt-4">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-red-900 mb-1">
                                  Weak Thesis Example 2
                                </label>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                  <p className="text-red-800 italic">{currentAssignment.examples.weak2.example}</p>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-red-900 mb-1">
                                  Explanation
                                </label>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                  <p className="text-red-700">{currentAssignment.examples.weak2.explanation}</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between bg-green-100 rounded-b-lg">
          <Button
            variant="outline"
            className="border-green-700 text-green-700 hover:bg-green-50 bg-white"
            onClick={() => {
              toast({
                title: "Draft Saved! 📝",
                description: "Your work has been saved successfully.",
                variant: "default",
              })
            }}
          >
            Save Draft
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Assignment Feedback
            </DialogTitle>
            <DialogDescription>
              Detailed feedback on your work based on the rubric criteria
            </DialogDescription>
          </DialogHeader>

          {isGrading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : feedback ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Overall Feedback</h3>
                <p className="text-green-800">{feedback.overallFeedback}</p>
              </div>

              <div className="space-y-4">
                {feedback.criteriaFeedback.map((criterion, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      criterion.level === 'excellent'
                        ? 'bg-green-50 border-green-200'
                        : criterion.level === 'good'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{criterion.criteria}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {criterion.points} points
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            criterion.level === 'excellent'
                              ? 'bg-green-100 text-green-800'
                              : criterion.level === 'good'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {criterion.level.charAt(0).toUpperCase() + criterion.level.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{criterion.feedback}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(false)}
                  className="border-green-700 text-green-700 hover:bg-green-50"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowFeedback(false)
                    markComplete()
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
                >
                  Mark as Complete
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
