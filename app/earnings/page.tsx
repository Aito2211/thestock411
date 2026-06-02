'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { BarChart2, Calendar, Star, Zap, ChevronLeft, ChevronRight } from 'lucide-react'

interface E { symbol:string; name:string; date:string; time:string; epsEstimate:number|null; epsActual:number|null; surprise:number|null; mktCap:string; sector:string; status:string }

const DAYS=['Mon','Tue','Wed','Thu','Fri']
const MOS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const SC: Record<string,string> = { Technology:'#58a6ff', Financials:'#3fb950', Healthcare:'#a371f7', 'Consumer Disc.':'#f0883e', Energy:'#d29922', Industrials:'#58a6ff' }

function sc(s: number|null) { if(s===null)return'#7d8590'; if(s>5)return'#3fb950'; if(s>0)return'#8bc34a'; if(s>-5)return'#f0883e'; return'#f85149' }

function TTag({ t }: { t: string }) {
  const cfg: Record<string,{l:string,col:string,bg:string}> = {
    BMO:{l:'Pre-Mkt',col:'#e3b341',bg:'rgba(227,179,65,0.12)'},
    AMC:{l:'After Close',col:'#f0883e',bg:'rgba(240,136,62,0.12)'},
    TAS:{l:'TBD',col:'#7d8590',bg:'rgba(125,133,144,0.12)'}
  }
  const c = cfg[t] || {l:t,col:'#7d8590',bg:'rgba(125,133,144,0.12)'}
  return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" style={{color:c.col,background:c.bg}}>{c.l}</span>
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<E[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekStart, setWeekStart] = useState('')
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/earnings?week=${weekOffset}`)
      const d = await r.json()
      setEarnings(d.earnings || [])
      setWeekStart(d.weekStart || '')
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [weekOffset])

  useEffect(() => { load() }, [load])

  const byDate: Record<string, E[]> = {}
  if (weekStart) {
    for (let i = 0; i < 5; i++) {
      const d = new Date(weekStart + 'T12:00:00')
      d.setDate(d.getDate() + i)
      byDate[d.toISOString().split('T')[0]] = []
    }
  }
  earnings.forEach(e => { if (byDate[e.date]) byDate[e.date].push(e) })

  function wLabel() {
    if (!weekStart) return ''
    const d = new Date(weekStart + 'T12:00:00')
    const e = new Date(d); e.setDate(d.getDate() + 4)
    return `${MOS[d.getMonth()]} ${d.getDate()} - ${MOS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
  }

  const beat = earnings.filter(e => e.surprise !== null && e.surprise > 0).length
  const miss = earnings.filter(e => e.surprise !== null && e.surprise < 0).length

  return (
    <div className="min-h-screen" style={{background:'#080c10'}}>
      <header style={{background:'#0d1117',borderBottom:'1px solid #1c2430'}}>
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{background:'linear-gradient(135deg,#3fb950,#1a7f37)'}}><BarChart2 size={16} className="text-white"/></div>
            <span className="font-black text-lg" style={{fontFamily:"'Barlow Condensed'"}}>THE <span style={{color:'#3fb950'}}>STOCK</span>411</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {([['/', 'Markets'],['/earnings','Earnings'],['/screener','Screener']] as [string,string][]).map(([h,l])=>(
              <Link key={h} href={h} className={`px-3 py-1.5 text-sm rounded transition-colors ${h==='/earnings'?'text-white bg-white/8':'text-gray-400 hover:text-white hover:bg-white/5'}`}>{l}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black uppercase" style={{fontFamily:"'Barlow Condensed'"}}><Calendar size={22} className="inline mr-2 text-amber-400"/>Earnings Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">EPS estimates, actuals and surprise data</p>
          </div>
          <div className="flex gap-3">
            {([[beat,'Beat','rgba(63,185,80,0.1)','rgba(63,185,80,0.3)','text-green-400'],[miss,'Miss','rgba(248,81,73,0.1)','rgba(248,81,73,0.3)','text-red-400'],[earnings.length,'Total','#0d1117','#1c2430','text-white']] as [number,string,string,string,string][]).map(([v,l,bg,bd,tc])=>(
              <div key={l} className="px-4 py-2 rounded-lg text-center" style={{background:bg,border:`1px solid ${bd}`}}>
                <div className={`text-lg font-black ${tc}`} style={{fontFamily:"'Barlow Condensed'"}}>{v}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{background:'#0d1117',border:'1px solid #1c2430'}}>
            <button onClick={()=>setWeekOffset(w=>w-1)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"><ChevronLeft size={16}/></button>
            <span className="text-sm font-semibold px-2 min-w-[200px] text-center">{wLabel()}</span>
            <button onClick={()=>setWeekOffset(w=>w+1)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"><ChevronRight size={16}/></button>
          </div>
          <button onClick={()=>setWeekOffset(0)} className="px-3 py-2 text-sm rounded-lg font-semibold" style={{background:'#161b22',border:'1px solid #30363d',color:'#7d8590'}}>This Week</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4">
          {loading ? Array.from({length:5}).map((_,i)=>(
            <div key={i} className="flex-1 min-w-[180px] h-64 rounded-lg animate-pulse" style={{background:'#0d1117'}}/>
          )) : Object.entries(byDate).map(([date, entries]) => {
            const d = new Date(date + 'T12:00:00')
            const isToday = date === today
            const bmo = entries.filter(e=>e.time==='BMO')
            const amc = entries.filter(e=>e.time==='AMC')
            return (
              <div key={date} className="flex-1 min-w-[180px]">
                <div className="text-center py-3 px-2 rounded-t-lg" style={{background:isToday?'rgba(63,185,80,0.12)':'#0d1117',border:`1px solid ${isToday?'#3fb950':'#1c2430'}`,borderBottom:'none'}}>
                  <div className="text-xs font-bold uppercase tracking-widest" style={{color:isToday?'#3fb950':'#7d8590'}}>{DAYS[d.getDay()-1]}</div>
                  <div className={`text-lg font-black ${isToday?'text-green-400':'text-gray-200'}`} style={{fontFamily:"'Barlow Condensed'"}}>{MOS[d.getMonth()]} {d.getDate()}</div>
                  {isToday && <div className="text-[10px] text-green-400 font-bold uppercase">Today</div>}
                  <div className="text-[11px] text-gray-500 mt-1">{entries.length} reports</div>
                </div>
                <div style={{border:`1px solid ${isToday?'#2d4a2d':'#1c2430'}`,borderRadius:'0 0 8px 8px',overflow:'hidden'}}>
                  {bmo.length > 0 && <>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase text-amber-400" style={{background:'rgba(227,179,65,0.06)',borderBottom:'1px solid #1c2430'}}>Pre-Market</div>
                    {bmo.map(e=>(
                      <div key={e.symbol} className="px-3 py-2 border-b border-[#1c2430] hover:bg-[#1c2430]/40 cursor-pointer">
                        <div className="flex justify-between">
                          <span className="font-bold text-sm" style={{fontFamily:"'IBM Plex Mono'"}}>{e.symbol}</span>
                          {e.status==='reported'&&e.surprise!==null ? <span className="text-xs font-bold" style={{color:sc(e.surprise)}}>{e.surprise>0?'+':''}{e.surprise.toFixed(1)}%</span> : <span className="text-[10px] px-1 py-0.5 rounded text-gray-400" style={{background:'#161b22'}}>Est ${e.epsEstimate?.toFixed(2)}</span>}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">{e.name}</div>
                      </div>
                    ))}
                  </>}
                  {amc.length > 0 && <>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase text-orange-400" style={{background:'rgba(240,136,62,0.06)',borderBottom:'1px solid #1c2430',borderTop:bmo.length?'1px solid #1c2430':'none'}}>After Close</div>
                    {amc.map(e=>(
                      <div key={e.symbol} className="px-3 py-2 border-b border-[#1c2430] hover:bg-[#1c2430]/40 cursor-pointer">
                        <div className="flex justify-between">
                          <span className="font-bold text-sm" style={{fontFamily:"'IBM Plex Mono'"}}>{e.symbol}</span>
                          {e.status==='reported'&&e.surprise!==null ? <span className="text-xs font-bold" style={{color:sc(e.surprise)}}>{e.surprise>0?'+':''}{e.surprise.toFixed(1)}%</span> : <span className="text-[10px] px-1 py-0.5 rounded text-gray-400" style={{background:'#161b22'}}>Est ${e.epsEstimate?.toFixed(2)}</span>}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">{e.name}</div>
                      </div>
                    ))}
                  </>}
                  {entries.length === 0 && <div className="px-3 py-6 text-center text-gray-600 text-sm">No reports</div>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{background:'linear-gradient(135deg,#0d1117,#0f1f0f)',border:'1px solid #2d4a2d'}}>
          <div>
            <div className="flex items-center gap-2 mb-1"><Zap size={16} className="text-green-400"/><span className="text-xs font-bold uppercase tracking-widest text-green-400">Stock411 Pro - Coming Soon</span></div>
            <h3 className="text-xl font-black mb-1" style={{fontFamily:"'Barlow Condensed'"}}>Earnings Alerts and AI Analysis</h3>
            <p className="text-sm text-gray-400">Get notified 30 min before reports with AI earnings preview and options flow.</p>
          </div>
          <button className="px-6 py-3 rounded-xl font-bold text-sm" style={{background:'linear-gradient(135deg,#3fb950,#1a7f37)',color:'#000'}}>Join Waitlist</button>
        </div>
      </div>
    </div>
  )
}
