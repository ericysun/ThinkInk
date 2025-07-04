import { ObjectId } from 'mongodb'

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  instructions: string;
  order: number;
}

export interface Assignment {
  _id: string;
  title: string;
  goal: string;
  description?: string;
  estimatedTime?: number;
  systemPrompt: string;
  learningGoals: string[];
  examples: {
    strong1: { example: string; explanation: string };
    strong2: { example: string; explanation: string };
    weak1: { example: string; explanation: string };
    weak2: { example: string; explanation: string };
  };
  instructions: string;
  rubric: {
    criteria: string;
    points: number;
    excellent: string;
    good: string;
    needsImprovement: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EssayPrompt {
  _id: string;
  title: string;
  prompt: string;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  _id?: string;
  name: string;
  email: string;
  school: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  instructions: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
} 