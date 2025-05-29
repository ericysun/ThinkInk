"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Send, User, Bot, Sparkles, CheckCircle, MessageSquare } from "lucide-react"
import { useChat } from "@ai-sdk/react" // Using AI SDK for the chat functionality [^1][^2]
import { toast } from "@/components/ui/use-toast"

interface TutorChatProps {
  thesisText: string
  activeAssignment: number
  markComplete: () => void
}

export default function TutorChat({ thesisText, activeAssignment, markComplete }: TutorChatProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [completeLoading, setCompleteLoading] = useState(false)

  // Using AI SDK's useChat hook for chat functionality [^1][^2]
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: `👋 Hi there, history explorer! I'm your AP US History DBQ tutor. I'll help you master the skills needed to write an effective Document-Based Question essay. What questions do you have about the current assignment?`,
      },
    ],
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Function to handle thesis submission for feedback
  const submitThesisForFeedback = () => {
    if (thesisText.trim().length < 10) {
      toast({
        title: "Not enough content",
        description: "Please write more content before requesting feedback.",
        variant: "destructive",
      })
      return
    }

    setFeedbackLoading(true)

    const form = new FormData()
    form.append("prompt", `Please review my thesis for assignment ${activeAssignment}: ${thesisText}`)
    handleSubmit({ preventDefault: () => {} } as any, form)

    setTimeout(() => {
      setFeedbackLoading(false)
    }, 1000)
  }

  const handleMarkComplete = () => {
    setCompleteLoading(true)

    setTimeout(() => {
      setCompleteLoading(false)
      markComplete()

      toast({
        title: "Achievement Unlocked! 🏆",
        description: "You've completed this assignment and earned XP!",
        variant: "success",
      })
    }, 1000)
  }

  return (
    <Card className="h-[calc(100vh-100px)] flex flex-col bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          History Tutor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 bg-white/50">
        <ScrollArea className="h-[calc(100vh-250px)]" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white"
                      : "bg-gradient-to-r from-amber-50 to-amber-100 text-gray-800 border border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === "assistant" && <Bot className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-600" />}
                    <div className="text-sm">{message.content}</div>
                    {message.role === "user" && <User className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg p-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-amber-600" />
                    <div className="flex items-center gap-1">
                      <div
                        className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-2 bg-green-100 rounded-b-lg">
        <Button
          variant="outline"
          className="w-full justify-start text-sm border-green-700 text-green-700 hover:bg-green-50 bg-white"
          onClick={submitThesisForFeedback}
          disabled={feedbackLoading || isLoading}
        >
          {feedbackLoading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              <span className="truncate">Getting feedback...</span>
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              <span className="truncate">Get feedback on my work</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-sm border-green-700 text-green-700 hover:bg-green-50 bg-white"
          onClick={handleMarkComplete}
          disabled={completeLoading}
        >
          {completeLoading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              <span className="truncate">Completing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span className="truncate">Mark assignment as complete</span>
            </>
          )}
        </Button>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask your tutor a question..."
            className="flex-1 border-green-300 bg-white focus-visible:ring-green-500"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading}
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
