import connectToDatabase from '@/lib/mongodb'
import { Assignment } from '@/types/db'
import { generateObject } from 'ai'
import { azure } from '@ai-sdk/azure'
import { z } from 'zod'

interface RubricCriterion {
  criteria: string
  points: number
  excellent: string
  good: string
  needsImprovement: string
}

interface CriteriaFeedback {
  criteria: string
  points: number
  feedback: string
  level: 'excellent' | 'good' | 'needsImprovement'
}

interface DatabaseConnection {
  client: any
  db: any
}

const gradingSchema = z.object({
  criteriaFeedback: z.array(z.object({
    criteria: z.string(),
    points: z.number(),
    feedback: z.string(),
    level: z.enum(['excellent', 'good', 'needsImprovement'])
  })),
  overallFeedback: z.string()
})

export async function getAssignments() {
  const { db } = await connectToDatabase() as DatabaseConnection
  const assignments = await db.collection('assignments').find({}).toArray()
  return assignments as Assignment[]
}

export async function getAssignmentInstructions() {
  const { db } = await connectToDatabase() as DatabaseConnection
  const instructions = await db.collection('assignments').find({}).toArray()
  return instructions
}

export async function gradeThesis(assignmentId: string, thesisText: string) {
  try {
    const { db } = await connectToDatabase() as DatabaseConnection

    // Get the assignment details
    const assignment = await db.collection('assignments').findOne({ _id: assignmentId })
    if (!assignment) {
      throw new Error('Assignment not found')
    }

    // Get the rubric criteria
    const rubric = (assignment.rubric || []) as RubricCriterion[]
    
    // Create a prompt for the LLM to evaluate the thesis
    const prompt = `
You are an expert writing instructor evaluating a thesis statement. Please evaluate the following thesis statement against each criterion in the rubric.

Thesis Statement:
${thesisText}

Rubric Criteria:
${rubric.map(c => `
Criterion: ${c.criteria}
Points: ${c.points}
Excellent: ${c.excellent}
Good: ${c.good}
Needs Improvement: ${c.needsImprovement}
`).join('\n')}

For each criterion, provide:
1. A level (excellent, good, or needsImprovement)
2. Points earned (full points for excellent, 80% for good, 40% for needsImprovement)
3. Specific feedback explaining the evaluation

Format your response as a JSON object with this structure:
{
  "criteriaFeedback": [
    {
      "criteria": "criterion name",
      "points": number,
      "feedback": "detailed feedback",
      "level": "excellent|good|needsImprovement"
    }
  ],
  "overallFeedback": "comprehensive feedback about the thesis as a whole"
}
`

    // Make the LLM call using Azure
    const result = await generateObject({
      model: azure('gpt-4'),
      messages: [
        {
          role: "system",
          content: "You are an expert writing instructor evaluating thesis statements. Provide detailed, constructive feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      schema: gradingSchema
    })

    return {
      overallFeedback: result.object.overallFeedback,
      criteriaFeedback: result.object.criteriaFeedback
    }
  } catch (error) {
    console.error('Error grading thesis:', error)
    throw new Error('Failed to grade thesis')
  }
} 