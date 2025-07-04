import { EssayPrompt } from '@/types/db'
import Link from 'next/link'

async function getEssay(id: string) {
	const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  const res = await fetch(`/api/essays/${id}`, {
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to fetch essay')
  return res.json()
}

export default async function LessonPage({ params }: { params: { id: string } }) {
  const essay: EssayPrompt = await getEssay(params.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/admin"
            className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
          <Link
            href={`/admin/edit/${params.id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Edit Essay Prompt
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{essay.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm ${
              essay.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {essay.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {essay.type}
            </span>
            {essay.gradeLevel && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {essay.gradeLevel}
              </span>
            )}
            {essay.estimatedTime && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {essay.estimatedTime} minutes
              </span>
            )}
            {essay.wordCount && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {essay.wordCount.min}-{essay.wordCount.max} words
              </span>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 mb-6">{essay.description}</p>

            <h2 className="text-xl font-semibold mb-2">Context</h2>
            <p className="text-gray-700 mb-6">{essay.context}</p>

            {essay.requirements.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-2">Requirements</h2>
                <ul className="list-disc pl-6 mb-6">
                  {essay.requirements.map((req, index) => (
                    <li key={index} className="text-gray-700">{req}</li>
                  ))}
                </ul>
              </>
            )}

            {essay.rubric && essay.rubric.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-2">Rubric</h2>
                <div className="space-y-4 mb-6">
                  {essay.rubric.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{item.criteria}</h3>
                        <span className="text-sm font-medium">{item.points} points</span>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h2 className="text-xl font-semibold mb-2">Sources</h2>
            <div className="space-y-4">
              {essay.sources.map((source) => (
                <div key={source.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{source.title}</h3>
                    <span className="text-sm px-2 py-1 bg-gray-200 rounded">
                      {source.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{source.content}</p>
                  <div className="text-sm text-gray-500">
                    <p>Source: {source.source}</p>
                    {source.date && <p>Date: {source.date}</p>}
                    {source.citation && <p>Citation: {source.citation}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 