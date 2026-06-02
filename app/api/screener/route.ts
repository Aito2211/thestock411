import { NextResponse } from 'next/server'

export interface Stock {
  symbol: string; name: string; price: number; change: number; changePct: number
  volume: number; avgVolume: number; mktCap: number; pe: number|null; eps: number|null
  week52High: number; week52Low: number; sector: string; industry: string; beta: number
  dividendYield: number|null; revenueGrowth: number|null; grossMargin: number|null
  roe: number|null; debtToEquity: number|null; analystRating: string; priceTarget: number|null
}

const STOCKS: Stock[] = [
  { symbol:'AAPL', name:'Apple Inc.', price:213.32, change:2.14, changePct:1.01, volume:54200000, avgVolume:58000000, mktCap:3200, pe:33.2, eps:6.42, week52High:237.23, week52Low:164.08, sector:'Technology', industry:)Consumer Electronics', beta:1.24, dividendYield:0.44, revenueGrowth:2.1, grossMargin:45.2, roe:147.2, debtToEquity:1.87, analystRating:'Buy', priceTarget:240 },
  { symbol:'MSFT', name:'Microsoft Corp.', price:447.89, change:5.67, changePct:1.28, volume:19800000, avgVolume:22000000, mktCap:3330, pe:37.8, eps:11.84, week52High:468.35, week52Low:309.45, sector:'Technology', industry:'Software', beta:0.90, dividendYield:0.68, revenueGrowth:17.6, grossMargin:69.4, roe:38.2, debtToEquity:0.34, analystRating:'Strong Buy', priceTarget:510 },
  { symbol:'NVDA', name:'NVIDIA Corp.', price:134.76, change:4.32, changePct:3.31, volume:342000000, avgVolume:280000000, mktCap:3310, pe:65.4, eps:2.06, week52High:153.13, week52Low:39.23, sector:'Technology', industry:)Semiconductors', beta:1.66, dividendYield:0.03, revenueGrowth:262.0, grossMargin:73.8, roe:91.4, debtToEquity:0.41, analystRating:'Strong Buy', priceTarget:165 },
  { symbol:'TSLA', name:'Tesla Inc.', price:248.91, change:-6.44, changePct:-2.52, volume:198000000, avgVolume:130000000, mktCap:793, pe:65.8, eps:3.78, week52High:271.00, week52Low:138.80, sector:'Consumer Disc.', industry:'Electric Vehicles', beta:2.31, dividendYield:null, revenueGrowth:-9.0, grossMargin:17.8, roe:11.2, debtToEquity:0.09, analystRating:'Hold', priceTarget:200 },
  { symbol:'JPM', name:'JPMorgan Chase', price:223.14, change:1.23, changePct:0.55, volume:8400000, avgVolume:9200000, mktCap:640, pe:12.4, eps:18.00, week52High:232.22, week52Low:137.00, sector:'Financials', industry:'Banks', beta:1.10, dividendYield:2.24, revenueGrowth:22.1, grossMargin:null, roe:17.4, debtToEquity:null, analystRating:'Buy', priceTarget:240 },
  { symbol:'AMD', name:'Advanced Micro Devices', price:164.23, change:5.67, changePct:3.58, volume:89000000, avgVolume:62000000, mktCap:266, pe:308.0, eps:0.53, week52High:227.30, week52Low:93.12, sector:'Technology', industry:)Semiconductors', beta:1.68, dividendYield:null, revenueGrowth:2.6, grossMargin:46.1, roe:1.4, debtToEquity:0.03, analystRating:'Buy', priceTarget:210 },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sector = searchParams.get('sector') || 'all'
  const sortBy = searchParams.get('sortBy') || 'mktCap'
  const sortDir = searchParams.get('sortDir') || 'desc'
  const minPrice = parseFloat(searchParams.get('minPrice') || '0')
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
  const rating = searchParams.get('rating') || 'all'
  const query = searchParams.get('q') || ''
  let filtered = STOCKS.filter(s => {
    if (sector !== 'all' && s.sector !== sector) return false
    if (s.price < minPrice || s.price > maxPrice) return false
    if (rating !== 'all' && s.analystRating !== rating) return false
    if (query && !s.symbol.toLowerCase().includes(query.toLowerCase()) && !s.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })
  filtered.sort((a, b) => {
    const av = ([a[sortBy] as number) ?? -Infinity
    const bv = ([b[sortBy] as number) ?? -Infinity
    return sortDir === 'desc' ? bv - av : av - bv
  })
  return NextResponse.json({ stocks: filtered, total: filtered.length })
}
