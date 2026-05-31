export default function Home() {
return (
<div style={{
padding:'40px',
fontFamily:'Arial',
background:'#f5f7fb',
minHeight:'100vh'
}}>
<h1 style={{
fontSize:'56px',
fontWeight:'900',
marginBottom:'10px'
}}>
TheStock411 </h1>

```
  <p style={{
    fontSize:'20px',
    color:'#555',
    marginBottom:'40px'
  }}>
    Your one-stop location for stock market news, data, filings, and market intelligence.
  </p>

  <div style={{
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',
    gap:'20px'
  }}>
    <div style={{
      background:'white',
      padding:'20px',
      borderRadius:'16px'
    }}>
      <h2>Market Pulse</h2>
      <p>S&P 500</p>
      <p>NASDAQ</p>
      <p>DOW</p>
      <p>VIX</p>
    </div>

    <div style={{
      background:'white',
      padding:'20px',
      borderRadius:'16px'
    }}>
      <h2>Trending Stocks</h2>
      <p>NVDA</p>
      <p>AAPL</p>
      <p>TSLA</p>
      <p>AMD</p>
    </div>

    <div style={{
      background:'white',
      padding:'20px',
      borderRadius:'16px'
    }}>
      <h2>Latest Market News</h2>
      <p>Connect API feeds here</p>
    </div>

    <div style={{
      background:'white',
      padding:'20px',
      borderRadius:'16px'
    }}>
      <h2>Earnings Calendar</h2>
      <p>Upcoming earnings releases</p>
    </div>
  </div>
</div>
```

);
}
