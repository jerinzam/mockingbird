'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Session = {
  id: number
  session_uuid: string
  created_at: string
  status: 'created' | 'in_progress' | 'completed' | 'cancelled'
  call_ended_reason: string | null
  call_started_time: string | null
  call_ended_time: string | null
  metadata: Record<string, any>
}

interface EntitySessionHistoryProps {
  entityId: number;
  orgId: string;
  onSessionClick?: (session: Session) => void;
}

export function EntitySessionHistory({ entityId, orgId, onSessionClick }: EntitySessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch(`/api/dashboard/org/${orgId}/entities/${entityId}/sessions`, {
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
  }, [entityId, orgId])

  if (loading) {
    return <p className="text-xs text-gray-500">Loading session history...</p>
  }

  if (sessions.length === 0) {
    return <p className="text-xs italic text-gray-400">No sessions yet.</p>
  }

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'in_progress':
        return 'text-blue-600'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return 'N/A'
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="space-y-2 text-xs">
      {sessions.map((session) => (
        <div
          key={session.session_uuid}
          className="border border-gray-300 rounded p-3 bg-white shadow-[2px_2px_0_#000] cursor-pointer hover:bg-gray-100"
          onClick={() => onSessionClick && onSessionClick(session)}
        >
          <div className="flex justify-between items-start">
            <div>
              <p><strong>Date:</strong> {new Date(session.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> <span className={getStatusColor(session.status)}>{session.status}</span></p>
              {session.call_started_time && (
                <p><strong>Duration:</strong> {formatDuration(session.call_started_time, session.call_ended_time)}</p>
              )}
            </div>
            <div className="text-right">
              <p><strong>Ended:</strong> {session.call_ended_reason ?? 'Unknown'}</p>
              <span className="text-blue-600 underline">View Session</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}