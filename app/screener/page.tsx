'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { BarChart2, Search, Filter, ArrowUpDown, ChevronUp, ChevronDown, Zap } from 'lucide-react'

interface Stock {
  symbol:string; name:string; price:number; change:number; changePct:number
  volume:number; mktCap:number; pe:number|null; eps:number|null
  week52High:number; week52Low:number; sector:string; industry:string; beta:number
  dividendYield:number|null; revenueGrowth:number|null; grossMargin:number|null
  roe:number|null; analystRating:string; priceTarget:number|null
}

function fmt(n: number|null, s='') { return n===null ? '-' : n.toFixed(2)+s }
function fmtM(b: number) { return b>=1000 ? '$'+(b/1000).toFixed(1)+'T' : '$'+b+'B' }

const RC: Record<string,{color:string,bg:string}> = {
  'Strong Buy':{color:'#065f46',bg:'#d1fae5'},
  'Buy':{color:'#047857',bg:'#ecfdf5'},
  'Hold':{color:'#92400e',bg:'#fffbeb'},
  'Sell':{color:'#b45309',bg:'#fff7ed'},
  'Strong Sell':{color:'#991b1b',bg:'#fef2f2'}
}
const SEC: Record<string,string> = { Technology:'#2563eb',Financials:'#059670',Healthcare:'#7c3aed','Consumer Disc.':'#c2410c',Energy:'#b45309',Industrials:'#1d4ed8','Consumer Staples':'#b45309',Communication:'#db2877' }
const SECTORS = ['Technology','Financials','Healthcare','Consumer Disc.','Consumer Staples','Energy','Industrials','Communication']

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('all')
  const [rating, setRating] = useState('all')
  const [sortBy, setSortBy] = useState('mktCap')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({sortBy, sortDir, sector, rating, q:query})
      if (minPrice) p.set('minPrice', minPrice)
      if (maxPrice) p.set('maxPrice', maxPrice)
      const r = await fetch('/api/screener?' + p)
      const d = await r.json()
      setStocks(d.stocks || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [sortBy, sortDir, sector, rating, query, minPrice, maxPrice])

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])

  function toggleSort(col: string) {
    if (sortBy === col) setSortDir(d => d==='desc'?'asc':'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  function SortIcon({ col }: { col: string }) {
    if (sortBy !== col) return <ArrowUpDown size={12} className="text-gray-300"/>
    return sortDir==='desc' ? <ChevronDown size={12} className="text-blue-600"/> : <ChevronUp size={12} className="text-blue-600"/>
  }

  const cols: [string,string][] = [['symbol','Symbol'],['price','Price'],['changePct','Chg %'],['mktCap','Mkt Cap'],['pe','P/E'],['revenueGrowth','Rev Gr.'],['grossMargin','Margin'],['beta','Beta'],['analystRating','Rating']]

  return (
    <div className="min-h-screen" style={{background:'#f7f8fa'}}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{background:'#1e3a5f'}}><BarChart2 size={16} className="text-white"/></div>
            <span className="font-black text-lg text-gray-900" style={{fontFamily:"'Barlow Condensed'"}}>THE <span style={{color:'#2563eb'}}>STOCK</span>411</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {([['/','Markets'],['/earnings','Earnings'],['/screener','Screener']] as [string,string][]).map(([h,l])=>(
              <Link key={h} href={h} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${h==='/screener'?'text-blue-600 bg-blue-50':'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>{l}</Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase text-gray-900" style={{fontFamily:"'Barlow Condensed'"}}><Filter size={24} className="inline mr-2 text-blue-600"/>Stock Screener</h1>
          <p className="text-sm text-gray-500 mt-1">Filter and sort {stocks.length} stocks by fundamentals and analyst ratings</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-6 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="col-span-2 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Search symbol or name..." value={query} onChange={e=>setQuery(e.target.value)} className="w-full pl-8 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 bg-gray-50 text-gray-900"/>
          </div>
          <select value={sector} onChange={e=>setSector(e.target.value)} className="px-3 py-2 text-sm rounded-lg focus:outline-none border border-gray-200 bg-gray-50 text-gray-700">
            <option value="all">All Sectors</option>
            {SECTORS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={rating} onChange={e=>setRating(e.target.value)} className="px-3 py-2 text-sm rounded-lg focus:outline-none border border-gray-200 bg-gray-50 text-gray-700">
            <option value="all">All Ratings</option>
            {['Strong Buy','Buy','Hold','Sell','Strong Sell'].map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <input type="number" placeholder="Min $" value={minPrice} onChange={e=>setMinPrice(e.target.value)} className="px-3 py-2 text-sm rounded-lg focus:outline-none border border-gray-200 bg-gray-50 text-gray-700"/>
          <input type="number" placeholder="Max $" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} className="px-3 py-2 text-sm rounded-lg focus:outline-none border border-gray-200 bg-gray-50 text-gray-700"/>
        </div>

        <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{minWidth:'900px'}}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {cols.map(([col,label])=>(
                    <th key={col} onClick={()=>toggleSort(col)} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-gray-800 whitespace-nowrap">
                      <span className="flex items-center gap-1">{label}<SortIcon col={col}/></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({length:8}).map((_,i)=>(
                  <tr key={i} className="border-b border-gray-100">
                    {cols.map((_,j)=><td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse bg-gray-100" style={{width:j===0?'80px':'60px'}}/></td>)}
                  </tr>
                )) : stocks.map(s=>(
                  <tr key={s.symbol} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{background:SEC[s.sector]||'#6b7280'}}>{s.symbol.slice(0,2)}</div>
                        <div>
                          <div className="font-bold text-gray-900">{s.symbol}</div>
                          <div className="text-[11px] text-gray-500 max-w-[120px] truncate">{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">${s.price.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={"font-bold "+(s.changePct>=0?'text-emerald-600':'text-red-500')}>{s.changePct>=0?'+':''}{s.changePct.toFixed(2)}%</span></td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{fmtM(s.mktCap)}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{fmt(s.pe,'x')}</td>
                    <td className="px-4 py-3"><span className={s.revenueGrowth!==null&&s.revenueGrowth>=0?'text-emerald-600':'text-red-500'}>{fmt(s.revenueGrowth,'%')}</span></td>
                    <td className="px-4 py-3 font-mono text-gray-600">{fmt(s.grossMargin,'%')}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{s.beta.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-1 rounded-full" style={{color:RC[s.analystRating]?.color||'#6b7280',background:RC[s.analystRating]?.bg||'#f3f4f6'}}>{s.analystRating}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && stocks.length===0 && <div className="py-16 text-center text-gray-400"><p>No stocks match your filters.</p></div>}
        </div>

        <div className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}>
          <div>
            <div className="flex items-center gap-2 mb-1"><Zap size={16} className="text-yellow-300"/><span className="text-xs font-bold uppercase text-blue-200">Stock411 Pro - Coming Soon</span></div>
            <h3 className="text-xl font-black mb-1 text-white" style={{fontFamily:"'Barlow Condensed'"}}>Advanced Screener and Alerts</h3>
            <p className="text-sm text-blue-200">50+ filters, options flow, dark pool data, AI stock scoring and real-time alerts.</p>
          </div>
          <button className="px-6 py-3 rounded-xl font-bold text-sm bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors whitespace-nowrap">Join Waitlist</button>
        </div>
      </div>
    </div>
  )
}
