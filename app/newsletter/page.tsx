'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart2, Zap, Mail, RefreshCw, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface Mover { symbol: string; price: string; change: string; direction: string }
interface Brief { date: string; content: string; movers: Mover[]; earningsCount: number; aiGenerated: boolean }

function toHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 style="font-size:24px;font-weight:900;text-transform:uppercase;color:#111827;margin:0 0 2px">$1</h2>')
    .replace(/^### (.+)$/gm, '<p style="color:#6b7280;font-size:13px;margin:0 0 16px">$1</p>')
    .replace(/^\*\*(.+)\*\*$/gm, '<h3 style="font-size:13px;font-weight:800;text-transform:uppercase;color:#1e3a5f;margin:20px 0 8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="font-size:14px;color:#374151;margin-bottom:6px">$1</li>')
    .replace(/^([^<\n].+)$/gm, '<p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 10px">$1</p>')
}

export default function NewsletterPage() {
  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subState, setSubState] = useState('idle')

  function load() {
    setLoading(true)
    fetch('/api/newsletter/generate')
      .then(r => r.json())
      .then(d => { setBrief(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function subscribe() {
    if (!email.includes('@')) return
    setSubState('loading')
    fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(r => setSubState(r.ok ? 'done' : 'error'))
      .catch(() => setSubState('error'))
  }

  return (
    <div className="min-h-screen" style={{ background: '#f7f8fa' }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: '#1e3a5f' }}>
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="font-black text-lg text-gray-900" style={{ fontFamily: "'Barlow Condensed'" }}>
              THE <span style={{ color: '#2563eb' }}>STOCK</span>411
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {([['/', 'Markets'], ['/earnings', 'Earnings'], ['/screener', 'Screener'], ['/newsletter', 'Daily Brief']] as [string, string][]).map(([h, l]) => (
              <Link key={h} href={h} className={'px-3 py-1.5 text-sm font-medium rounded transition-colors ' + (h === '/newsletter' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}>{l}</Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Daily Brief</span>
              {brief?.aiGenerated && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">AI</span>}
            </div>
            <h1 className="text-3xl font-black uppercase text-gray-900" style={{ fontFamily: "'Barlow Condensed'" }}>Market Intelligence</h1>
            <p className="text-sm text-gray-500 mt-0.5">{brief?.date ? new Date(brief.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Loading...'}</p>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 mt-1">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        {(brief?.movers || []).length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
            {brief!.movers.map(m => (
              <div key={m.symbol} className="flex-shrink-0 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm text-center min-w-[70px]">
                <div className="font-bold text-sm text-gray-900">{m.symbol}</div>
                <div className={'text-xs font-bold flex items-center justify-center gap-0.5 ' + (m.direction === 'up' ? 'text-emerald-600' : 'text-red-500')}>
                  {m.direction === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {m.direction === 'up' ? '+' : ''}{m.change}%
                </div>
                <div className="text-[11px] text-gray-500 font-mono">${m.price}</div>
              </div>
            ))}
            {(brief?.earningsCount || 0) > 0 && (
              <div className="flex-shrink-0 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center min-w-[70px]">
                <Calendar size={14} className="text-amber-600 mx-auto mb-0.5" />
                <div className="font-black text-xl text-amber-600" style={{ fontFamily: "'Barlow Condensed'" }}>{brief!.earningsCount}</div>
                <div className="text-[10px] text-amber-600 font-semibold uppercase">Earnings</div>
              </div>
            )}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-5">
          {loading ? (
            <div className="space-y-3 animate-pulse">{[...Array(8)].map((_, i) => (
              <div key={i} className={'h-4 rounded bg-gray-100 ' + (i % 3 === 0 ? 'w-1/3' : i % 2 === 0 ? 'w-full' : 'w-4/5')} />
            ))}</div>
          ) : brief?.content ? (
            <div dangerouslySetInnerHTML={{ __html: toHtml(brief.content) }} />
          ) : (
            <p className="text-center text-gray-400 py-8">Could not load brief. Check FINNHUB_API_KEY in Vercel.</p>
          )}
        </div>
        <div className="rounded-2xl p-6 border" style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', borderColor: '#2563eb' }}>
          <div className="flex items-center gap-2 mb-1">
            <Mail size={15} className="text-yellow-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Free Newsletter</span>
          </div>
          <h3 className="font-black text-xl text-white mb-1" style={{ fontFamily: "'Barlow Condensed'" }}>Get This Every Morning at 7 AM ET</h3>
          <p className="text-sm text-blue-200 mb-4">AI-powered pre-market brief with top movers, earnings previews, and key levels.</p>
          {subState === 'done' ? (
            <div className="flex items-center gap-2 text-yellow-300 font-bold text-sm"><Zap size={14} />You are in! Look for tomorrow.</div>
          ) : (
            <div className="flex gap-2">
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && subscribe()}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none" />
              <button onClick={subscribe} disabled={subState === 'loading'}
                className="px-5 py-2 text-sm font-bold rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-300 disabled:opacity-50">
                {subState === 'loading' ? '...' : 'Subscribe'}
              </button>
            </div>
          )}
          {subState === 'error' && <p className="text-red-300 text-xs mt-2">Something went wrong. Try again.</p>}
        </div>
      </main>
    </div>
  )
}