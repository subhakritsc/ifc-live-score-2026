'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Comment } from '@/lib/types'
import { MessageCircle, Send, Loader2, RefreshCw } from 'lucide-react'

function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(diffMs / 3_600_000)
  const days = Math.floor(diffMs / 86_400_000)

  if (minutes < 1) return 'เมื่อสักครู่'
  if (minutes < 60) return `${minutes} นาที`
  if (hours < 24) return `${hours} ชม.`
  return `${days} วัน`
}

interface CommentSectionProps {
  comments: Comment[]
  onPost: (comment: string) => Promise<void>
  onRefresh: () => Promise<void>
}

export function CommentSection({ comments, onPost, onRefresh }: CommentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [text, setText] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const hasComments = comments.length > 0

  const handleSubmit = async () => {
    if (!text.trim() || isPosting) return
    setIsPosting(true)
    try {
      await onPost(text.trim())
      setText('')
      setIsExpanded(true)
    } catch {
      // silently fail — user sees the comment didn't appear
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      {/* Toggle + Refresh */}
      <div className="flex items-center justify-between mb-2">
        {hasComments ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle size={14} />
            <span>
              {isExpanded ? 'ซ่อนความคิดเห็น' : `ดูความคิดเห็น (${comments.length})`}
            </span>
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={async () => {
            setIsRefreshing(true)
            try { await onRefresh() } finally { setIsRefreshing(false) }
          }}
          disabled={isRefreshing}
          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="รีเฟรชความคิดเห็น"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Comment list */}
      {isExpanded && hasComments && (
        <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto">
          {comments
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((c, i) => (
              <div
                key={`${c.timestamp}-${i}`}
                className="flex items-start justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/50"
              >
                <p className="text-sm text-foreground break-words min-w-0 flex-1">
                  {c.comment}
                </p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 pt-0.5">
                  {formatRelativeTime(c.timestamp)}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="พิมพ์ความคิดเห็น..."
          maxLength={280}
          disabled={isPosting}
          className={cn(
            'flex-1 min-w-0 px-3 py-2 rounded-lg text-sm',
            'bg-secondary border border-border',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
            'disabled:opacity-50'
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isPosting}
          className={cn(
            'shrink-0 p-2 rounded-lg transition-colors',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="ส่งความคิดเห็น"
        >
          {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
