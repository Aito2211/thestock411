import { NextResponse } from 'next/server'

const KEY = process.env.FINNHUB_API_KEY || ''
const BASE = 'https://finnhub.io/api/v1'

function mapCategory(cat: string, headline: string): string {
  const h = headline.toLowerCase()
  if (h.includes('earn') || h.includes('eps') || h.includes('revenue') || h.includes('beat') || h.includes('miss')) return 'Earnings'
  if (h.includes('fed') || h.includes('rate') || h.includes('inflation') || h.includes('gdp') || h.includes('cpi')) return 'Macro'
  if (h.includes('crypto') || h.includes('bitcoin') || h.includes('btc') || h.includes('ethereum') || h.includes('eth')) return 'Crypto'
  if (h.includes('china') || h.includes('europe') || h.includes('global') || h.includes('japan') || h.includes('world')) return 'Global'
  if (h.includes('tech') || h.includes('ai ') || h.includes('chip') || h.includes('nvidia') || h.includes('software')) return 'Tech'
  if (cat === 'crypto') return 'Crypto'
  return 'Markets'
}

const MOCK = [
  { id:'1', title:'Fed Signals Rate Cuts as Inflation Cools', summary:'Federal Reserve officials hinted at rate reductions as CPI data came in below expectations.', source:'Reuters', time: new Date(Date.now()-480000).toISOString(), category:'Macro', url:'https://finance.yahoo.com/news/', sentiment:'positive' },
  { id:'2', title:'NVIDIA Smashes Earnings, Stock Surges After-Hours', summary:'AI chipmaker NVIDIA reported revenue up 262% YoY as data center sales hit record highs.', source:'Bloomberg', time: new Date(Date.now()-1320000).toISOString(), category:'Earnings', url:'https://finance.yahoo.com/news/', sentiment:'positive' },
  { id:'3', title:'S&P 500 Hits New All-Time High Amid Tech Rally', summary:'The benchmark index crossed 5,500 as semiconductor and AI stocks led broad market gains.', source:'CNBC', time: new Date(Date.now()-2400000).toISOString(), category:'Markets', url:'https://finance.yahoo.com/news/', sentiment:'positive' },
  { id:'4', title:'Tesla Deliveries Miss Estimates for Third Quarter', summary:'EV maker reported quarterly deliveries below Wall Street expectations amid rising competition.', source:'WSJ', time: new Date(Date.now()-3600000).toISOString(), category:'Earnings', url:'https://finance.yahoo.com/news/', sentiment:'negative' },
  { id:'5', title:'Bitcoin Surges Past $70,000 on ETF Inflows', summary:'BTC hit new highs as spot Bitcoin ETFs recorded record daily inflows of $1.2 billion.', source:'CoinDesk', time: new Date(Date.now()-5400000).toISOString(), category:'Crypto', url:'https://finance.yahoo.com/crypto/', sentiment:'positive' },
  { id:'6', title:'Oil Prices Drop on Rising US Inventory Data', summary:'WTI crude fell 2% after EIA reported a larger-than-expected build in US oil inventories.', source:'Reuters', time: new Date(Date.now()-7200000).toISOString(), category:'Markets', url:'https://finance.yahoo.com/news/', sentiment:'negative' },
]

export async function GET() {
  if (!KEY) return NextResponse.json({ articles: MOCK })
  try {
    const [gen, crypto] = await Promise.all([
      fetch(`${BASE}/news?category=general&token=${KEY}`, { next: { revalidate: 300 } }).then(r => r.ok ? r.json() : []),
      fetch(`${BASE}/news?category=crypto&token=${KEY}`, { next: { revalidate: 300 } }).then(r => r.ok ? r.json() : [])
    ])
    const combined = [...(Array.isArray(gen) ? gen : []).slice(0,15), ...(Array.isArray(crypto) ? crypto : []).slice(0,5)]
    const articles = combined
      .filter((item: Record<string,unknown>) => item.headline && item.url && item.url !== '')
      .slice(0, 18)
      .map((item: Record<string,unknown>, i: number) => ({
        id: String(i + 1),
        title: item.headline as string,
        summary: (item.summary as string) || (item.headline as string),
        source: (item.source as string) || 'Financial News',
        time: new Date((item.datetime as number) * 1000).toISOString(),
        category: mapCategory((item.category as string) || 'general', item.headline as string),
        url: item.url as string,
        sentiment: 'neutral',
      }))
    return NextResponse.json({ articles: articles.length > 0 ? articles : MOCK })
  } catch {
    return NextResponse.json({ articles: MOCK })
  }
}