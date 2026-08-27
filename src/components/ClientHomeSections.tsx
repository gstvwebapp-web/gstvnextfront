'use client';

import dynamic from 'next/dynamic';
import { useSiteSetting } from '@/hooks/useSiteSetting';
import { useStockmarketSiteSetting } from '@/hooks/useStockmarketSiteSetting';

const StockMarket = dynamic(() => import('@/components/StockMarket'), { ssr: false });
const LiveMatchScore = dynamic(() => import('@/components/LiveMatchScore'), { ssr: false });

export function StockMarketSection() {
  const { StockMarketEnabled } = useStockmarketSiteSetting();
  if (!StockMarketEnabled) return null;
  return (
    <div className='for-sm'>
      <StockMarket />
    </div>
  );
}

export function LiveNewsIframeSection() {
  const { LiveNewsHomeEnabled } = useStockmarketSiteSetting();
  if (!LiveNewsHomeEnabled) return null;
  return (
    <div className="mt-4" style={{ width: '100%', float: 'left' }}>
      <iframe
        width="100%"
        height="450"
        src={`${LiveNewsHomeEnabled}?autoplay=1&mute=1`}
        title="Live News"
        frameBorder="0"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

export function LiveMatchScoreSection() {
  const { liveScoreEnabled } = useSiteSetting();
  if (!liveScoreEnabled) return null;
  return (
    <div className='for-sm'>
      <LiveMatchScore />
    </div>
  );
}
