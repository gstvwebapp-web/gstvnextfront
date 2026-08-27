'use client';

import { useEffect, useState } from 'react';

export default function StockMarket() {
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    const res = await fetch('/api/stock-market');
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    fetchData(); // initial load

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // ⏱ every 30 sec

    return () => clearInterval(interval);
  }, []);

  if (!data || data.stockmarket !== 1) return null;

  const { sensex, nifty } = data;

  const sensexCol = sensex.trend ? 'stock-green' : 'stock-red';
  const niftyCol = nifty.trend ? 'stock-green' : 'stock-red';

  const sensexCls = sensex.trend ? '' : 'marketMinus';
  const niftyCls = nifty.trend ? '' : 'marketMinus';

  return (
    <div className="getStockMarket">
      <div className="row m-0">

        <div className={`col-6 colbox borderbox ${sensexCls}`}>
          <b>Sensex</b>
          {/* <span className="stimeSpan">{sensex.time}</span> */}
          <div className="flexMarket">
            <span>{sensex.price}</span>
            <span className={`stockmarket_highlight ${sensexCol}`}>
              {sensex.comparePrice} ({sensex.percentage})
            </span>
          </div>
        </div>

        <div className={`col-6 colbox ${niftyCls}`}>
          <b>Nifty 50</b>
          {/* <span className="stimeSpan">{nifty.time}</span> */}
          <div className="flexMarket">
            <span>{nifty.price}</span>
            <span className={`stockmarket_highlight ${niftyCol}`}>
              {nifty.comparePrice} ({nifty.percentage})
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
