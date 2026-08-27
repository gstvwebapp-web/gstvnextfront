"use client";

import React, { useEffect, useState } from "react";
import { fetchMagazineCategories, MagazineCategory } from "@/services/magazineApi";
import Link from "next/link";

interface Props {
  currentSlug?: string;
}

const MagazineLogoStrip: React.FC<Props> = ({ currentSlug }) => {
  const [cats, setCats] = useState<MagazineCategory[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchMagazineCategories();
        if (!active) return;
        const list = Array.isArray(data?.epapercat) ? data.epapercat : [];
        setCats(list);
      } catch (e) {
        console.error("Failed to load magazine categories", e);
        setCats([]);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="magazinetitledropdown1">
      <div className="magazinelogo-container">
        {cats.map((c) => {
          const link = `/magazine/${c.slug}`;
          const opacity = currentSlug ? (c.slug === currentSlug ? 1 : 0.5) : 1;
          return (
            <div key={c.slug} className="magazinelogo-item">
              <Link href={link}>
                <img src={c.icon} alt={c.title} style={{ opacity }} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MagazineLogoStrip;

