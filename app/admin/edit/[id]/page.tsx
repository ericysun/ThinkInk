"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getAssignment, updateAssignment, generateExamples, generateDetailedInstructions } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Loader2 } from "lucide-react"
import { Assignment } from "@/types/db"

export default function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [title, setTitle] = useState("")
  const [goal, setGoal] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [learningGoals, setLearningGoals] = useState<string[]>([""])
  const [examples, setExamples] = useState<{
    strong1: { example: string; explanation: string };
    strong2: { example: string; explanation: string };
    weak1: { example: string; explanation: string };
    weak2: { example: string; explanation: string };
  }>({
    strong1: { example: "", explanation: "" },
    strong2: { example: "", explanation: "" },
    weak1: { example: "", explanation: "" },
    weak2: { example: "", explanation: "" }
  })
  const [instructions, setInstructions] = useState("")
  const [rubric, setRubric] = useState<{
    criteria: string;
    points: number;
    excellent: string;
    good: string;
    needsImprovement: string;
  }[]>([])
  const [generatingExamples, setGeneratingExamples] = useState(false)
  const [generatingInstructions, setGeneratingInstructions] = useState(false)

  useEffect(() => {
    async function loadAssignment() {
      try {
        const data = await getAssignment(resolvedParams.id)
        if (data) {
          setAssignment(data)
          setTitle(data.title)
          setGoal(data.goal)
          setSystemPrompt(data.systemPrompt)
          setLearningGoals(data.learningGoals.length > 0 ? data.learningGoals : [""])
          setExamples(data.examples || {
            strong1: { example: "", explanation: "" },
            strong2: { example: "", explanation: "" },
            weak1: { example: "", explanation: "" },
            weak2: { example: "", explanation: "" }
          })
          setInstructions(data.instructions || "")
          setRubric(data.rubric || [])
        } else {
          console.log('No assignment data received')
        }
      } catch (err) {
        console.error('Error loading assignment:', err)
        setError("Failed to load assignment. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    loadAssignment()
  }, [resolvedParams.id])

  const handleAddLearningGoal = () => {
    setLearningGoals([...learningGoals, ""])
  }

  const handleLearningGoalChange = (index: number, value: string) => {
    const newGoals = [...learningGoals]
    newGoals[index] = value
    setLearningGoals(newGoals)
  }

  const handleRemoveLearningGoal = (index: number) => {
    const newGoals = learningGoals.filter((_, i) => i !== index)
    setLearningGoals(newGoals)
  }

  async function handleGenerateExamples() {
    if (!title.trim() || !goal.trim()) {
      setError("Please enter both a title and goal before generating examples.")
      return
    }
    setGeneratingExamples(true)
    setError(null)
    try {
      const generatedExamples = await generateExamples(title, goal)
      setExamples(generatedExamples)
    } catch (err) {
      setError("Failed to generate examples. Please try again.")
    } finally {
      setGeneratingExamples(false)
    }
  }

  async function handleGenerateInstructions() {
    if (!title.trim() || !goal.trim() || !examples.strong1.example || !examples.strong2.example || !examples.weak1.example || !examples.weak2.example) {
      setError("Please enter title, goal, and all examples before generating instructions.")
      return
    }
    setGeneratingInstructions(true)
    setError(null)
    try {
      const result = await generateDetailedInstructions(title, goal, examples)
      setInstructions(result.instructions)
      setRubric(result.rubric)
    } catch (err) {
      setError("Failed to generate instructions. Please try again.")
    } finally {
      setGeneratingInstructions(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await updateAssignment(resolvedParams.id, {
        title,
        goal,
        systemPrompt,
        learningGoals: learningGoals.filter(goal => goal.trim() !== ""),
        examples,
        instructions,
        rubric,
        updatedAt: new Date(),
      })
      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError("Failed to update assignment. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-green-200">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-red-200">
            <CardContent className="py-8">
              <div className="text-center text-red-600">
                Assignment not found
              </div>
              <div className="mt-4 text-center">
                <Link
                  href="/admin"
                  className="text-green-600 hover:text-green-700"
                >
                  Return to Admin Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-green-600" />
              Edit Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-green-900 mb-1">
                    Assignment Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Crafting a DBQ Thesis"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-green-900 mb-1">
                    Assignment Goal
                  </label>
                  <Input
                    id="goal"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    placeholder="e.g. Write a thesis that addresses the prompt completely"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="systemPrompt" className="block text-sm font-medium text-green-900 mb-1">
                    System Prompt
                  </label>
                  <Textarea
                    id="systemPrompt"
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    placeholder="Enter the system prompt that defines the AI tutor's role and behavior..."
                    rows={4}
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-900 mb-1">
                    Learning Goals
                  </label>
                  <div className="space-y-2">
                    {learningGoals.map((goal, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={goal}
                          onChange={e => handleLearningGoalChange(index, e.target.value)}
                          placeholder={`Learning goal ${index + 1}`}
                          className="flex-1"
                        />
                        {learningGoals.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveLearningGoal(index)}
                            className="shrink-0"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddLearningGoal}
                      className="w-full"
                    >
                      Add Learning Goal
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-green-900">
                      Examples
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleGenerateExamples}
                      disabled={generatingExamples || !title.trim() || !goal.trim()}
                    >
                      {generatingExamples ? (
                        <><Loader2 className="animate-spin h-4 w-4" /> Generating...</>
                      ) : (
                        <><Sparkles className="h-4 w-4 text-green-600" /> Generate with AI</>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-4">
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
                            <Textarea
                              value={examples.strong1.example}
                              onChange={e => setExamples(prev => ({
                                ...prev,
                                strong1: { ...prev.strong1, example: e.target.value }
                              }))}
                              placeholder="Enter a strong thesis example..."
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-900 mb-1">
                              Explanation
                            </label>
                            <Textarea
                              value={examples.strong1.explanation}
                              onChange={e => setExamples(prev => ({
                                ...prev,
                                strong1: { ...prev.strong1, explanation: e.target.value }
                              }))}
                              placeholder="Enter explanation for the strong example..."
                              className="bg-white"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="strong2" className="mt-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-green-900 mb-1">
                              Strong Thesis Example 2
                            </label>
                            <Textarea
                              value={examples.strong2.example}
                              onChange={e => setExamples(prev => ({
                                ...prev,
                                strong2: { ...prev.strong2, example: e.target.value }
                              }))}
                              placeholder="Enter a strong thesis example..."
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-900 mb-1">
                              Explanation
                            </label>
                            <Textarea
                              value={examples.strong2.explanation}
                              onChange={e => setExamples(prev => ({
                                ...prev,
                                strong2: { ...prev.strong2, explanation: e.target.value }
                              }))}
                              placeholder="Enter explanation for the strong example..."
                              className="bg-white"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="weak1" className="mt-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-red-900 mb-1">
                              Weak Thesis Example 1
                            </label>
                            <Textarea
                              value={examples.weak1.example}
                              onChange={e => setExamples(prev => ({
                                ...prev,
                                weak1: { ...prev.weak1, example: e.target.value }
                              }))}
                              placeholder="Enter a weak thesis example..."
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-red-900 mb-1">
                              Explanation
                            </label>
                            <Textarea
                              value={examples.weak1.explanation}
                              onChange={e => setExamples(prev => ({
                                ...prev,
                                weak1: { ...prev.weak1, explanation: e.target.value }
                              }))}
                              placeholder="Enter explanation for the weak example..."
                              className="bg-white"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="weak2" className="mt-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-red-900 mb-1">
                              Weak Thesis Example 2
                            </label>
                            <Textarea
                              value={examples.weak2.example}
                              onChange={e => setExamples(prev => ({
                                ...prev,
                                weak2: { ...prev.weak2, example: e.target.value }
                              }))}
                              placeholder="Enter a weak thesis example..."
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-red-900 mb-1">
                              Explanation
                            </label>
                            <Textarea
                              value={examples.weak2.explanation}
                              onChange={e => setExamples(prev => ({
                                ...prev,
                                weak2: { ...prev.weak2, explanation: e.target.value }
                              }))}
                              placeholder="Enter explanation for the weak example..."
                              className="bg-white"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="instructions" className="block text-sm font-medium text-green-900">
                      Instructions & Rubric
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleGenerateInstructions}
                      disabled={generatingInstructions || !title.trim() || !goal.trim() || !examples.strong1.example || !examples.strong2.example || !examples.weak1.example || !examples.weak2.example}
                    >
                      {generatingInstructions ? (
                        <><Loader2 className="animate-spin h-4 w-4" /> Generating...</>
                      ) : (
                        <><Sparkles className="h-4 w-4 text-green-600" /> Generate with AI</>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-900 mb-1">
                        Detailed Instructions
                      </label>
                      <Textarea
                        value={instructions}
                        onChange={e => setInstructions(e.target.value)}
                        placeholder="Enter or generate instructions..."
                        rows={6}
                        className="bg-white"
                      />
                    </div>
                    {rubric.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-green-900 mb-2">
                          Rubric
                        </label>
                        <div className="space-y-4">
                          {rubric.map((item, index) => (
                            <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-green-900">{item.criteria}</h4>
                                <span className="text-sm font-medium text-green-700">{item.points} points</span>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs font-medium text-green-700">Excellent (4-5 points):</span>
                                  <p className="text-sm text-green-900">{item.excellent}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-green-700">Good (2-3 points):</span>
                                  <p className="text-sm text-green-900">{item.good}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-green-700">Needs Improvement (0-1 points):</span>
                                  <p className="text-sm text-green-900">{item.needsImprovement}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Link
                  href="/admin"
                  className="px-4 py-2 text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50"
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !goal.trim() || !instructions.trim()}
                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-6"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 