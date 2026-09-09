'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function BroadcastPage() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent?: number; failed?: number; error?: string } | null>(null)

  const supabase = createClient()

  const handleSend = async () => {
    if (!title.trim() || !text.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title, text }),
      })
      const data = await res.json()
      setResult(data)
      if (data.sent) {
        setTitle('')
        setText('')
      }
    } catch {
      setResult({ error: 'Ошибка отправки' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-xl sm:text-2xl font-bold mb-5 sm:mb-8">Рассылка в Telegram</h1>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Скидка 20% на тонировку"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Текст сообщения</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Текст промо-сообщения..."
            className="input w-full resize-none"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading || !title.trim() || !text.trim()}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {loading ? 'Отправка...' : 'Отправить рассылку'}
        </button>

        {result && (
          <div className={`flex items-start gap-2 rounded-xl p-4 text-sm ${result.error ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {result.error ? (
              <>
                <XCircle className="size-4 mt-0.5 shrink-0" />
                <span>{result.error}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>Отправлено: {result.sent}, Ошибок: {result.failed}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
