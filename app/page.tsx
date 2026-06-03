'use client'
import { useEffect, useState, useCallback } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { TrendingUp, Globe, Zap, Bell, Search, ChevronRight, RefreshCw, Clock, BarChart2, Activity, ArrowUpRight, ArrowDownRight, Newspaper, Star } from 'lucide-react'
import Link from 'next/link'

interface Quote { symbol: string; name?: string; price: string; change: string; changePercent: string }
interface NewsItem { id: string; title: string; summary: string; source: string; time: string; category: string; url: string; sentiment: string }

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return Math.floor(diff) + 's ago'
  if (diff < 3600) return Math.floor(diff/60) + 'm ago'
  return Math.floor(diff/3600) + 'h ago'
}
function isPos(val: string) { return !val.startsWith('-') }

const CAT: Record<string,string> = { Macro:'#1d4ed8',Earnings:'#b45309',Markets:'#15803d',Global:'#c2410c',Crypto:'#7c3aed',Tech:'#1d4ed8',Autos:'#dc2626',Investing:'#15803d',Commodities:'#92400e',IPO:'#1d4ed8' }
const CAT_BG: Record<string,string> = { Macro:'#eff6ff',Earnings:'#fffbeb',Markets:'#f0fdf4',Global:'#fff7ed',Crypto:'#f5f3ff',Tech:'#eff6ff',Autos:'#fef2f2',Investing:'#f0fdf4',Commodities:'#fffbeb',IPO:'#eff6ff' }

const INDICES = [
  { label:'S&P 500', price:'5,487', change:'+0.43%', up:true },
  { label:'Dow Jones', price:'43,862', change:'+0.42%', up:true },
  { label:'NASDAQ', price:'19,674', change:'+0.58%', up:true },
  { label:'Russell 2K', price:'2,074', change:'+0.33%', up:true },
  { label:'VIX', price:'12.84', change:'-2.58%', up:false },
  { label:'Gold', price:'$2,342', change:'+0.36%', up:true },
  { label:'WTI Oil', price:'$79.44', change:'-1.51%', up:false },
  { label:'BTC', price:'$67,432', change:'+1.86%', up:true },
]

const GLOBAL = [
  { name:'FTSE 100', region:'London', value:'8,231', change:'+0.28%', up:true },
  { name:'DAX', region:'Frankfurt', value:'18,492', change:'+0.61%', up:true },
  { name:'CAC 40', region:'Paris', value:'7,948', change:'-0.14%', up:false },
  { name:'Nikkei 225', region:'Tokyo', value:'38,707', change:'+0.56%', up:true },
  { name:'Hang Seng', region:'Hong Kong', value:'18,230', change:'-0.88%', up:false },
  { name:'Shanghai', region:'Shanghai', value:'3,122', change:'-0.44%', up:false },
  { name:'ASX 200', region:'Sydney', value:'7,890', change:'+0.33%', up:true },
  { name:'TSX', region:'Toronto', value:'21,888', change:'+0.19%', up:true },
]

const MOVERS = [
  { symbol:'NVDA', name:'NVIDIA', price:'134.76', pct:'+3.31%', up:true },
  { symbol:'AMD', name:'Adv Micro', price:'164.23', pct:'+3.58%', up:true },
  { symbol:'PLTR', name:'Palantir', price:'32.44', pct:'+2.79%', up:true },
  { symbol:'TSLA', name:'Tesla', price:'248.91', pct:'-2.52%', up:false },
  { symbol:'COIN', name:'Coinbase', price:'234.56', pct:'-1.81%', up:false },
  { symbol:'LLY', name:'Eli Lilly', price:'877.34', pct:'+1.65%', up:true },
]

function spark(up: boolean) {
  let v = 100
  return Array.from({length:20},()=>{ v+=(Math.random()-(up?0.38:0.62))*3; return {v:parseFloat(v.toFixed(2))} })
}

function MarketStatus() {
  const [status, setStatus] = useState('open')
  const [time, setTime] = useState('')
  useEffect(()=>{
    const tick=()=>{
      const et=new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'}))
      const h=et.getHours(),m=et.getMinutes(),day=et.getDay()
      setTime(et.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+' ET')
      if(day===0||day===6){setStatus('closed');return}
      const mins=h*60+m
      if(mins>=240&&mins<570)setStatus('premarket')
      else if(mins>=570&&mins<960)setStatus('open')
      else if(mins>=960&&mins<1200)setStatus('afterhours')
      else setStatus('closed')
    }
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id)
  },[])
  const cfg: Record<string,{label:string,color:string,bg:string}> = {
    open:{label:'MARKET OPEN',color:'#15803d',bg;'#f0fdf4'},
    premarket:{label:'PRE-MARKET',color:'#b45309',bg:'#fffbeb'},
    afterhours:{label:'AFTER-HOURS',color:'#c2410c',bg;'#fff7ed'},
    closed:{label:'MARKET CLOSED',color:'#6b7280',bg:'#f9fafb'},
  }
  const c=cfg[status]
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider border" style={{background:c.bg,color:c.color,borderColor:c.color+'40'}}>
        <span className={"w-2 h-2 rounded-full"+(status==='open'?' status-live':'')} style={{background:c.color}}/>
        {c.label}
      </div>
      <span className="text-xs text-gray-500 font-mono hidden sm:block">{time}</span>
    </div>
  )
}

function TickerBar({quotes}:{quotes:Quote[]}) {
  if(!quotes.length) return <div className="h-9 border-b border-gray-200 bg-white flex items-center px-4"><span className="text-xs text-gray-400 animate-pulse">Loading market data...</span></div>
  const items=[...quotes,...quotes]
  return (
    <div className="h-9 bg-white border-b border-gray-200 ticker-wrapper flex items-center">
      <div className="ticker-track">
        {items.map((q,i)=>{const up=isPos(q.changePercent);return(
          <span key={i} className="inline-flex items-center gap-2 px-5 text-xs border-r border-gray-100" style={{minWidth:'max-content'}}>
            <span className="font-bold text-gray-800 tracking-wide">{q.symbol}</span>
            <span className="text-gray-600">${q.price}</span>
            <span className={up?'text-emerald-600 font-semibold':'text-red-500 font-semibold'}>{up?'▲':'▼'} {q.changePercent}%</span>
          </span>
        )})}
      </div>
    </div>
  )
}