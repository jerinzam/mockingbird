// components/interview/InterviewSessionHistory.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Session = {
  id: string
  created_at: string
  call_ended_reason: string | null
}

export function InterviewSessionHistory({ interviewId }: { interviewId: number }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch(`/api/interview/${interviewId}/sessions`, {
          method: 'GET',
          credentials: 'include',
        })

        if (!res.ok) throw new Error('Failed to fetch sessions')
        const data = await res.json()
        setSessions(data)
      } catch (err) {
        console.error('Error loading sessions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [interviewId])

  if (loading) {
    return <p className="text-xs text-gray-500">Loading session history...</p>
  }

  if (sessions.length === 0) {
    return <p className="text-xs italic text-gray-400">No sessions yet.</p>
  }

  return (
    <div className="space-y-2 text-xs">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="border border-gray-300 rounded p-3 bg-white shadow-[2px_2px_0_#000]"
        >
          <p><strong>Date:</strong> {new Date(session.created_at).toLocaleString()}</p>
          <p><strong>Ended:</strong> {session.call_ended_reason ?? 'Unknown'}</p>
          <Link
            href={`/interview/${interviewId}/session/${session.id}/review`}
            className="text-blue-600 underline"
          >
            View Session
          </Link>
        </div>
      ))}
    </div>
  )
}
