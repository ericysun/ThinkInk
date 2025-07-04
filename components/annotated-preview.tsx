"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Annotation {
  text: string
  type: 'positive' | 'negative'
  comment: string
}

interface AnnotatedPreviewProps {
  text: string
  annotations: Annotation[]
}

export default function AnnotatedPreview({ text, annotations }: AnnotatedPreviewProps) {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<Annotation | null>(null)

  // Sort annotations by their position in the text to ensure proper highlighting
  const sortedAnnotations = [...annotations].sort((a, b) => {
    return text.indexOf(a.text) - text.indexOf(b.text)
  })

  // Split the text into segments based on annotations
  const segments: { text: string; annotation: Annotation | null }[] = []
  let lastIndex = 0

  sortedAnnotations.forEach(annotation => {
    const index = text.indexOf(annotation.text, lastIndex)
    if (index !== -1) {
      // Add text before the annotation
      if (index > lastIndex) {
        segments.push({
          text: text.slice(lastIndex, index),
          annotation: null
        })
      }
      // Add the annotated text
      segments.push({
        text: annotation.text,
        annotation
      })
      lastIndex = index + annotation.text.length
    }
  })

  // Add any remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      annotation: null
    })
  }

  return (
	<TooltipProvider delayDuration={300}>
	<div className="prose prose-green max-w-none">
		{segments.map((segment, index) => {
		if (!segment.annotation) {
			return <span key={index}>{segment.text}</span>
		}

		return (
			<Tooltip key={index}>
			<TooltipTrigger asChild>
				<span
				className={cn(
					"cursor-help px-1 rounded transition-colors duration-200",
					segment.annotation.type === 'positive'
					? 'bg-green-100 text-green-800 hover:bg-green-200'
					: 'bg-red-100 text-red-800 hover:bg-red-200'
				)}
				>
				{segment.text}
				</span>
			</TooltipTrigger>
			<TooltipContent
				side="top"
				align="center"
				sideOffset={5}
				className={cn(
				"max-w-sm p-3 shadow-lg transition-all duration-200",
				segment.annotation.type === 'positive'
					? 'bg-green-50 border-green-200'
					: 'bg-red-50 border-red-200'
				)}
			>
				<p className="text-sm font-medium">
				{segment.annotation.comment}
				</p>
			</TooltipContent>
			</Tooltip>
		)
		})}
	</div>
	</TooltipProvider>
  )
} 