"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Lock, Unlock, Star } from "lucide-react"
import { ProgressBar } from "@/components/progress-bar"

// Assignment data
const assignments = [
  {
    id: 0,
    title: "Understanding AP US History DBQs",
    description: "Learn the structure and requirements of DBQs",
    estimatedTime: "15 min",
    xp: 100,
  },
  {
    id: 1,
    title: "Analyzing Historical Documents",
    description: "Practice analyzing primary and secondary sources",
    estimatedTime: "25 min",
    xp: 150,
  },
  {
    id: 2,
    title: "Crafting a DBQ Thesis",
    description: "Write a thesis that addresses the prompt completely",
    estimatedTime: "30 min",
    xp: 200,
  },
  {
    id: 3,
    title: "Document Analysis & Grouping",
    description: "Organize documents by themes and perspectives",
    estimatedTime: "35 min",
    xp: 250,
  },
  {
    id: 4,
    title: "Incorporating Outside Knowledge",
    description: "Strengthen your argument with historical context",
    estimatedTime: "30 min",
    xp: 200,
  },
  {
    id: 5,
    title: "Developing Body Paragraphs",
    description: "Structure paragraphs with document evidence",
    estimatedTime: "40 min",
    xp: 300,
  },
  {
    id: 6,
    title: "Final DBQ Review",
    description: "Review and refine your complete DBQ essay",
    estimatedTime: "25 min",
    xp: 350,
  },
]

interface AssignmentListProps {
  activeAssignment: number
  setActiveAssignment: (index: number) => void
  completedAssignments: number[]
}

export default function AssignmentList({
  activeAssignment,
  setActiveAssignment,
  completedAssignments,
}: AssignmentListProps) {
  // Function to determine if an assignment is locked
  const isLocked = (index: number) => {
    if (index === 0) return false // First assignment is always unlocked
    return !completedAssignments.includes(index - 1) && !completedAssignments.includes(index)
  }

  return (
    <Card className="h-full rounded-r-lg shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 border-green-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-tr-lg">
        <CardTitle className="flex items-center justify-between">
          <span>Quest Progress</span>
          <Badge variant="outline" className="ml-2 bg-white/20 text-white border-white/30">
            {completedAssignments.length}/{assignments.length}
          </Badge>
        </CardTitle>
        <ProgressBar value={completedAssignments.length} max={assignments.length} size="sm" className="mt-2" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-2">
            {assignments.map((assignment, index) => {
              const completed = completedAssignments.includes(index)
              const locked = isLocked(index)

              return (
                <div
                  key={assignment.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] ${
                    locked
                      ? "bg-gray-100 border border-gray-200 opacity-70 cursor-not-allowed"
                      : activeAssignment === index
                        ? "bg-gradient-to-r from-green-200 to-emerald-200 border border-green-300 shadow-md"
                        : completed
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200"
                          : "bg-white border border-green-200 hover:bg-green-50"
                  }`}
                  onClick={() => !locked && setActiveAssignment(index)}
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
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                          {assignment.estimatedTime}
                        </Badge>
                        <div className="flex items-center text-xs font-medium text-amber-600">
                          <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                          {assignment.xp} XP
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
