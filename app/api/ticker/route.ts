import { NextResponse } from 'next/server'
export async function GET() {
  const quotes = [
    { symbol:'^GSPC', name:'S&P 500', price:'5487.03', change:'+23.45', changePercent:'+0.43' },
    { symbol:'^DJI', name:'Dow Jones', price:'43862.97', change:'+184.32', changePercent:'+0.42' },
    { symbol:'^IXIC', name:'NASDAQ', price:'19674.45', change:'+112.88', changePercent:'+0.58' },
    { symbol:'AAPL', name:'Apple Inc.', price:'213.32', change:'+2.14', changePercent:'+1.01' },
    { symbol:'MSFT', name:'Microsoft', price:'447.89', change:'+5.67', changePercent:'+1.28' },
    { symbol:'NVDA', name:'NVIDIA', price:'134.76', change:'+4.32', changePercent:'+3.31' },
    { symbol:'GOOGL', name:'Alphabet', price:'187.34', change:'-0.98', changePercent:'-0.52' },
    { symbol:'AMZN', name:'Amazon', price:'198.12', change:'+1.88', changePercent:'+0.96' },
    { symbol:'META', name:'Meta', price:'562.44', change:'+8.23', changePercent:'+1.49' },
    { symbol:'TSLA', name:'Tesla', price:'248.91', change:'-6.44', changePercent:'-2.52' },
    { symbol:'SPY', name:'SPDR S&P 500', price:'546.77', change:'+2.31', changePercent:'+0.42' },
    { symbol:'QQQ', name:'Invesco QQQ', price:'478.32', change:'+3.11', changePercent:'+0.65' },
    { symbol:'GLD', name:'Gold ETF', price:'224.88', change:'+1.02', changePercent:'+0.46' },
    { symbol:'AMD', name:'Advanced Micro', price:'164.23', change:'+5.67', changePercent:'+3.58' },
    { symbol:'COIN', name:'Coinbase', price:'234.56', change:'-4.32', changePercent:'-1.81' },
    { symbol:'PLTR', name:'Palantir', price:'32.44', change:'+0.88', changePercent:'+2.79' },
    { symbol:'NFLX', name:'Netflix', price:'698.45', change:'+12.34', changePercent:'+1.80' },
    { symbol:'BTC-USD', name:'Bitcoin', price:'67432.10', change:'+1234.56', changePercent:'+1.86' },
    { symbol:'ETH-USD', name:'Ethereum', price:'3567.88', change:'+88.32', changePercent:'+2.54' },
    { symbol:'JPM', name:'JPMorgan', price:'223.14', change:'+1.23', changePercent:'+0.55' },
  ]
  return NextResponse.json({ quotes, source: 'demo' })
}