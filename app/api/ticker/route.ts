import { NextResponse } from 'next/server'

const KEY = process.env.FINNHUB_API_KEY || ''
const BASE = 'https://finnhub.io/api/v1'

const TICKERS = [
  { symbol:'AAPL', name:'Apple' }, { symbol:'MSFT', name:'Microsoft' },
  { symbol:'NVDA', name:'NVIDIA' }, { symbol:'GOOGL', name:'Alphabet' },
  { symbol:'AMZN', name:'Amazon' }, { symbol:'META', name:'Meta' },
  { symbol:'TSLA', name:'Tesla' }, { symbol:'JPM', name:'JPMorgan' },
  { symbol:'AMD', name:'AMD' }, { symbol:'PLTR', name:'Palantir' },
  { symbol:'SPY', name:'S&P 500 ETF' }, { symbol:'QQQ', name:'Nasdaq ETF' },
  { symbol:'NFLX', name:'Netflix' }, { symbol:'UBER', name:'Uber' },
  { symbol:'LLY', name:'Eli Lilly' },
]

export async function GET() {
  if (!KEY) {
    const fallback = TICKERS.map(({ symbol, name }) => ({
      symbol, name,
      price: (Math.random() * 400 + 50).toFixed(2),
      change: ((Math.random() - 0.5) * 10).toFixed(2),
      changePercent: ((Math.random() - 0.5) * 3).toFixed(2),
    }))
    return NextResponse.json({ quotes: fallback })
  }
  try {
    const quotes = await Promise.all(
      TICKERS.map(async ({ symbol, name }) => {
        const r = await fetch(`${BASE}/quote?symbol=${symbol}&token=${KEY}`, { next: { revalidate: 30 } })
        const q = r.ok ? await r.json() : {}
        return {
          symbol, name,
          price: (q.c || 0).toFixed(2),
          change: (q.d || 0).toFixed(2),
          changePercent: (q.dp || 0).toFixed(2),
        }
      })
    )
    const valid = quotes.filter(q => parseFloat(q.price) > 0)
    return NextResponse.json({ quotes: valid })
  } catch {
    return NextResponse.json({ quotes: [] })
  }
}