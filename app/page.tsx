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

const CAT_COLORS: Record<string,string> = { Macro:'#58a6ff',Earnings:'#e3b341',Markets:'#3fb950',Global:'#f0883e',Crypto:'#a371f7',Tech:'#58a6ff',Autos:'#f85149',Investing:'#3fb950',Commodities:'#d29922',IPO:'#58a6ff' }

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
  { name:'FTSE 100', region:'🇬🇧 London', value:'8,231', change:'+0.28%', up:true },
  { name:'DAX', region:'🇩🇪 Frankfurt', value:'18,492', change:'+0.61%', up:true },
  { name:'CAC 40', region:'🇫🇷 Paris', value:'7,948', change:'-0.14%', up:false },
  { name:'Nikkei 225', region:'🇯🇵 Tokyo', value:'38,707', change:'+0.56%', up:true },
  { name:'Hang Seng', region:'🇭🇰 Hong Kong', value:'18,230', change:'-0.88%', up:false },
  { name:'Shanghai', region:'🇨🇳 Shanghai', value:'3,122', change:'-0.44%', up:false },
  { name:'ASX 200', region:'🇦🇺 Sydney', value:'7,890', change:'+0.33%', up:true },
  { name:'TSX', region:'🇨🇦 Toronto', value:'21,888', change:'+0.19%', up:true },
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
      const et = new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'}))
      const h=et.getHours(),m=et.getMinutes(),day=et.getDay()
      setTime(et.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+' ET')
      if(day===0||day===6){setStatus('closed');return}
      const mins=h*60+m
      if(mins>=240&&mins<570) setStatus('premarket')
      else if(mins>=570&&mins<960) setStatus('open')
      else if(mins>=960&&mins<1200) setStatus('afterhours')
      else setStatus('closed')
    }
    tick(); const id=setInterval(tick,1000); return()=>clearInterval(id)
  },[])
  const cfg:{[k:string]:{label:string,color:string,bg:string}} = {
    open:{label:'MARKET OPEN',color:'#3fb950',bg:'rgba(63,185,80,0.12)'},
    premarket:{label:'PRE-MARKET',color:'#e3b341',bg:'rgba(227,179,65,0.12)'},
    afterhours:{label:'AFTER-HOURS',color:'#f0883e',bg:'rgba(240,136,62,0.12)'},
    closed:{label:'MARKET CLOSED',color:'#7d8590',bg:'rgba(125,133,144,0.12)'},
  }
  const c = cfg[status]
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider" style={{background:c.bg,color:c.color,border:`1px solid ${c.color}30`}}>
        <span className={`w-2 h-2 rounded-full ${status==='open'?'status-live':''}`} style={{background:c.color}}/>
        {c.label}
      </div>
      <span className="text-xs text-gray-500 font-mono hidden sm:block">{time}</span>
    </div>
  )
}

function TickerBar({quotes}:{quotes:Quote[]}) {
  if(!quotes.length) return <div className="h-9 bg-[#080c10] border-b border-[#1c2430] flex items-center px-4"><span className="text-xs text-gray-500 animate-pulse">Loading market data...</span></div>
  const items=[...quotes,...quotes]
  return (
    <div className="h-9 bg-[#080c10] border-b border-[#1c2430] ticker-wrapper flex items-center" style={{borderTop:'1px solid #1c2430'}}>
      <div className="ticker-track">
        {items.map((q,i)=>{
          const up=isPos(q.changePercent)
          return (
            <span key={i} className="inline-flex items-center gap-2 px-5 text-xs border-r border-[#1c2430]" style={{minWidth:'max-content'}}>
              <span className="font-bold tracking-wide" style={{fontFamily:"'IBM Plex Mono'"}}>{q.symbol}</span>
              <span className="text-gray-300">${q.price}</span>
              <span className={up?'text-green-400':'text-red-400'}>{up?'▲':'▼'} {q.changePercent}%</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchVal, setSearchVal] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [tr, nr] = await Promise.all([fetch('/api/ticker'), fetch('/api/news')])
      const [td, nd] = await Promise.all([tr.json(), nr.json()])
      if(td.quotes) setQuotes(td.quotes)
      if(nd.articles) setNews(nd.articles)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch(e){console.error(e)}
    finally{setLoading(false)}
  },[])

  useEffect(()=>{ fetchData(); const id=setInterval(fetchData,60000); return()=>clearInterval(id) },[fetchData])

  const filteredNews = news.filter(n => {
    const tm = activeTab==='all'?true:activeTab==='macro'?['Macro','Markets'].includes(n.category):activeTab==='earnings'?n.category==='Earnings':activeTab==='global'?n.category==='Global':n.category==='Crypto'
    return tm && (searchVal===''||n.title.toLowerCase().includes(searchVal.toLowerCase()))
  })

  return (
    <div className="min-h-screen" style={{background:'#080c10'}}>
      {/* Header */}
      <header style={{background:'#0d1117',borderBottom:'1px solid #1c2430'}}>
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{background:'linear-gradient(135deg,#3fb950,#1a7f37)'}}><BarChart2 size={16} className="text-white"/></div>
            <span className="font-black tracking-tight text-lg" style={{fontFamily:"'Barlow Condensed'"}}>THE <span style={{color:'#3fb950'}}>STOCK</span>411</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {[['/', 'Markets'],['/earnings','Earnings'],['/screener','Screener']].map(([href,label])=>(
              <Link key={href} href={href} className={`px-3 py-1.5 text-sm rounded transition-colors ${href==='/'?'text-white bg-white/8':'text-gray-400 hover:text-white hover:bg-white/5'}`}>{label}</Link>
            ))}
          </nav>
          <div className="flex-1"/>
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
            <input type="text" placeholder="Search ticker, news..." value={searchVal} onChange={e=>setSearchVal(e.target.value)} className="pl-8 pr-4 py-1.5 text-sm rounded-lg w-56 focus:outline-none focus:ring-1 focus:ring-green-500" style={{background:'#161b22',border:'1px solid #30363d',color:'#e6edf3'}}/>
          </div>
          <MarketStatus/>
          <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 hidden sm:flex"><Bell size={18}/></button>
        </div>
      </header>

      <TickerBar quotes={quotes}/>

      {/* Index strip */}
      <div style={{background:'#0d1117',borderBottom:'1px solid #1c2430'}}>
        <div className="max-w-screen-2xl mx-auto overflow-x-auto">
          <div className="flex min-w-max">
            {INDICES.map(idx=>(
              <div key={idx.label} className="flex-1 min-w-[110px] px-4 py-2.5 border-r border-[#1c2430] last:border-0 hover:bg-[#0d1117] transition-colors">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{idx.label}</div>
                <div className="font-bold text-sm" style={{fontFamily:"'IBM Plex Mono'"}}>{idx.price}</div>
                <div className={`text-[11px] font-medium ${idx.up?'text-green-400':'text-red-400'}`}>{idx.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* News feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black uppercase tracking-wider" style={{fontFamily:"'Barlow Condensed'"}}>
                <Newspaper size={16} className="inline mr-2 text-green-400"/>Market Intelligence
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <RefreshCw size={12} className={loading?'animate-spin':''}/>
                {lastUpdated?`Updated ${lastUpdated}`:'Loading...'}
              </div>
            </div>

            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {(['all','macro','earnings','global','crypto'] as const).map(tab=>(
                <button key={tab} onClick={()=>setActiveTab(tab)} className={`px-3 py-1.5 text-xs rounded-full font-semibold uppercase tracking-wide whitespace-nowrap transition-all ${activeTab===tab?'text-black':'text-gray-400 hover:text-white'}`} style={activeTab===tab?{background:'#3fb950'}:{background:'#161b22',border:'1px solid #30363d'}}>
                  {tab==='all'?'⚡ All':tab==='macro'?'📊 Macro':tab==='earnings'?'💰 Earnings':tab==='global'?'🌍 Global':'₿ Crypto'}
                </button>
              ))}
            </div>

            {loading?(
              <div className="rounded-lg p-5 mb-3 animate-pulse" style={{background:'#0d1117',border:'1px solid #1c2430',height:180}}/>
            ):filteredNews[0]?(
              <div className="news-card rounded-lg p-5 mb-3" style={{background:'#0d1117',border:'1px solid #1c2430'}}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider" style={{background:`${CAT_COLORS[filteredNews[0].category]||'#7d8590'}20`,color:CAT_COLORS[filteredNews[0].category]||'#7d8590'}}>{filteredNews[0].category}</span>
                  <span className="text-xs text-gray-500">{filteredNews[0].source}</span>
                  <span className="text-xs text-gray-600 ml-auto flex items-center gap-1"><Clock size={10}/>{timeAgo(filteredNews[0].time)}</span>
                </div>
                <h3 className="font-bold leading-snug mb-2" style={{fontFamily:"'Barlow Condensed'",fontSize:'18px'}}>{filteredNews[0].title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{filteredNews[0].summary}</p>
                <div className="mt-3 flex items-center text-xs text-green-400 font-medium gap-1">Read full story<ChevronRight size={12}/></div>
              </div>
            ):null}

            <div className="space-y-0.5">
              {loading?Array.from({length:6}).map((_,i)=>(
                <div key={i} className="py-3 px-3 rounded animate-pulse" style={{background:'#0d111720'}}>
                  <div className="h-4 rounded w-3/4 mb-2" style={{background:'#1c2430'}}/>
                  <div className="h-3 rounded w-1/4" style={{background:'#1c2430'}}/>
                </div>
              )):filteredNews.slice(1).map(item=>(
                <div key={item.id} className="news-card py-3 px-3 rounded">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5" style={{background:`${CAT_COLORS[item.category]||'#7d8590'}15`,color:CAT_COLORS[item.category]||'#7d8590'}}>{item.category}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug text-gray-200 line-clamp-2">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-500">{item.source}</span>
                        <span className="text-[11px] text-gray-600">{timeAgo(item.time)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 xl:col-span-2 space-y-6">

            {/* Top Movers */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black uppercase tracking-wider" style={{fontFamily:"'Barlow Condensed'"}}><Activity size={14} className="inline mr-2 text-amber-400"/>Top Movers</h2>
                <Link href="/screener" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">View all<ChevronRight size={12}/></Link>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
                {MOVERS.map(m=>(
                  <div key={m.symbol} className="p-3 rounded-lg" style={{background:'#0d1117',border:'1px solid #1c2430'}}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-sm" style={{fontFamily:"'IBM Plex Mono'"}}>{m.symbol}</div>
                        <div className="text-[11px] text-gray-500">{m.name}</div>
                      </div>
                      <div className={`text-sm font-bold ${m.up?'text-green-400':'text-red-400'} flex items-center gap-0.5`}>
                        {m.up?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>}{m.pct}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={36}>
                      <LineChart data={spark(m.up)}>
                        <Line type="monotone" dataKey="v" stroke={m.up?'#3fb950':'#f85149'} strokeWidth={1.5} dot={false}/>
                        <YAxis domain={['auto','auto']} hide/>
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[11px] text-gray-600">Live</span>
                      <span className="text-[11px] font-mono text-gray-300">${m.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Global Markets */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black uppercase tracking-wider" style={{fontFamily:"'Barlow Condensed'"}}><Globe size={14} className="inline mr-2 text-blue-400"/>Global Markets</h2>
              </div>
              <div className="rounded-lg overflow-hidden" style={{border:'1px solid #1c2430'}}>
                {GLOBAL.map((m,i)=>(
                  <div key={m.name} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#1c2430]/40 transition-colors" style={{borderBottom:i<GLOBAL.length-1?'1px solid #1c2430':'none'}}>
                    <div>
                      <div className="text-sm font-semibold">{m.name}</div>
                      <div className="text-[11px] text-gray-500">{m.region}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-medium">{m.value}</div>
                      <div className={`text-xs font-semibold ${m.up?'text-green-400':'text-red-400'}`}>{m.up?'▲':'▼'} {m.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sector Performance */}
            <section>
              <h2 className="text-base font-black uppercase tracking-wider mb-3" style={{fontFamily:"'Barlow Condensed'"}}><TrendingUp size={14} className="inline mr-2 text-green-400"/>Sector Performance</h2>
              <div className="space-y-2">
                {[{name:'Technology',pct:1.42,up:true},{name:'Energy',pct:-1.51,up:false},{name:'Financials',pct:0.55,up:true},{name:'Healthcare',pct:0.22,up:true},{name:'Consumer Disc.',pct:-0.38,up:false},{name:'Industrials',pct:0.61,up:true},{name:'Real Estate',pct:-0.19,up:false},{name:'Materials',pct:0.44,up:true}].map(s=>(
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-32 shrink-0">{s.name}</span>
                    <div className="flex-1 h-5 rounded overflow-hidden" style={{background:'#161b22'}}>
                      <div className="h-full rounded flex items-center justify-end pr-2 text-[10px] font-bold text-white" style={{width:`${Math.min(Math.abs(s.pct)*20,100)}%`,background:s.up?'linear-gradient(90deg,#1a7f3720,#3fb950)':'linear-gradient(90deg,#6e1b1820,#f85149)',minWidth:48}}>
                        {s.up?'+':''}{s.pct}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Newsletter CTA */}
            <section className="rounded-xl p-5" style={{background:'linear-gradient(135deg,#0d1117 0%,#0f1f0f 100%)',border:'1px solid #2d4a2d'}}>
              <div className="flex items-center gap-2 mb-2"><Zap size={16} className="text-green-400"/><span className="text-xs font-bold uppercase tracking-widest text-green-400">FREE NEWSLETTER</span></div>
              <h3 className="font-black text-lg mb-1" style={{fontFamily:"'Barlow Condensed'"}}>The Stock411 Daily Brief</h3>
              <p className="text-sm text-gray-400 mb-4">Pre-market intelligence, top movers, and macro signals every morning at 8 AM ET.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="your@email.com" className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" style={{background:'#161b22',border:'1px solid #30363d',color:'#e6edf3'}}/>
                <button className="px-4 py-2 text-sm font-bold rounded-lg text-black transition-all hover:brightness-110" style={{background:'#3fb950'}}>Subscribe</button>
              </div>
            </section>

            {/* Trending */}
            <section>
              <h2 className="text-base font-black uppercase tracking-wider mb-3" style={{fontFamily:"'Barlow Condensed'"}}><Star size={14} className="inline mr-2 text-amber-400"/>Trending Now</h2>
              <div className="flex flex-wrap gap-2">
                {['NVDA','AAPL','TSLA','SPY','QQQ','AMD','META','BTC-USD','MSFT','PLTR','COIN','GLD','ARKK','AMZN','LLY'].map(t=>(
                  <a key={t} href="#" className="px-2.5 py-1 text-xs rounded font-mono font-medium hover:text-white transition-colors" style={{background:'#161b22',border:'1px solid #30363d',color:'#7d8590'}}>{t}</a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{borderTop:'1px solid #1c2430',background:'#0d1117'}}>
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6">
            <p className="text-xs text-gray-600 mb-2 sm:mb-0">© 2025 TheStock411.com · Data delayed 15 min · Not financial advice</p>
            <div className="flex gap-4 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-400">Privacy</a>
              <a href="#" className="hover:text-gray-400">Terms</a>
              <a href="#" className="hover:text-gray-400">Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
