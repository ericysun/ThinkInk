'use client'

import { DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronLeft, ChevronRight, Star, Trophy, Zap, List } from "lucide-react"
import AssignmentEditor from "@/components/assignment-editor"
import RubricDisplay from "@/components/rubric-display"
import Confetti from "@/components/confetti"
import { ProgressBar } from "@/components/progress-bar"
import { AchievementBadge } from "@/components/achievement-badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Lock, Unlock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getAssignments, getAssignmentInstructions, gradeAssignment } from "@/app/actions"
import { Assignment } from "@/types/db"
import Image from 'next/image'
import Link from 'next/link'

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

const ENCOURAGING_MESSAGES = [
  "Great job! You're making excellent progress!",
  "You're crushing this learning workshop!",
  "Awesome work! Keep up the momentum!",
  "You're on fire! 🔥 Keep going!",
  "Fantastic progress! You're mastering the skills!",
  "Impressive work! You're well on your way!",
  "You're doing amazing! Keep up the great work!",
  "Excellent effort! You're becoming an expert!",
]

export default function LessonsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [assignmentInstructions, setAssignmentInstructions] = useState<AssignmentInstruction[]>([])
  const [activeAssignment, setActiveAssignment] = useState(0)
  const [completedAssignments, setCompletedAssignments] = useState<number[]>([])
  const [assignmentText, setAssignmentText] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [streak, setStreak] = useState(0)
  const [points, setPoints] = useState(0)
  const [lastActive, setLastActive] = useState(Date.now())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<{
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
  } | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isGrading, setIsGrading] = useState(false)

  // Fetch assignments on component mount
  useEffect(() => {
    async function fetchAssignments() {
      const data = await getAssignments()
      setAssignments(data)
    }
    fetchAssignments()
  }, [])

  // Fetch assignment instructions
  useEffect(() => {
    async function fetchInstructions() {
      try {
        const instructions = await getAssignmentInstructions()
        setAssignmentInstructions(instructions)
      } catch (error) {
        toast({
          title: "Error loading instructions",
          description: "Failed to load assignment instructions. Please try refreshing the page.",
          variant: "destructive",
        })
      }
    }
    fetchInstructions()
  }, [])

  const handleCheckWork = async () => {
    if (!assignmentInstructions[activeAssignment]?._id) return
    
    setIsGrading(true)
    setShowFeedback(true)
    
    try {
      const result = await gradeAssignment(assignmentInstructions[activeAssignment]._id, assignmentText)
      
      // Update feedback state with the complete result
      setFeedback(result)
      
      // If all criteria are at least "good" level, mark as complete
      const allGoodOrBetter = result.criteriaFeedback.every(
        criterion => criterion.level === 'excellent' || criterion.level === 'good'
      )
      
      if (allGoodOrBetter) {
        markComplete(activeAssignment)
      }

      // Calculate total score
      const totalScore = result.criteriaFeedback.reduce((sum, criterion) => sum + criterion.points, 0)
      const maxScore = assignmentInstructions[activeAssignment].rubric?.reduce((sum, criterion) => sum + criterion.points, 0) || 0
      const percentage = (totalScore / maxScore) * 100

      toast({
        title: "Grading Complete! 📊",
        description: (
          <div className="flex flex-col gap-2">
            <p>Your score: {totalScore}/{maxScore} points ({percentage.toFixed(1)}%)</p>
            {allGoodOrBetter && <p className="text-green-600 font-medium">Great job! You've met all the criteria! 🎉</p>}
          </div>
        ),
        variant: "default",
      })
    } catch (error) {
      console.error('Error in handleCheckWork:', error)
      toast({
        title: "Error grading work",
        description: "Failed to grade your work. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGrading(false)
    }
  }

  const markComplete = (index: number) => {
    if (!completedAssignments.includes(index)) {
      // Show confetti
      setShowConfetti(true)

      // Update completed assignments
      setCompletedAssignments([...completedAssignments, index])

      // Update streak and points
      const now = Date.now()
      const hoursSinceLastActive = (now - lastActive) / (1000 * 60 * 60)

      if (hoursSinceLastActive < 24) {
        setStreak(streak + 1)
      } else {
        setStreak(1)
      }

      setLastActive(now)

      // Award points (more points for streak)
      const newPoints = 100 + streak * 10
      setPoints(points + newPoints)

      // Show encouraging message
      const randomMessage = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]
      toast({
        title: "Assignment Completed! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <p>{randomMessage}</p>
            <p className="font-bold text-green-700">+{newPoints} points earned!</p>
            {streak > 1 && <p className="text-amber-600">🔥 {streak} day streak bonus!</p>}
          </div>
        ),
        variant: "default",
      })
    }
  }

  const goToNextAssignment = () => {
    if (activeAssignment < assignments.length - 1) {
      setActiveAssignment(activeAssignment + 1)
      setAssignmentText("")
      setFeedback(null)
    }
  }

  const goToPreviousAssignment = () => {
    if (activeAssignment > 0) {
      setActiveAssignment(activeAssignment - 1)
      setAssignmentText("")
      setFeedback(null)
    }
  }

  // Function to determine if an assignment is locked
  const isLocked = (index: number) => {
    if (index === 0) return false // First assignment is always unlocked
    return !completedAssignments.includes(index - 1) && !completedAssignments.includes(index)
  }

  const totalAssignments = assignments.length
  const progressPercentage = (completedAssignments.length / totalAssignments) * 100

  if (assignments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading assignments...</h2>
          <p className="text-gray-600">Please wait while we fetch your learning materials.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-100 to-emerald-200 pattern-dots">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Toaster />

      <div className="flex justify-center py-2 bg-gradient-to-r from-green-600 to-emerald-700">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image
            src="/ThinkInk.png"
            alt="ThinkInk Logo"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
          <h1 className="text-xl font-bold text-white">ThinkInk</h1>
        </Link>
      </div>

      <header className="border-b border-green-300 bg-gradient-to-r from-green-600 to-emerald-700 py-4 px-6 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between max-w-[2000px] mx-auto">
          <div className="flex items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1 text-white hover:bg-green-500/20"
                  aria-label="View assignments"
                >
                  <List className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Assignments</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-auto pr-2">
                  <div className="space-y-4 mt-4">
                    {assignments.map((assignment, index) => {
                      const completed = completedAssignments.includes(index)
                      const locked = isLocked(index)
                      const isActive = index === activeAssignment

                      return (
                        <div
                          key={assignment._id}
                          className={`p-3 rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] ${
                            locked
                              ? "bg-gray-100 border border-gray-200 opacity-70 cursor-not-allowed"
                              : isActive
                                ? "bg-gradient-to-r from-green-200 to-emerald-200 border border-green-300 shadow-md"
                                : completed
                                  ? "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200"
                                  : "bg-white border border-green-200 hover:bg-green-50"
                          }`}
                          onClick={() => {
                            if (!locked) {
                              setActiveAssignment(index)
                              setDialogOpen(false)
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {completed ? (
                                <div className="relative">
                                  <CheckCircle className="h-6 w-6 text-green-600" />
                                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse" />
                                </div>
                              ) : locked ? (
                                <Lock className="h-6 w-6 text-gray-400" />
                              ) : (
                                <Unlock className="h-6 w-6 text-amber-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{assignment.title}</h3>
                              <p className="text-xs text-gray-600 mt-1">{assignment.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-100 text-green-800 border-green-200"
                                >
                                  {assignment.estimatedTime} min
                                </Badge>
                                <div className="flex items-center text-xs font-medium text-amber-600">
                                  <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                                  {100 + index * 50} XP
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <BookOpen className="h-6 w-6 text-white" />
            <h1 className="text-xl font-bold text-white">Learning Quest</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full text-white">
              <Zap className="h-4 w-4" />
              <span className="font-bold">{points}</span>
              <span className="text-xs">points</span>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full text-white">
              <Star className="h-4 w-4 text-amber-300" />
              <span className="font-bold">{streak}</span>
              <span className="text-xs">day streak</span>
            </div>

            <Button variant="default" size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
              <Trophy className="mr-2 h-4 w-4" />
              Rewards
            </Button>
          </div>
        </div>

        <div className="max-w-[2000px] mx-auto mt-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white">Overall Progress</span>
              <span className="text-xs font-bold text-white">
                {completedAssignments.length}/{totalAssignments}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-green-500/20"
                onClick={goToPreviousAssignment}
                disabled={activeAssignment === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium text-white">
                Assignment {activeAssignment + 1} of {totalAssignments}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-green-500/20"
                onClick={goToNextAssignment}
                disabled={activeAssignment === totalAssignments - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ProgressBar
            value={completedAssignments.length}
            max={totalAssignments}
            variant={progressPercentage >= 100 ? "success" : "default"}
            size="sm"
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-[2000px] mx-auto w-full p-4 gap-4">
        {/* Middle Column - Assignment Editor */}
        <div className="w-full md:w-1/2 order-1">
          <AssignmentEditor
            assignmentText={assignmentText}
            setAssignmentText={setAssignmentText}
            activeAssignment={activeAssignment}
            markComplete={() => markComplete(activeAssignment)}
            feedback={feedback}
          />
        </div>

        {/* Right Column - Rubric Display */}
        <div className="w-full md:w-1/2 order-2">
          <RubricDisplay
            assignmentText={assignmentText}
            activeAssignment={activeAssignment}
            markComplete={() => markComplete(activeAssignment)}
            assignmentInstructions={assignmentInstructions}
            feedback={feedback}
            onCheckWork={handleCheckWork}
            isGrading={isGrading}
          />
        </div>
      </main>

      {/* Achievement badges */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 items-center">
        {completedAssignments.length >= 1 && (
          <AchievementBadge variant="bronze" icon="medal" tooltip="First Assignment Completed!" />
        )}
        {completedAssignments.length >= 3 && (
          <AchievementBadge variant="silver" icon="star" tooltip="Learning Apprentice: 3 Assignments Done" />
        )}
        {completedAssignments.length >= 5 && (
          <AchievementBadge variant="gold" icon="trophy" tooltip="Learning Scholar: 5 Assignments Done" />
        )}
        {completedAssignments.length >= 7 && (
          <AchievementBadge variant="platinum" icon="award" tooltip="Learning Master: All Assignments Complete!" />
        )}
      </div>
    </div>
  )
} 