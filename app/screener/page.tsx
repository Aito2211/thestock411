'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { BarChart2, Search, Filter, TrendingUp, TrendingDown, ArrowUpDown, ChevronUp, ChevronDown, Zap } from 'lucide-react'

interface Stock {
  symbol: string; name: string; price: number; change: number; changePct: number
  volume: number; avgVolume: number; mktCap: number; pe: number|null; eps: number|null
  week52High: number; week52Low: number; sector: string; industry: string; beta: number
  dividendYield: number|null; revenueGrowth: number|null; grossMargin: number|null
  roe: number|null; debtToEquity: number|null; analystRating: string; priceTarget: number|null
}

function fmt(n: number|null, suffix='') { if (n===null) return '—'; return n.toFixed(2)+suffix }
function fmtMkt(b: number) { if(b>=1000) return '$'+(b/1000).toFixed(1)+'T'; return '$'+b+'B' }
function fmtVol(v: number) { if(v>=1e9) return (v/1e9).toFixed(1)+'B'; if(v>=1e6) return (v/1e6).toFixed(0)+'M'; return v.toString() }

const RATING_COLORS: Record<string,string> = { 'Strong Buy':'#3fb950','Buy':'#8bc34a','Hold':'#e3b341','Sell':'#f0883e','Strong Sell':'#f85149' }
const SECTOR_COLORS: Record<string,string> = { Technology:'#58a6ff',Financials:'#3fb950',Healthcare:'#a371f7','Consumer Disc.':'#f0883e',Energy:'#d29922',Industrials:'#58a6ff','Consumer Staples':'#e3b341',Communication:'#ec4899' }

export default function ScreenerPage() {
  const [stocks,setStocks]=useState<Stock[]>([])
  const [loading,setLoading]=useState(true)
  const [query,setQuery]=useState('')
  const [sector,setSector]=useState('all')
  const [rating,setRating]=useState('all')
  const [sortBy,setSortBy]=useState('mktCap')
  const [sortDir,setSortDir]=useState<'asc'|'desc'>('desc')
  const [minPrice,setMinPrice]=useState('')
  const [maxPrice,setMaxPrice]=useState('')

  const fetchStocks=useCallback(async()=>{
    setLoading(true)
    try {
      const params=new URLSearchParams({sortBy,sortDir,sector,rating,q:query})
      if(minPrice)params.set('minPrice',minPrice)
      if(maxPrice)params.set('maxPrice',maxPrice)
      const res=await fetch('/api/screener?'+params)
      const data=await res.json()
      setStocks(data.stocks||[])
    } catch(e){console.error(e)} finally{setLoading(false)}
  },[sortBy,sortDir,sector,rating,query,minPrice,maxPrice])

  useEffect(()=>{const t=setTimeout(fetchStocks,300);return()=>clearTimeout(t)},[fetchStocks])

  function toggleSort(col: string){if(sortBy===col){setSortDir(d=>d==='desc'?'asc':'desc')}else{setSortBy(col);setSortDir('desc')}}
  function SortIcon({col}:{col:string}){if(sortBy!==col)return<ArrowUpDown size={12} className="text-gray-600"/>;return sortDir==='desc'?<ChevronDown size={12} className="text-green-400"/>:<ChevronUp size={12} className="text-green-400"/>}

  const sectors=['Technology','Financials','Healthcare','Consumer Disc.','Consumer Staples','Energy','Industrials','Communication']

  return (
    <div className="min-h-screen" style={{background:'#080c10'}}>
      <header style={{background:'#0d1117',borderBottom:'1px solid #1c2430'}}>
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{background:'linear-gradient(135deg,#3fb950,#1a7f37)'}}><BarChart2 size={16} className="text-white"/></div>
            <span className="font-black tracking-tight text-lg" style={{fontFamily:"'Barlow Condensed'"}}>THE <span style={{color:'#3fb950'}}>STOCK</span>411</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {[['/',  'Markets'],['/earnings','Earnings'],['/screener','Screener']].map(([href,label])=>(
              <Link key={href} href={href} className={`px-3 py-1.5 text-sm rounded transition-colors ${href==='/screener'?'text-white bg-white/8':'text-gray-400 hover:text-white hover:bg-white/5'}`}>{label}</Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight" style={{fontFamily:"'Barlow Condensed'"}}><Filter size={24} className="inline mr-2 text-green-400"/>Stock Screener</h1>
          <p className="text-sm text-gray-500 mt-1">Filter and sort {stocks.length} stocks by fundamentals, technicals, and analyst ratings</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-6 p-4 rounded-xl" style={{background:'#0d1117',border:'1px solid #1c2430'}}>
          <div className="col-span-2 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
            <input type="text" placeholder="Search symbol or name..." value={query} onChange={e=>setQuery(e.target.value)} className="w-full pl-8 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" style={{background:'#161b22',border:'1px solid #30363d',color:'#e6edf3'}}/>
          </div>
          <select value={sector} onChange={e=>setSector(e.target.value)} className="px-3 py-2 text-sm rounded-lg focus:outline-none" style={{background:'#161b22',border:'1px solid #30363d',color:'#e6edf3'}}>
            <option value="all">All Sectors</option>
            {sectors.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={rating} onChange={e=>setRating(e.target.value)} className="px-3 py-2 text-sm rounded-lg focus:outline-none" style={{background:'#161b22',border:'1px solid #30363d',color:'#e6edf3'}}>
            <option value="all">All Ratings</option>
            {['Strong Buy','Buy','Hold','Sell','Strong Sell'].map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <input type="number" placeholder="Min price" value={minPrice} onChange={e=>setMinPrice(e.target.value)} className="px-3 py-2 text-sm rounded-lg focus:outline-none" style={{background:'#161b22',border:'1px solid #30363d',color:'#e6edf3'}}/>
          <input type="number" placeholder="Max price" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} className="px-3 py-2 text-sm rounded-lg focus:outline-none" style={{background:'#161b22',border:'1px solid #30363d',color:'#e6edf3'}}/>
        </div>
        <div className="rounded-xl overflow-hidden" style={{border:'1px solid #1c2430'}}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{minWidth:'900px'}}>
              <thead>
                <tr style={{background:'#0d1117',borderBottom:'1px solid #1c2430'}}>
                  {[['symbol','Symbol'],['price','Price'],['changePct','Change %'],['mktCap','Mkt Cap'],['pe','P/E'],['revenueGrowth','Rev Growth'],['grossMargin','Gross Margin'],['beta','Beta'],['analystRating','Rating']].map(([col,label])=>(
                    <th key={col} onClick={()=>toggleSort(col)} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-white transition-colors whitespace-nowrap">
                      <span className="flex items-center gap-1">{label}<SortIcon col={col}/></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading?Array.from({length:8}).map((_,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid #1c2430'}}>
                    {Array.from({length:9}).map((_,j)=><td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{background:'#1c2430',width:j===0?'80px':'60px'}}/></td>)}
                  </tr>
                )):stocks.map(s=>(
                  <tr key={s.symbol} className="hover:bg-[#1c2430]/40 transition-colors cursor-pointer" style={{borderBottom:'1px solid #1c243020'}}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-black" style={{background:`${SECTOR_COLORS[s.sector]||'#58a6ff'}20`,color:SECTOR_COLORS[s.sector]||'#58a6ff'}}>{s.symbol.slice(0,2)}</div>
                        <div><div className="font-bold" style={{fontFamily:"'IBM Plex Mono'"}}>{s.symbol}</div><div className="text-[11px] text-gray-500 max-w-[120px] truncate">{s.name}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">${s.price.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`font-bold ${s.changePct>=0?'text-green-400':'text-red-400'}`}>{s.changePct>=0?'+':''}{s.changePct.toFixed(2)}%</span></td>
                    <td className="px-4 py-3 text-gray-300">{fmtMkt(s.mktCap)}</td>
                    <td className="px-4 py-3 font-mono">{fmt(s.pe,'x')}</td>
                    <td className="px-4 py-3"><span className={s.revenueGrowth!==null&&s.revenueGrowth>=0?'text-green-400':'text-red-400'}>{fmt(s.revenueGrowth,'%')}</span></td>
                    <td className="px-4 py-3 font-mono">{fmt(s.grossMargin,'%')}</td>
                    <td className="px-4 py-3 font-mono">{s.beta.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-1 rounded" style={{color:RATING_COLORS[s.analystRating]||'#7d8590',background:`${RATING_COLORS[s.analystRating]||'#7d8590'}15`}}>{s.analystRating}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading&&stocks.length===0&&<div className="py-16 text-center text-gray-500"><Filter size={32} className="mx-auto mb-2 opacity-30"/><p>No stocks match your filters.</p></div>}
        </div>
        <div className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{background:'linear-gradient(135deg,#0d1117,#0f1f0f)',border:'1px solid #2d4a2d'}}>
          <div>
            <div className="flex items-center gap-2 mb-1"><Zap size={16} className="text-green-400"/><span className="text-xs font-bold uppercase tracking-widest text-green-400">Stock411 Pro — Coming Soon</span></div>
            <h3 className="text-xl font-black mb-1" style={{fontFamily:"'Barlow Condensed'"}}>Advanced Screener + Alerts</h3>
            <p className="text-sm text-gray-400">50+ filters. Options flow. Dark pool data. AI stock scoring. Real-time alerts when stocks hit your criteria.</p>
          </div>
          <button className="px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all hover:brightness-110" style={{background:'linear-gradient(135deg,#3fb950,#1a7f37)',color:'#000'}}>Join Waitlist →</button>
        </div>
      </div>
    </div>
  )
}