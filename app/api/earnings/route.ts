import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekOffset = parseInt(searchParams.get('week') || '0')
  const today = new Date()
  const baseDate = new Date(today)
  baseDate.setDate(today.getDate() + weekOffset * 7)
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() - baseDate.getDay() + 1)
  function d(o: number) { const dt = new Date(monday); dt.setDate(monday.getDate() + o); return dt.toISOString().split('T')[0] }
  const earnings = [
    { symbol: 'AAPL', name: 'Apple Inc.', date: d(0), time: 'AMC', epsEstimate: 1.35, epsActual: null, revenueEstimate: 94200, revenueActual: null, surprise: null, mktCap: '$3.2T', sector: 'Technology', status: 'upcoming' },
    { symbol: 'CAT', name: 'Caterpillar', date: d(0), time: 'BMO', epsEstimate: 5.12, epsActual: 5.34, revenueEstimate: 16800, revenueActual: 17100, surprise: 4.3, mktCap: '$164B', sector: 'Industrials', status: 'reported' },
    { symbol: 'MSFT', name: 'Microsoft', date: d(1), time: 'AMC', epsEstimate: 3.10, epsActual: null, revenueEstimate: 64400, revenueActual: null, surprise: null, mktCap: '$3.3T', sector: 'Technology', status: 'upcoming' },
    { symbol: 'GOOGL', name: 'Alphabet', date: d(1), time: 'AMC', epsEstimate: 1.84, epsActual: null, revenueEstimate: 89100, revenueActual: null, surprise: null, mktCap: '$2.3T', sector: 'Technology', status: 'upcoming' },
    { symbol: 'V', name: 'Visa Inc.', date: d(1), time: 'AMC', epsEstimate: 2.43, epsActual: 2.51, revenueEstimate: 9200, revenueActual: 9440, surprise: 3.3, mktCap: '$545B', sector: 'Financials', status: 'reported' },
    { symbol: 'META', name: 'Meta Platforms', date: d(2), time: 'AMC', epsEstimate: 4.72, epsActual: null, revenueEstimate: 38700, revenueActual: null, surprise: null, mktCap: '$1.4T', sector: 'Technology', status: 'upcoming' },
    { symbol: 'AMZN', name: 'Amazon', date: d(2), time: 'AMC', epsEstimate: 1.03, epsActual: null, revenueEstimate: 148500, revenueActual: null, surprise: null, mktCap: '$2.0T', sector: 'Consumer Disc.', status: 'upcoming' },
    { symbol: 'NVDA', name: 'NVIDIA', date: d(3), time: 'AMC', epsEstimate: 0.59, epsActual: null, revenueEstimate: 24200, revenueActual: null, surprise: null, mktCap: '$3.3T', sector: 'Technology', status: 'upcoming' },
    { symbol: 'XOM', name: 'Exxon', date: d(4), time: 'BMO', epsEstimate: 2.01, epsActual: 2.14, revenueEstimate: 88400, revenueActual: 90200, surprise: 6.5, mktCap: '$518B', sector: 'Energy', status: 'reported' },
  ]
  return NextResponse.json({ earnings, weekStart: monday.toISOString().split('T')[0] })
}
