import { NextResponse } from 'next/server'

const STOCKS = [
  { symbol:'AAPL', name:'Apple Inc.', price:213.32, change:2.14, changePct:1.01, volume:54200000, avgVolume:58000000, mktCap:3200, pe:33.2, eps:6.42, week52High:237.23, week52Low:164.08, sector:'Technology', industry:'Consumer Electronics', beta:1.24, dividendYield:0.44, revenueGrowth:2.1, grossMargin:45.2, roe:147.2, debtToEquity:1.87, analystRating:'Buy', priceTarget:240 },
  { symbol:'MSFT', name:'Microsoft Corp.', price:447.89, change:5.67, changePct:1.28, volume:19800000, avgVolume:22000000, mktCap:3330, pe:37.8, eps:11.84, week52High:468.35, week52Low:309.45, sector:'Technology', industry:'Software', beta:0.90, dividendYield:0.68, revenueGrowth:17.6, grossMargin:69.4, roe:38.2, debtToEquity:0.34, analystRating:'Strong Buy', priceTarget:510 },
  { symbol:'NVDA', name:'NVIDIA Corp.', price:134.76, change:4.32, changePct:3.31, volume:342000000, avgVolume:280000000, mktCap:3310, pe:65.4, eps:2.06, week52High:153.13, week52Low:39.23, sector:'Technology', industry:'Semiconductors', beta:1.66, dividendYield:0.03, revenueGrowth:262.0, grossMargin:73.8, roe:91.4, debtToEquity:0.41, analystRating:'Strong Buy', priceTarget:165 },
  { symbol:'GOOGL', name:'Alphabet Inc.', price:187.34, change:-0.98, changePct:-0.52, volume:22100000, avgVolume:25000000, mktCap:2310, pe:27.6, eps:6.79, week52High:193.31, week52Low:119.92, sector:'Technology', industry:'Internet Services', beta:1.03, dividendYield:null, revenueGrowth:14.8, grossMargin:56.9, roe:27.4, debtToEquity:0.07, analystRating:'Strong Buy', priceTarget:215 },
  { symbol:'AMZN', name:'Amazon.com Inc.', price:198.12, change:1.88, changePct:0.96, volume:37400000, avgVolume:40000000, mktCap:2040, pe:55.8, eps:3.55, week52High:201.20, week52Low:101.26, sector:'Consumer Disc.', industry:'E-Commerce', beta:1.14, dividendYield:null, revenueGrowth:12.5, grossMargin:47.9, roe:22.4, debtToEquity:0.53, analystRating:'Strong Buy', priceTarget:230 },
  { symbol:'META', name:'Meta Platforms', price:562.44, change:8.23, changePct:1.49, volume:14200000, avgVolume:16000000, mktCap:1430, pe:29.1, eps:19.33, week52High:589.29, week52Low:279.40, sector:'Technology', industry:'Social Media', beta:1.22, dividendYield:0.36, revenueGrowth:27.3, grossMargin:81.4, roe:35.6, debtToEquity:0.14, analystRating:'Strong Buy', priceTarget:650 },
  { symbol:'TSLA', name:'Tesla Inc.', price:248.91, change:-6.44, changePct:-2.52, volume:198000000, avgVolume:130000000, mktCap:793, pe:65.8, eps:3.78, week52High:271.00, week52Low:138.80, sector:'Consumer Disc.', industry:'Electric Vehicles', beta:2.31, dividendYield:null, revenueGrowth:-9.0, grossMargin:17.8, roe:11.2, debtToEquity:0.09, analystRating:'Hold', priceTarget:200 },
  { symbol:'JPM', name:'JPMorgan Chase', price:223.14, change:1.23, changePct:0.55, volume:8400000, avgVolume:9200000, mktCap:640, pe:12.4, eps:18.00, week52High:232.22, week52Low:137.00, sector:'Financials', industry:'Banks', beta:1.10, dividendYield:2.24, revenueGrowth:22.1, grossMargin:null, roe:17.4, debtToEquity:null, analystRating:'Buy', priceTarget:240 },
  { symbol:'AMD', name:'Advanced Micro Devices', price:164.23, change:5.67, changePct:3.58, volume:89000000, avgVolume:62000000, mktCap:266, pe:308.0, eps:0.53, week52High:227.30, week52Low:93.12, sector:'Technology', industry:'Semiconductors', beta:1.68, dividendYield:null, revenueGrowth:2.6, grossMargin:46.1, roe:1.4, debtToEquity:0.03, analystRating:'Buy', priceTarget:210 },
  { symbol:'NFLX', name:'Netflix Inc.', price:698.45, change:12.34, changePct:1.80, volume:4900000, avgVolume:4200000, mktCap:304, pe:44.3, eps:15.77, week52High:711.33, week52Low:344.73, sector:'Communication', industry:'Streaming', beta:1.28, dividendYield:null, revenueGrowth:14.8, grossMargin:42.5, roe:32.8, debtToEquity:0.56, analystRating:'Buy', priceTarget:750 },
  { symbol:'LLY', name:'Eli Lilly & Co.', price:877.34, change:14.22, changePct:1.65, volume:3200000, avgVolume:3600000, mktCap:835, pe:102.4, eps:8.57, week52High:972.52, week52Low:523.49, sector:'Healthcare', industry:'Pharmaceuticals', beta:0.44, dividendYield:0.55, revenueGrowth:28.3, grossMargin:80.2, roe:78.4, debtToEquity:1.88, analystRating:'Strong Buy', priceTarget:1050 },
  { symbol:'WMT', name:'Walmart Inc.', price:67.88, change:0.34, changePct:0.50, volume:14400000, avgVolume:12800000, mktCap:545, pe:31.4, eps:2.16, week52High:72.41, week52Low:49.85, sector:'Consumer Staples', industry:'Discount Retail', beta:0.56, dividendYield:1.21, revenueGrowth:5.7, grossMargin:24.7, roe:22.8, debtToEquity:0.71, analystRating:'Buy', priceTarget:75 },
  { symbol:'PLTR', name:'Palantir Technologies', price:32.44, change:0.88, changePct:2.79, volume:124000000, avgVolume:96000000, mktCap:69, pe:229.0, eps:0.14, week52High:35.89, week52Low:13.52, sector:'Technology', industry:'Software', beta:2.12, dividendYield:null, revenueGrowth:20.8, grossMargin:81.6, roe:7.8, debtToEquity:0.0, analystRating:'Hold', priceTarget:28 },
  { symbol:'COIN', name:'Coinbase Global', price:234.56, change:-4.32, changePct:-1.81, volume:67000000, avgVolume:14000000, mktCap:58, pe:null, eps:-0.42, week52High:283.77, week52Low:51.69, sector:'Financials', industry:'Crypto Exchange', beta:3.84, dividendYield:null, revenueGrowth:114.7, grossMargin:86.4, roe:null, debtToEquity:null, analystRating:'Hold', priceTarget:250 },

  { symbol:'QQQ', name:'Invesco QQQ Trust', price:466.32, change:3.21, changePct:0.69, volume:38000000, avgVolume:42000000, mktCap:205, pe:null, eps:null, week52High:503.52, week52Low:342.20, sector:'Technology', industry:'ETF', beta:1.18, dividendYield:0.55, revenueGrowth:null, grossMargin:null, roe:null, debtToEquity:null, analystRating:'Strong Buy', priceTarget:null },
  { symbol:'SPY', name:'SPDR S&P 500 ETF', price:548.77, change:2.14, changePct:0.39, volume:62000000, avgVolume:71000000, mktCap:504, pe:null, eps:null, week52High:613.23, week52Low:484.96, sector:'Financials', industry:'ETF', beta:1.00, dividendYield:1.28, revenueGrowth:null, grossMargin:null, roe:null, debtToEquity:null, analystRating:'Buy', priceTarget:null },
  { symbol:'IWM', name:'iShares Russell 2000 ETF', price:207.44, change:0.87, changePct:0.42, volume:28000000, avgVolume:32000000, mktCap:72, pe:null, eps:null, week52High:244.47, week52Low:185.68, sector:'Financials', industry:'ETF', beta:1.22, dividendYield:1.42, revenueGrowth:null, grossMargin:null, roe:null, debtToEquity:null, analystRating:'Buy', priceTarget:null },
  { symbol:'DIA', name:'SPDR Dow Jones ETF', price:434.88, change:1.67, changePct:0.39, volume:4200000, avgVolume:5100000, mktCap:35, pe:null, eps:null, week52High:455.73, week52Low:329.66, sector:'Financials', industry:'ETF', beta:0.91, dividendYield:1.72, revenueGrowth:null, grossMargin:null, roe:null, debtToEquity:null, analystRating:'Buy', priceTarget:null },
  { symbol:'GLD', name:'SPDR Gold Shares', price:234.21, change:0.84, changePct:0.36, volume:8900000, avgVolume:11000000, mktCap:73, pe:null, eps:null, week52High:246.04, week52Low:175.46, sector:'Commodities', industry:'ETF', beta:0.12, dividendYield:0, revenueGrowth:null, grossMargin:null, roe:null, debtToEquity:null, analystRating:'Buy', priceTarget:null },
  { symbol:'ARKK', name:'ARK Innovation ETF', price:53.44, change:1.22, changePct:2.34, volume:14000000, avgVolume:18000000, mktCap:11, pe:null, eps:null, week52High:67.44, week52Low:35.11, sector:'Technology', industry:'ETF', beta:1.88, dividendYield:0, revenueGrowth:null, grossMargin:null, roe:null, debtToEquity:null, analystRating:'Hold', priceTarget:null },
  { symbol:'VTI', name:'Vanguard Total Stock Market ETF', price:272.33, change:1.05, changePct:0.39, volume:3200000, avgVolume:3800000, mktCap:444, pe:null, eps:null, week52High:299.45, week52Low:224.37, sector:'Financials', industry:'ETF', beta:1.00, dividendYield:1.35, revenueGrowth:null, grossMargin:null, roe:null, debtToEquity:null, analystRating:'Strong Buy', priceTarget:null },
  { symbol:'SOFI', name:'SoFi Technologies', price:14.22, change:0.44, changePct:3.19, volume:42000000, avgVolume:48000000, mktCap:15, pe:null, eps:-0.12, week52High:18.42, week52Low:6.01, sector:'Financials', industry:'Fintech', beta:2.14, dividendYield:0, revenueGrowth:26.1, grossMargin:42.3, roe:-5.2, debtToEquity:3.44, analystRating:'Buy', priceTarget:16 },
  { symbol:'RIVN', name:'Rivian Automotive', price:12.44, change:-0.33, changePct:-2.58, volume:31000000, avgVolume:38000000, mktCap:13, pe:null, eps:-1.66, week52High:21.44, week52Low:8.26, sector:'Consumer Disc.', industry:'EVs', beta:1.94, dividendYield:0, revenueGrowth:49.2, grossMargin:-38.4, roe:null, debtToEquity:2.11, analystRating:'Hold', priceTarget:14 },
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

  filtered.sort((a: any, b: any) => {
    const av = a[sortBy] ?? -Infinity
    const bv = b[sortBy] ?? -Infinity
    return sortDir === 'desc' ? bv - av : av - bv
  })

  return NextResponse.json({ stocks: filtered, total: filtered.length })
}
