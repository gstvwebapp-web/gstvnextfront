export const runtime = 'nodejs';
export const revalidate = 30;
import YahooFinance from 'yahoo-finance2';
import { NextResponse } from 'next/server';

const yahooFinance = new YahooFinance(); // ⭐ REQUIRED

export async function GET() {
  try {
    const [sensex, nifty] = await Promise.all([
      yahooFinance.quote('^BSESN'), // Sensex
      yahooFinance.quote('^NSEI'),  // Nifty 50
    ]);

    const formatData = (data: any) => {
      const price = data.regularMarketPrice ?? 0;
      const change = data.regularMarketChange ?? 0;
      const percent = data.regularMarketChangePercent ?? 0;

      return {
        price: price.toFixed(2),
        time: new Date(data.regularMarketTime * 1000).toLocaleTimeString(),
        comparePrice: change.toFixed(2),
        percentage: percent.toFixed(2) + '%',
        trend: change >= 0 ? 1 : 0,
      };
    };

    return NextResponse.json({
      stockmarket: 1,
      sensex: formatData(sensex),
      nifty: formatData(nifty),
    });
  } catch (err: any) {
    console.error('Yahoo Finance Error:', err);
    return NextResponse.json(
      { error: err.message || 'Yahoo fetch failed' },
      { status: 500 }
    );
  }
}
