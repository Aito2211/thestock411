import { NextResponse } from 'next/server'

const KEY = process.env.FINNHUB_API_KEY || ''
const BASE = 'https://finnhub.io/api/v1'

function getMonday(offset: number): Date {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  d.setHours(0,0,0,0)
  return d
}
function fmt(d: Date) { return d.toISOString().split('T')[0] }

function mockEarnings(start: Date) {
  const cos = [
    { symbol:'AAPL', name:'Apple Inc.', time:'AMC', mktCap:'$3.2T', sector:'Technology' },
    { symbol:'MSFT', name:'Microsoft Corp.', time:'AMC', mktCap:'$3.3T', sector:'Technology' },
    { symbol:'NVDA', name:'NVIDIA Corp.', time:'AMC', mktCap:'$2.8T', sector:'Technology' },
    { symbol:'GOOGL', name:'Alphabet Inc.', time:'AMC', mktCap:'$2.1T', sector:'Technology' },
    { symbol:'AMZN', name:'Amazon.com', time:'AMC', mktCap:'$1.9T', sector:'Technology' },
    { symbol:'META', name:'Meta Platforms', time:'AMC', mktCap:'$1.3T', sector:'Technology' },
    { symbol:'TSLA', name:'Tesla Inc.', time:'AMC', mktCap:'$780B', sector:'Consumer Disc.' },
    { symbol:'JPM', name:'JPMorgan Chase', time:'BMO', mktCap:'$570B', sector:'Financials' },
  ]
  return cos.map((co, i) => {
    const d = new Date(start); d.setDate(d.getDate() + (i % 5))
    return { ...co, date: fmt(d), epsEstimate: parseFloat((Math.random()*3+0.5).toFixed(2)), epsActual: null, surprise: null, status:'upcoming' }
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekOffset = parseInt(searchParams.get('week') || '0')
  const start = getMonday(weekOffset)
  const end = new Date(start); end.setDate(end.getDate() + 4)
  if (!KEY) return NextResponse.json({ earnings: mockEarnings(start), weekStart: fmt(start) })
  try {
    const r = await fetch(`${BASE}/calendar/earnings?from=${fmt(start)}&to=${fmt(end)}&token=${KEY}`, { next: { revalidate: 3600 } })
    const data = r.ok ? await r.json() : {}
    const raw = (data.earningsCalendar || []).slice(0, 50)
    const earnings = raw.map((e: Record<string,unknown>) => ({
      symbol: e.symbol as string, name: e.symbol as string,
      date: e.date as string,
      time: e.hour === 'bmo' ? 'BMO' : 'AMC',
      epsEstimate: e.epsEstimate ?? null, epsActual: e.epsActual ?? null,
      surprise: e.surprisePercent ?? null,
      mktCap: '', sector: '',
      status: e.epsActual !== null ? 'reported' : 'upcoming',
    }))
    return NextResponse.json({ earnings: earnings.length > 0 ? earnings : mockEarnings(start), weekStart: fmt(start) })
  } catch {
    return NextResponse.json({ earnings: mockEarnings(start), weekStart: fmt(start) })
  }
}