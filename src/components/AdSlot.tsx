'use client';

import { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
  slotId: string;
  className?: string;
}

// ✅ Reserve ad space to prevent CLS — each slot has a known size
const AD_SLOT_MIN_HEIGHTS: Record<string, number> = {
  gstvin_top: 90,        // leaderboard 728x90
  gstvin_footer: 90,     // leaderboard 728x90
  gstvin_sidebar: 250,   // medium rectangle 300x250
  gstvin_inarticle1: 250,
  gstvin_inarticle2: 250,
};

const AdSlot: React.FC<AdSlotProps> = ({ slotId, className = '' }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const displayedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [adFilled, setAdFilled] = useState(false);

  const minHeight = AD_SLOT_MIN_HEIGHTS[slotId] ?? 90;

  // 1️⃣ Block SSR output
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2️⃣ Run GPT only AFTER mount
  useEffect(() => {
    if (
      mounted &&
      !displayedRef.current &&
      window.googletag?.cmd
    ) {
      window.googletag.cmd.push(() => {
        window.googletag.display(slotId);
        // ✅ Listen for slot render to know if ad filled
        window.googletag.pubads().addEventListener('slotRenderEnded', (event: any) => {
          if (event.slot.getSlotElementId() === slotId) {
            setAdFilled(!event.isEmpty);
          }
        });
      });
      displayedRef.current = true;
    }
  }, [mounted, slotId]);

  // 🔥 CRITICAL LINE
  if (!mounted) return null;

  return (
    <div
      className={`text-center pb-2 ${className}`}
      // ✅ Reserve minimum height before ad loads — prevents CLS
      style={!adFilled ? { minHeight: `${minHeight}px` } : undefined}
    >
      <div id={slotId} ref={adRef}></div>
    </div>
  );
};

export default AdSlot;
