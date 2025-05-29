"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronLeft, ChevronRight, Star, Trophy, Zap, List } from "lucide-react"
import ThesisEditor from "@/components/thesis-editor"
import TutorChat from "@/components/tutor-chat"
import Confetti from "@/components/confetti"
import { ProgressBar } from "@/components/progress-bar"
import { AchievementBadge } from "@/components/achievement-badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Lock, Unlock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import Image from 'next/image'

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

const ENCOURAGING_MESSAGES = [
  "Great job! You're making excellent progress!",
  "You're crushing this DBQ workshop!",
  "Awesome work! Keep up the momentum!",
  "You're on fire! 🔥 Keep going!",
  "Fantastic progress! You're mastering AP US History!",
  "Impressive work! You're well on your way to a 5!",
  "You're doing amazing! Keep up the great work!",
  "Excellent effort! You're becoming a DBQ expert!",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/ThinkInk.png"
              alt="ThinkInk Logo"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ThinkInk
          </h1>
          <p className="text-gray-600 mb-8">
            Master the art of essay writing with AI-powered guidance
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin"
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Admin Dashboard
          </Link>

          <Link
            href="/lessons"
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-green-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            View Lessons
          </Link>
        </div>
      </div>
    </div>
  )
}
