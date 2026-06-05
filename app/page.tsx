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
    open:{label:'MARKET OPEN',color:'#15803d',bg:'#f0fdf4'},
    premarket:{label:'PRE-MARKET',color:'#b45309',bg:'#fffbeb'},
    afterhours:{label:'AFTER-HOURS',color:'#c2410c',bg:'#fff7ed'},
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
            <span className={up?'text-emerald-600 font-semibold':'text-red-500 font-semibold'}>{up?'^':'v'} {q.changePercent}%</span>
          </span>
        )})}
      </div>
    </div>
  )
}

export default function Home() {
  const [quotes,setQuotes]=useState<Quote[]>([])
  const [news,setNews]=useState<NewsItem[]>([])
  const [loading,setLoading]=useState(true)
  const [activeTab,setActiveTab]=useState('all')
  const [searchVal,setSearchVal]=useState('')
  const [lastUpdated,setLastUpdated]=useState('')

  const fetchData=useCallback(async()=>{
    try {
      const [tr,nr]=await Promise.all([fetch('/api/ticker'),fetch('/api/news')])
      const [td,nd]=await Promise.all([tr.json(),nr.json()])
      if(td.quotes)setQuotes(td.quotes)
      if(nd.articles)setNews(nd.articles)
      setLastUpdated(new Date().toLocaleTimeString())
    }catch(e){console.error(e)}finally{setLoading(false)}
  },[])

  useEffect(()=>{fetchData();const id=setInterval(fetchData,60000);return()=>clearInterval(id)},[fetchData])

  const filteredNews=news.filter(n=>{
    const tm=activeTab==='all'?true:activeTab==='macro'?['Macro','Markets'].includes(n.category):activeTab==='earnings'?n.category==='Earnings':activeTab==='global'?n.category==='Global':n.category==='Crypto'
    return tm&&(searchVal===''||n.title.toLowerCase().includes(searchVal.toLowerCase()))
  })

  return (
    <div className="min-h-screen" style={{background:'#f7f8fa'}}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{background:'#1e3a5f'}}><BarChart2 size={16} className="text-white"/></div>
            <span className="font-black tracking-tight text-lg text-gray-900" style={{fontFamily:"'Barlow Condensed'"}}>THE <span style={{color:'#2563eb'}}>STOCK</span>411</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {([['/', 'Markets'],['/earnings','Earnings'],['/screener','Screener']] as [string,string][]).map(([href,label])=>(
              <Link key={href} href={href} className={"px-3 py-1.5 text-sm font-medium rounded transition-colors "+(href==='/'?'text-blue-600 bg-blue-50':'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}>{label}</Link>
            ))}
          </nav>
          <div className="flex-1"/>
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Search ticker, news..." value={searchVal} onChange={e=>setSearchVal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&searchVal.trim()){window.location.href='/screener?q='+encodeURIComponent(searchVal.trim())}}} className="pl-8 pr-4 py-1.5 text-sm rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 bg-gray-50 text-gray-900"/>
          </div>
          <MarketStatus/>
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 hidden sm:flex"><Bell size={18}/></button>
        </div>
      </header>

      <TickerBar quotes={quotes}/>

      {/* Index Strip */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto overflow-x-auto">
          <div className="flex min-w-max">
            {INDICES.map(idx=>(
              <div key={idx.label} className="flex-1 min-w-[110px] px-4 py-2.5 border-r border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{idx.label}</div>
                <div className="font-bold text-sm text-gray-900">{idx.price}</div>
                <div className={"text-[11px] font-semibold "+(idx.up?'text-emerald-600':'text-red-500')}>{idx.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* News Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-gray-900" style={{fontFamily:"'Barlow Condensed'"}}>
                <Newspaper size={16} className="inline mr-2 text-blue-600"/>Market Intelligence
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <RefreshCw size={12} className={loading?'animate-spin':''}/>
                {lastUpdated?'Updated '+lastUpdated:'Loading...'}
              </div>
            </div>

            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {(['all','macro','earnings','global','crypto'] as const).map(tab=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} className={"px-3 py-1.5 text-xs rounded-full font-semibold uppercase tracking-wide whitespace-nowrap transition-all border "+(activeTab===tab?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700')}>
                  {tab==='all'?'All':tab==='macro'?'Macro':tab==='earnings'?'Earnings':tab==='global'?'Global':'Crypto'}
                </button>
              ))}
            </div>

            {loading?<div className="rounded-xl p-5 mb-3 animate-pulse bg-white border border-gray-200" style={{height:180}}/>:filteredNews[0]?(
              <div className="news-card rounded-xl p-5 mb-3 bg-white border border-gray-200 shadow-sm cursor-pointer" onClick={()=>{if(filteredNews[0]?.url&&filteredNews[0].url!=='#')window.location.href=filteredNews[0].url}}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{background:CAT_BG[filteredNews[0].category]||'#f3f4f6',color:CAT[filteredNews[0].category]||'#6b7280'}}>{filteredNews[0].category}</span>
                  <span className="text-xs text-gray-500 font-medium">{filteredNews[0].source}</span>
                  <span className="text-xs text-gray-400 ml-auto flex items-center gap-1"><Clock size={10}/>{timeAgo(filteredNews[0].time)}</span>
                </div>
                <h3 className="font-bold leading-snug mb-2 text-gray-900 text-lg" style={{fontFamily:"'Barlow Condensed'"}}>{filteredNews[0].title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{filteredNews[0].summary}</p>
                <div className="mt-3 flex items-center text-xs text-blue-600 font-semibold gap-1">Read full story<ChevronRight size={12}/></div>
              </div>
            ):null}

            <div className="space-y-0.5">
              {loading?Array.from({length:6}).map((_,i)=><div key={i} className="py-3 px-3 rounded-lg animate-pulse bg-white border border-gray-100 mb-1"><div className="h-4 rounded w-3/4 mb-2 bg-gray-100"/><div className="h-3 rounded w-1/4 bg-gray-100"/></div>):
              filteredNews.slice(1).map(item=>(
                <div key={item.id} className="news-card py-3 px-3 rounded-lg bg-white border border-gray-100 mb-1 cursor-pointer" onClick={()=>{if(item.url&&item.url!=='#')window.location.href=item.url}}>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0 mt-0.5" style={{background:CAT_BG[item.category]||'#f3f4f6',color:CAT[item.category]||'#6b7280'}}>{item.category}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug text-gray-800 line-clamp-2">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-500 font-medium">{item.source}</span>
                        <span className="text-[11px] text-gray-400">{timeAgo(item.time)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 xl:col-span-2 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black uppercase tracking-wider text-gray-900" style={{fontFamily:"'Barlow Condensed'"}}><Activity size={14} className="inline mr-2 text-amber-500"/>Top Movers</h2>
                <Link href="/screener" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700">View all<ChevronRight size={12}/></Link>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
                {MOVERS.map(m=>(
                  <div key={m.symbol} className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div><div className="font-bold text-sm text-gray-900">{m.symbol}</div><div className="text-[11px] text-gray-500">{m.name}</div></div>
                      <div className={"text-sm font-bold flex items-center gap-0.5 "+(m.up?'text-emerald-600':'text-red-500')}>{m.up?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>}{m.pct}</div>
                    </div>
                    <ResponsiveContainer width="100%" height={36}><LineChart data={spark(m.up)}><Line type="monotone" dataKey="v" stroke={m.up?'#10b981':'#ef4444'} strokeWidth={1.5} dot={false}/><YAxis domain={['auto','auto']} hide/></LineChart></ResponsiveContainer>
                    <div className="flex justify-between mt-1.5"><span className="text-[11px] text-gray-400">Live</span><span className="text-[11px] font-mono font-semibold text-gray-700">${m.price}</span></div>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-base font-black uppercase tracking-wider text-gray-900 mb-3" style={{fontFamily:"'Barlow Condensed'"}}><Globe size={14} className="inline mr-2 text-blue-600"/>Global Markets</h2>
              <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">{GLOBAL.map((m,i)=>(
                <div key={m.name} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors" style={{borderBottom:i<GLOBAL.length-1?'1px solid #f3f4f6':'none'}}>
                  <div><div className="text-sm font-semibold text-gray-800">{m.name}</div><div className="text-[11px] text-gray-500">{m.region}</div></div>
                  <div className="text-right"><div className="text-sm font-mono font-medium text-gray-800">{m.value}</div><div className={"text-xs font-semibold "+(m.up?'text-emerald-600':'text-red-500')}>{m.up?'^':'v'} {m.change}</div></div>
                </div>))}</div>
            </section>
            <section>
              <h2 className="text-base font-black uppercase tracking-wider text-gray-900 mb-3" style={{fontFamily:"'Barlow Condensed'"}}><TrendingUp size={14} className="inline mr-2 text-emerald-600"/>Sector Performance</h2>
              <div className="space-y-2">{[{name:'Technology',pct:1.42,up:true},{name:'Energy',pct:-1.51,up:false},{name:'Financials',pct:0.55,up:true},{name:'Healthcare',pct:0.22,up:true},{name:'Consumer Disc.',pct:-0.38,up:false},{name:'Industrials',pct:0.61,up:true},{name:'Real Estate',pct:-0.19,up:false},{name:'Materials',pct:0.44,up:true}].map(s=>(
                <div key={s.name} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-xs text-gray-600 w-32 shrink-0 font-medium">{s.name}</span>
                  <div className="flex-1 h-4 rounded-full overflow-hidden bg-gray-100"><div className="h-full rounded-full flex items-center justify-end pr-2 text-[10px] font-bold text-white" style={{width:Math.min(Math.abs(s.pct)*20,100)+'%',background:s.up?'#10b981':'#ef4444',minWidth:44}}>{s.up?'+':''}{s.pct}%</div></div>
                </div>))}</div>
            </section>
            <section className="rounded-xl p-5 border" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)',borderColor:'#2563eb'}}>
              <div className="flex items-center gap-2 mb-2"><Zap size={16} className="text-yellow-300"/><span className="text-xs font-bold uppercase tracking-widest text-blue-200">Free Newsletter</span></div>
              <h3 className="font-black text-lg mb-1 text-white" style={{fontFamily:"'Barlow Condensed'"}}>The Stock411 Daily Brief</h3>
              <p className="text-sm text-blue-200 mb-4">Pre-market intelligence, top movers, and macro signals every morning at 8 AM ET.</p>
              <div className="flex gap-2"><input type="email" placeholder="your@email.com" className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/10 border border-white/20 text-white placeholder-blue-300"/><button className="px-4 py-2 text-sm font-bold rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors">Subscribe</button></div>
            </section>
            <section>
              <h2 className="text-base font-black uppercase tracking-wider text-gray-900 mb-3" style={{fontFamily:"'Barlow Condensed'"}}><Star size={14} className="inline mr-2 text-amber-500"/>Trending Now</h2>
              <div className="flex flex-wrap gap-2">{['NVDA','AAPL','TSLA','SPY','QQQ','AMD','META','BTC-USD','MSFT','PLTR','COIN','GLD','ARKK','AMZN','LLY'].map(t=>(<a key={t} href="#" className="px-2.5 py-1 text-xs rounded-lg font-mono font-medium bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors">{t}</a>))}</div>
            </section>
          </div>
        </div>
      </main>
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-screen-2xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400">&copy; 2025 TheStock411.com - Data delayed 15 min - Not financial advice</p>
          <div className="flex gap-4 text-xs text-gray-400"><a href="#" className="hover:text-gray-600">Privacy</a><a href="#" className="hover:text-gray-600">Terms</a><a href="#" className="hover:text-gray-600">Disclaimer</a></div>
        </div>
      </footer>
    </div>
  )
}
