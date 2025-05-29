import Link from 'next/link'
import Image from 'next/image'
import { getEssays, getAssignments } from '@/app/actions'
import { EssayPrompt, Assignment } from '@/types/db'
import { formatDate } from '@/lib/utils'

export default async function AdminPage() {
  const [essays, assignments] = await Promise.all([
    getEssays(),
    getAssignments()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <Image
                src="/ThinkInk.png"
                alt="ThinkInk Logo"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
              <h1 className="text-3xl font-bold">ThinkInk Admin</h1>
            </Link>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <Link
                href="/"
                className="text-green-600 hover:text-green-700 flex items-center gap-2 mb-2"
              >
                ← Back to Home
              </Link>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/create"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create New Assignment
              </Link>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Assignments</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="p-6 bg-white rounded-lg shadow-md border border-green-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">{assignment.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{assignment.goal}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    Last updated: {formatDate(assignment.updatedAt)}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/edit/${assignment._id}`}
                      className="px-3 py-1 text-green-600 hover:text-green-700"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No assignments created yet. Click "Create New Assignment" to get started.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
} 