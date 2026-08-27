'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';

interface LiveMatchData {
  series_id: string;
  series: string;
  match_id: number;
  livecricket: {
    team_a: string;
    team_b: string;
    team_a_scores: string;
    team_b_scores: string;
    team_a_over: string;
    team_b_over: string;
    team_a_img: string;
    team_b_img: string;
  };
}

const LiveMatchScore = () => {
  const [match, setMatch] = useState<LiveMatchData | null>(null);

  useEffect(() => {
    const fetchLiveMatch = async () => {
      try {
        const res = await fetch(
          API_ENDPOINTS.LIVE_CRICKET_SCORE,
          { cache: 'no-store' }
        );

        const json = await res.json();

        if (json.status === 1 && json.livecricket) {
          setMatch(json.livecricket);
        }
      } catch (error) {
        console.error('Live score fetch error', error);
      }
    };

    fetchLiveMatch();

    const interval = setInterval(fetchLiveMatch, 30000); // refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  if (!match) return null;

  const data = match.livecricket;

  const formattedSeries = match.series
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');

  const scoreUrl = `/livematchscoredetail/${match.series_id}/${formattedSeries}/${match.match_id}`;

  return (
    <div className="liveScrollTable">
      <Link href={scoreUrl}>
        <div className="scorecard">
          {/* TEAM B */}
          <div className="team">
            <img src={data.team_b_img} alt={data.team_b} />
            <div className="team_name">{data.team_b}</div>
            <div className="score">{data.team_b_scores || '--'}</div>
            {data.team_b_over && (
              <div className="over_numb">({data.team_b_over} Ov)</div>
            )}
          </div>

          {/* VS */}
          <div className="vs">
            <span className="live-badge">LIVE</span>
            VS
          </div>

          {/* TEAM A */}
          <div className="team">
            <img src={data.team_a_img} alt={data.team_a} />
            <div className="team_name">{data.team_a}</div>
            <div className="score">{data.team_a_scores || '--'}</div>
            {data.team_a_over && (
              <div className="over_numb">({data.team_a_over} Ov)</div>
            )}
          </div>
        </div>

        <div className="livestatus">રમત ચાલી રહી છે</div>
      </Link>
    </div>
  );
};

export default LiveMatchScore;
