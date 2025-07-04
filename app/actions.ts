'use server'

import { EssayPrompt, Assignment, Lesson } from '@/types/db'
import { connectToDatabase } from '@/lib/db'
import { generateText, generateObject, streamText } from 'ai'
import { azure } from '@ai-sdk/azure'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

export async function getEssays(): Promise<EssayPrompt[]> {
  const { db } = await connectToDatabase()
  const essays = await db.collection('essays').find({}).toArray()
  return essays.map(essay => ({
    _id: essay._id.toString(),
    title: essay.title,
    prompt: essay.prompt,
    documents: essay.documents,
    createdAt: essay.createdAt,
    updatedAt: essay.updatedAt
  })) as EssayPrompt[]
}

export async function getEssay(id: string): Promise<EssayPrompt | null> {
  const { db } = await connectToDatabase()
  const result = await db.collection('essays').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  
  if (!result?.value) return null
  
  const essay = result.value
  return {
    _id: essay._id.toString(),
    title: essay.title,
    prompt: essay.prompt,
    documents: essay.documents,
    createdAt: essay.createdAt,
    updatedAt: essay.updatedAt
  } as EssayPrompt
}

export async function createEssay(data: Omit<EssayPrompt, '_id'>): Promise<EssayPrompt> {
  const { db } = await connectToDatabase()
  const result = await db.collection('essays').insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  return {
    _id: result.insertedId.toString(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export async function updateEssay(id: string, data: Partial<EssayPrompt>): Promise<EssayPrompt | null> {
  const { db } = await connectToDatabase()
  const result = await db.collection('essays').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...data,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  )
  
  return result.value as EssayPrompt | null
}

export async function deleteEssay(id: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  const result = await db.collection('essays').deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function getAssignments(): Promise<Assignment[]> {
  const { db } = await connectToDatabase()
  const assignments = await db.collection('assignments').find({}).toArray()
  return assignments.map(assignment => ({
    _id: assignment._id.toString(),
    title: assignment.title,
    goal: assignment.goal,
    examples: assignment.examples || {
      strong1: { example: "", explanation: "" },
      strong2: { example: "", explanation: "" },
      weak1: { example: "", explanation: "" },
      weak2: { example: "", explanation: "" }
    },
    rubric: assignment.rubric || [],
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt
  })) as Assignment[]
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  const { db } = await connectToDatabase()
  
  try {
    const assignment = await db.collection('assignments').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    
    if (!assignment) {
      return null
    }
    
    
    // Handle migration from  to instructions and rubric
    let rubric = assignment.rubric || []
    
    return {
      _id: assignment._id.toString(),
      title: assignment.title,
      goal: assignment.goal,
      examples: assignment.examples || {
        strong1: { example: "", explanation: "" },
        strong2: { example: "", explanation: "" },
        weak1: { example: "", explanation: "" },
        weak2: { example: "", explanation: "" }
      },
      rubric,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt
    } as Assignment
  } catch (error) {
    console.error('Error in getAssignment:', error)
    throw error
  }
}

export async function createAssignment(data: Omit<Assignment, '_id'>): Promise<Assignment> {
  const { db } = await connectToDatabase()
  const result = await db.collection('assignments').insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  return {
    _id: result.insertedId.toString(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export async function updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment | null> {
  const { db } = await connectToDatabase()
  const result = await db.collection('assignments').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...data,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  )
  
  return result.value as Assignment | null
}

export async function deleteAssignment(id: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  const result = await db.collection('assignments').deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function generateDetailedInstructions(
  title: string, 
  goal: string,
  examples: {
    strong1: { example: string; explanation: string };
    strong2: { example: string; explanation: string };
    weak1: { example: string; explanation: string };
    weak2: { example: string; explanation: string };
  }
): Promise<{
  instructions: string;
  rubric: {
    criteria: string;
    points: number;
    excellent: string;
    good: string;
    needsImprovement: string;
  }[];
}> {
  const prompt = `Generate a few sentences of instructions and a rubric for an assignment with the following details:
  
  Title: ${title}
  Goal: ${goal}
  
  Strong Examples:
  1. ${examples.strong1.example}
     Explanation: ${examples.strong1.explanation}
  2. ${examples.strong2.example}
     Explanation: ${examples.strong2.explanation}
  
  Weak Examples:
  1. ${examples.weak1.example}
     Explanation: ${examples.weak1.explanation}
  2. ${examples.weak2.example}
     Explanation: ${examples.weak2.explanation}
  
  Generate:
  1. A few instructions that break down the assignment. Output the instructions to help the student complete the assignment. Do not restate the title and goal.
  2. A comprehensive rubric that:
     - Identifies key skills and criteria to be evaluated
     - Assigns point values to each criterion
     - Provides clear descriptions for Excellent (4-5 points), Good (2-3 points), and Needs Improvement (0-1 points) levels
     - Total points should be 20
     - Include 4-5 key criteria that align with the strong and weak examples`

  const { object } = await generateObject({
    model: azure('o3-mini'),
    schema: z.object({
      instructions: z.string().describe("Detailed instructions for the assignment, including steps and guidance"),
      rubric: z.array(z.object({
        criteria: z.string().describe("The specific skill or criterion being evaluated"),
        points: z.number().describe("Maximum points for this criterion (should sum to 20)"),
        excellent: z.string().describe("Description of excellent performance (4-5 points)"),
        good: z.string().describe("Description of good performance (2-3 points)"),
        needsImprovement: z.string().describe("Description of needs improvement (0-1 points)")
      }))
    }),
    system: "You are an expert teacher creating detailed instructions and a rubric. Your goal is to help students understand exactly what they need to do and how they will be evaluated. Use the provided examples to inform your rubric criteria.",
    prompt,
  })

  return object
}

export async function generateGraderPrompt(title: string, goal: string): Promise<string> {
  const prompt = `Generate an AI grader prompt for an assignment with the following details:
  
  Title: ${title}
  Goal: ${goal}
  
  The grader prompt should:
  1. Define clear success criteria for the assignment
  2. Specify what aspects to evaluate
  3. Include rubrics for different levels of achievement
  4. Provide guidance on how to give constructive feedback
  5. Consider both content and technical aspects`

  const { object } = await generateObject({
    model: azure('o3-mini'),
    schema: z.object({
      graderPrompt: z.string().describe("AI grader prompt that defines success criteria, evaluation aspects, and rubrics")
    }),
    system: "You are an expert teacher creating an AI grader prompt. Your goal is to help the AI provide accurate, constructive, and helpful feedback to students.",
    prompt,
  })

  return object.graderPrompt
}

export async function generateExamples(title: string, goal: string): Promise<{
  strong1: { example: string; explanation: string };
  strong2: { example: string; explanation: string };
  weak1: { example: string; explanation: string };
  weak2: { example: string; explanation: string };
}> {
  const prompt = `Generate examples for an assignment with the following details:
  
  Title: ${title}
  Goal: ${goal}
  
  Generate:
  1. Two strong examples that demonstrate excellence
  2. Two weak examples that show common mistakes
  3. For each example, provide a brief explanation of why it is strong or weak`

  const { object } = await generateObject({
    model: azure('o3-mini'),
    schema: z.object({
      strong1: z.object({
        example: z.string().describe("First strong example that demonstrates excellence"),
        explanation: z.string().describe("Explanation of why this example is strong")
      }),
      strong2: z.object({
        example: z.string().describe("Second strong example that demonstrates excellence"),
        explanation: z.string().describe("Explanation of why this example is strong")
      }),
      weak1: z.object({
        example: z.string().describe("First weak example that shows common mistakes"),
        explanation: z.string().describe("Explanation of why this example is weak")
      }),
      weak2: z.object({
        example: z.string().describe("Second weak example that shows common mistakes"),
        explanation: z.string().describe("Explanation of why this example is weak")
      })
    }),
    system: "You are an expert teacher creating examples to help students understand what makes a good response. Be specific and constructive in your explanations.",
    prompt,
  })

  return object
}

export async function gradeAssignment(
  assignmentId: string,
  submission: string
): Promise<{
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
}> {
	console.log("GRADE ASSIGNMENT")
  try {
    const assignment = await getAssignment(assignmentId)
    if (!assignment) {
      throw new Error(`Assignment not found with id ${assignmentId}`)
    }

    if (!assignment.rubric) {
      throw new Error('Assignment has no rubric')
    }

    // Grade each criterion
    const criteriaResults = await Promise.all(
      assignment.rubric.map(async criterion => {
        const result = await generateObject({
          model: azure('o3-mini'),
          schema: z.object({
            points: z.number().describe("Points awarded for this criterion"),
            feedback: z.string().describe("Detailed feedback for this criterion"),
            level: z.enum(['excellent', 'good', 'needsImprovement']).describe("The level achieved for this criterion")
          }),
          system: "You are an expert teacher providing detailed, constructive feedback on student work. Be encouraging while pointing out specific areas for improvement. Use the rubric to provide clear, actionable feedback.",
          prompt: `Evaluate the following submission against this specific criterion:

Assignment: ${assignment.title}
Assignment Goal: ${assignment.goal}

Criterion: ${criterion.criteria}
Points Available: ${criterion.points}
Excellent Level: ${criterion.excellent}
Good Level: ${criterion.good}
Needs Improvement Level: ${criterion.needsImprovement}

Student Submission:
${submission}

Provide:
1. A level (excellent, good, or needsImprovement)
2. Points earned (full points for excellent, 80% for good, 40% for needsImprovement)
3. Specific feedback explaining the evaluation and suggesting improvements`
        })

        return {
          criteria: criterion.criteria,
          ...result.object
        }
      })
    )

    // Generate overall feedback
    const overallResult = await generateObject({
      model: azure('o3-mini'),
      schema: z.object({
        overallFeedback: z.string().describe("Overall feedback on the submission, highlighting strengths and areas for improvement")
      }),
      system: "You are an expert teacher providing detailed, constructive feedback on student work. Be encouraging while pointing out specific areas for improvement.",
      prompt: `Provide overall feedback on the following submission:

Assignment: ${assignment.title}
Assignment Goal: ${assignment.goal}

Student Submission:
${submission}

Consider:
1. Overall strength of the work
2. Clarity and coherence
3. Accuracy and completeness
4. Areas for improvement
5. Specific suggestions for enhancement`
    })

    // Generate text annotations
    const annotationsResult = await generateObject({
      model: azure('o3-mini'),
      schema: z.object({
        annotations: z.array(z.object({
          text: z.string().describe("The specific text being annotated"),
          type: z.enum(['positive', 'negative']).describe("Whether this is a positive or negative annotation"),
          comment: z.string().describe("The feedback comment for this text")
        }))
      }),
      system: "You are an expert teacher providing detailed annotations on student work. Highlight specific parts of the text that are particularly good or need improvement. Be specific and constructive in your comments.",
      prompt: `Analyze the following submission and provide specific annotations:

Assignment: ${assignment.title}
Assignment Goal: ${assignment.goal}

Student Submission:
${submission}

For each annotation:
1. Select a specific piece of text (phrase or sentence)
2. Mark it as positive (green) if it's particularly good, or negative (red) if it needs improvement
3. Provide a brief, constructive comment explaining why it's good or how it could be improved

Focus on:
- Clarity and coherence
- Use of evidence
- Analysis and reasoning
- Writing style and mechanics
- Alignment with the assignment goals`
    })

	console.log("all done!")
	console.log(overallResult.object.overallFeedback)
	console.log(criteriaResults)
    return {
      overallFeedback: overallResult.object.overallFeedback,
      criteriaFeedback: criteriaResults,
      annotations: annotationsResult.object.annotations
    }
  } catch (error) {
    console.error('Error in gradeAssignment:', error)
    throw error
  }
}

export async function getAssignmentInstructions(): Promise<{
  _id: string;
  title: string;
  instructions: string;
  goal: string;
  placeholder: string;
  examples?: {
    strong1: { example: string; explanation: string };
    strong2: { example: string; explanation: string };
    weak1: { example: string; explanation: string };
    weak2: { example: string; explanation: string };
  };
  rubric?: {
    criteria: string;
    points: number;
    excellent: string;
    good: string;
    needsImprovement: string;
  }[];
}[]> {
  const { db } = await connectToDatabase()
  const assignments = await db.collection('assignments').find({}).sort({ order: 1 }).toArray()
  
  return assignments.map(assignment => ({
    _id: assignment._id.toString(),
    title: assignment.title,
    instructions: assignment.instructions || "",
    goal: assignment.goal || "",
    placeholder: `Write your response for ${assignment.title.toLowerCase()}...`,
    examples: assignment.examples || undefined,
    rubric: assignment.rubric || undefined
  }))
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const { db } = await connectToDatabase()
  const result = await db.collection('lessons').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  
  if (!result?.value) return null
  
  const lesson = result.value
  return {
    _id: lesson._id.toString(),
    title: lesson.title,
    description: lesson.description,
    instructions: lesson.instructions,
    order: lesson.order,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt
  } as Lesson
}

export async function updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson | null> {
  const { db } = await connectToDatabase()
  const result = await db.collection('lessons').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...data,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  )
  
  if (!result?.value) return null
  
  const lesson = result.value
  return {
    _id: lesson._id.toString(),
    title: lesson.title,
    description: lesson.description,
    instructions: lesson.instructions,
    order: lesson.order,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt
  } as Lesson
}

export async function deleteLesson(id: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  const result = await db.collection('lessons').deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function chat(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): Promise<Response> {
  const systemPrompt = `
  You are an enthusiastic, encouraging teacher helping a student master their assignments.
  
  Your role is to:
  1. Guide the student through the assignment process with ENTHUSIASM and ENCOURAGEMENT
  2. Provide constructive feedback on their work
  3. Help them understand how to analyze and complete assignments effectively
  4. Explain concepts and connections between ideas
  5. Teach them how to craft well-supported responses
  
  Your personality:
  - ENTHUSIASTIC and ENCOURAGING - use emojis, exclamation points
  - Friendly and supportive - celebrate small wins
  - Engaging - ask questions to prompt deeper thinking
  - Motivational - frame challenges as opportunities
  
  You should be knowledgeable about:
  - The subject matter of the assignment
  - Assignment requirements and rubrics
  - Critical thinking skills
  - Analysis techniques
  
  Keep your responses concise, accurate, and focused on improving their assignment completion skills.
  
  IMPORTANT: Use emojis, enthusiastic language, and encouraging phrases. Make learning fun!
`

  const result = streamText({
    model: azure('gpt-4'),
    messages,
    system: systemPrompt,
  })

  return result.toDataStreamResponse()
}

export async function generateLearningGoals(title: string, goal: string): Promise<string[]> {
  const prompt = `Generate 3-4 specific learning goals for an assignment with the following details:
  
  Title: ${title}
  Goal: ${goal}
  
  The learning goals should:
  1. Be specific and measurable
  2. Focus on key skills and knowledge to be gained
  3. Align with the assignment's overall goal
  4. Be clear and concise`

  const { object } = await generateObject({
    model: azure('o3-mini'),
    schema: z.object({
      learningGoals: z.array(z.string().describe("A specific learning goal for the assignment"))
    }),
    system: "You are an expert teacher creating learning goals. Your goal is to help students understand exactly what they will learn from completing this assignment.",
    prompt,
  })

  return object.learningGoals
}

export async function generateSystemPrompt(title: string, goal: string): Promise<string> {
  const prompt = `Generate a system prompt for an AI tutor that will help students with an assignment with the following details:
  
  Title: ${title}
  Goal: ${goal}
  
  The system prompt should:
  1. Define the AI tutor's role and personality
  2. Specify how the tutor should interact with students
  3. Include guidance on providing feedback
  4. Set expectations for the tutoring process
  5. Emphasize the importance of the assignment's goal`

  const { object } = await generateObject({
    model: azure('o3-mini'),
    schema: z.object({
      systemPrompt: z.string().describe("System prompt that defines the AI tutor's role and behavior")
    }),
    system: "You are an expert teacher creating a system prompt for an AI tutor. Your goal is to help the AI provide effective, engaging, and supportive tutoring.",
    prompt,
  })

  return object.systemPrompt
} 