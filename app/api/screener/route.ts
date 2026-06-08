import { NextResponse } from 'next/server'

const KEY = process.env.FINNHUB_API_KEY || ''
const BASE = 'https://finnhub.io/api/v1'

const DEFAULTS = [
  'AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA','JPM',
  'V','JNJ','LLY','AMD','PLTR','COIN','QQQ','SPY','IWM',
  'GLD','ARKK','SOFI','RIVN','DIA','VTI','NFLX','UBER'
]

async function fh(path: string) {
  try {
    const r = await fetch(`${BASE}${path}&token=${KEY}`, { next: { revalidate: 60 } })
    return r.ok ? r.json() : {}
  } catch { return {} }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q       = (searchParams.get('q') || '').trim().toUpperCase()
  const sector  = searchParams.get('sector') || 'all'
  const rating  = searchParams.get('rating') || 'all'
  const sortBy  = searchParams.get('sortBy') || 'mktCap'
  const sortDir = searchParams.get('sortDir') || 'desc'
  const minP    = parseFloat(searchParams.get('minPrice') || '0')
  const maxP    = parseFloat(searchParams.get('maxPrice') || '999999')

  if (!KEY) return NextResponse.json({ stocks: [], error: 'API key not set' })

  let symbols: string[] = DEFAULTS

  if (q) {
    const searchData = await fh(`/search?q=${encodeURIComponent(q)}`)
    const hits = (searchData.result || [])
      .filter((r: { displaySymbol?: string }) => r.displaySymbol && !r.displaySymbol.includes('.'))
      .slice(0, 12)
      .map((r: { displaySymbol: string }) => r.displaySymbol)
    symbols = hits.length > 0 ? hits : DEFAULTS.filter(s => s.includes(q))
  }

  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const [quote, profile] = await Promise.all([
        fh(`/quote?symbol=${symbol}`),
        fh(`/stock/profile2?symbol=${symbol}`)
      ])
      return { symbol, quote, profile }
    })
  )

  const stocks = results
    .filter((r): r is PromiseFulfilledResult<{symbol:string,quote:Record<string,number>,profile:Record<string,unknown>}> => r.status === 'fulfilled')
    .map(({ value: { symbol, quote, profile } }) => {
      if (!quote?.c || quote.c <= 0) return null
      return {
        symbol,
        name: (profile.name as string) || symbol,
        price: quote.c,
        change: quote.d ?? 0,
        changePct: quote.dp ?? 0,
        volume: 5000000,
        mktCap: (profile.marketCapitalization as number) ?? 0,
        pe: (profile.peRatio as number) || null,
        eps: null,
        week52High: quote.h || quote.c * 1.2,
        week52Low: quote.l || quote.c * 0.8,
        sector: (profile.finnhubIndustry as string) || 'Unknown',
        industry: (profile.finnhubIndustry as string) || 'Unknown',
        beta: (profile.beta as number) || 1,
        dividendYield: null,
        revenueGrowth: null,
        grossMargin: null,
        roe: null,
        analystRating: 'Hold',
        priceTarget: null,
      }
    })
    .filter(Boolean)
    .filter((s: Record<string,unknown>) => (s.price as number) >= minP && (s.price as number) <= maxP)
    .filter((s: Record<string,unknown>) => sector === 'all' || s.sector === sector)
    .filter((s: Record<string,unknown>) => rating === 'all' || s.analystRating === rating)
    .sort((a: Record<string,unknown>, b: Record<string,unknown>) => {
      const av = (a[sortBy] as number) ?? 0
      const bv = (b[sortBy] as number) ?? 0
      return sortDir === 'desc' ? bv - av : av - bv
    })

  return NextResponse.json({ stocks, total: stocks.length })
}