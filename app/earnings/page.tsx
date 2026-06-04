'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { BarChart2, Calendar, Zap, ChevronLeft, ChevronRight } from 'lucide-react'

interface E { symbol:string; name:string; date:string; time:string; epsEstimate:number|null; epsActual:number|null; surprise:number|null; mktCap:string; sector:string; status:string }

const DAYS=['Mon','Tue','Wed','Thu','Fri']
const MOS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function sc(s: number|null) {
  if(s===null)return'#9ca3af'
  if(s>5)return'#059669'
  if(s>0)return'#10b981'
  if(s>-5)return'#f59e0b'
  return'#ef4444'
}

export default function EarningsPage() {
  const [earnings,setEarnings]=useState<E[]>([])
  const [weekOffset,setWeekOffset]=useState(0)
  const [weekStart,setWeekStart]=useState('')
  const [loading,setLoading]=useState(true)
  const today=new Date().toISOString().split('T')[0]

  const load=useCallback(async()=>{
    setLoading(true)
    try {
      const r=await fetch('/api/earnings?week='+weekOffset)
      const d=await r.json()
      setEarnings(d.earnings||[])
      setWeekStart(d.weekStart||'')
    }catch(e){console.error(e)}finally{setLoading(false)}
  },[weekOffset])

  useEffect(()=>{load()},[load])

  const byDate: Record<string,E[]>={}
  if(weekStart){for(let i=0;i<5;i++){const d=new Date(weekStart+'T12:00:00');d.setDate(d.getDate()+i);byDate[d.toISOString().split('T')[0]]=[]}}
  earnings.forEach(e=>{if(byDate[e.date])byDate[e.date].push(e)})

  function wLabel(){
    if(!weekStart)return''
    const d=new Date(weekStart+'T12:00:00')
    const e=new Date(d);e.setDate(d.getDate()+4)
    return MOS[d.getMonth()]+' '+d.getDate()+' - '+MOS[e.getMonth()]+' '+e.getDate()+', '+e.getFullYear()
  }

  const beat=earnings.filter(e=>e.surprise!==null&&e.surprise>0).length
  const miss=earnings.filter(e=>e.surprise!==null&&e.surprise<0).length

  return (
    <div className="min-h-screen" style={{background:'#f7f8fa'}}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{background:'#1e3a5f'}}><BarChart2 size={16} className="text-white"/></div>
            <span className="font-black text-lg text-gray-900" style={{fontFamily:"'Barlow Condensed'"}}>THE <span style={{color:'#2563eb'}}>STOCK</span>411</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {([['/', 'Markets'],['/earnings','Earnings'],['/screener','Screener']] as [string,string][]).map(([h,l])=>(
              <Link key={h} href={h} className={"px-3 py-1.5 text-sm font-medium rounded transition-colors "+(h==='/earnings'?'text-blue-600 bg-blue-50':'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}>{l}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black uppercase text-gray-900" style={{fontFamily:"'Barlow Condensed'"}}><Calendar size={22} className="inline mr-2 text-amber-500"/>Earnings Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">EPS estimates, actuals and surprise data</p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl text-center bg-emerald-50 border border-emerald-200">
              <div className="text-lg font-black text-emerald-600">{beat}</div>
              <div className="text-[10px] text-gray-500 uppercase font-semibold">Beat</div>
            </div>
            <div className="px-4 py-2 rounded-xl text-center bg-red-50 border border-red-200">
              <div className="text-lg font-black text-red-500">{miss}</div>
              <div className="text-[10px] text-gray-500 uppercase font-semibold">Miss</div>
            </div>
            <div className="px-4 py-2 rounded-xl text-center bg-white border border-gray-200">
              <div className="text-lg font-black text-gray-800">{earnings.length}</div>
              <div className="text-[10px] text-gray-500 uppercase font-semibold">Total</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
            <button onClick={()=>setWeekOffset(w=>w-1)} className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800"><ChevronLeft size={16}/></button>
            <span className="text-sm font-semibold px-2 min-w-[200px] text-center text-gray-800">{wLabel()}</span>
            <button onClick={()=>setWeekOffset(w=>w+1)} className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800"><ChevronRight size={16}/></button>
          </div>
          <button onClick={()=>setWeekOffset(0)} className="px-3 py-2 text-sm rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">This Week</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4">
          {loading?Array.from({length:5}).map((_,i)=><div key={i} className="flex-1 min-w-[180px] h-64 rounded-xl animate-pulse bg-white border border-gray-200"/>):
          Object.entries(byDate).map(([date,entries])=>{
            const d=new Date(date+'T12:00:00'),isToday=date===today
            const bmo=entries.filter(e=>e.time==='BMO'),amc=entries.filter(e=>e.time==='AMC')
            return(
              <div key={date} className="flex-1 min-w-[180px]">
                <div className={"text-center py-3 px-2 rounded-t-xl "+(isToday?'bg-blue-600 text-white':'bg-white border-t border-x border-gray-200')}>
                  <div className={"text-xs font-bold uppercase tracking-widest "+(isToday?'text-blue-200':'text-gray-400')}>{DAYS[d.getDay()-1]}</div>
                  <div className={"text-lg font-black "+(isToday?'text-white':'text-gray-800')} style={{fontFamily:"'Barlow Condensed'"}}>{MOS[d.getMonth()]} {d.getDate()}</div>
                  {isToday&&<div className="text-[10px] text-blue-200 font-bold">Today</div>}
                  <div className={"text-[11px] mt-1 "+(isToday?'text-blue-200':'text-gray-400')}>{entries.length} reports</div>
                </div>
                <div className="border border-gray-200 rounded-b-xl overflow-hidden bg-white">
                  {bmo.length>0&&<>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase text-amber-600 bg-amber-50 border-b border-gray-100">Pre-Market</div>
                    {bmo.map(e=><div key={e.symbol} className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm text-gray-800">{e.symbol}</span>
                        {e.status==='reported'&&e.surprise!==null?<span className="text-xs font-bold" style={{color:sc(e.surprise)}}>{e.surprise>0?'+':''}{e.surprise.toFixed(1)}%</span>:<span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Est ${e.epsEstimate?.toFixed(2)}</span>}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{e.name}</div>
                    </div>)}
                  </>}
                  {amc.length>0&&<>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase text-orange-500 bg-orange-50 border-b border-gray-100">After Close</div>
                    {amc.map(e=><div key={e.symbol} className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm text-gray-800">{e.symbol}</span>
                        {e.status==='reported'&&e.surprise!==null?<span className="text-xs font-bold" style={{color:sc(e.surprise)}}>{e.surprise>0?'+':''}{e.surprise.toFixed(1)}%</span>:<span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Est ${e.epsEstimate?.toFixed(2)}</span>}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{e.name}</div>
                    </div>)}
                  </>}
                  {entries.length===0&&<div className="px-3 py-6 text-center text-gray-400 text-sm">No reports</div>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>
          <div>
            <div className="flex items-center gap-2 mb-1"><Zap size={16} className="text-yellow-300"/><span className="text-xs font-bold uppercase text-blue-200">Stock411 Pro - Coming Soon</span></div>
            <h3 className="text-xl font-black mb-1 text-white" style={{fontFamily:"'Barlow Condensed'"}}>Earnings Alerts and AI Analysis</h3>
            <p className="text-sm text-blue-200">Get notified 30 min before reports with AI earnings preview and options flow.</p>
          </div>
          <button className="px-6 py-3 rounded-xl font-bold text-sm bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors whitespace-nowrap">Join Waitlist</button>
        </div>
      </div>
    </div>
  )
}
