'use client';

import { API_ENDPOINTS } from '@/constants/api';
import { useEffect, useState } from 'react';

interface Inning {
  team: any;
  batsman?: any[];
  bolwer?: any[];
  fallwicket?: any[];
}

const LiveMatchScoreDetailPage = ({ params }: any) => {
  const { matchId } = params;

  const [liveData, setLiveData] = useState<any>(null);
  const [activeInning, setActiveInning] = useState<number>(0);

  useEffect(() => {
    const fetchScoreDetail = async () => {
      try {
        const res = await fetch(
          API_ENDPOINTS.LIVE_CRICKET_SCORE,
          { cache: 'no-store' }
        );

        const json = await res.json();

        if (json.status === 1) {
          setLiveData(json.livecricket);
        }
      } catch (error) {
        console.error('Score detail fetch error', error);
      }
    };

    fetchScoreDetail();
  }, [matchId]);

  if (!liveData) return null;

  const live = liveData.livecricket;
  const scorecard = liveData.scorecard;

  const innings: Inning[] = Object.values(scorecard.scorecard || {});

  return (
    <div className="blogs-main-section" id="livecricket_detail_page">
      {/* ---------------- SCORE HEADER ---------------- */}
      <div className="scorecard">
        <div className="team team_b">
          <img src={live.team_b_img} alt={live.team_b} />
          <div className="team_name">{live.team_b}</div>
          <div className="score">{live.team_b_scores ?? '--'}</div>
          <div className="over_numb">
            {live.team_b_over ? `${live.team_b_over} Ov` : ''}
          </div>
        </div>

        <div className="vs">
          <span className="live-badge">LIVE</span>
          VS
        </div>

        <div className="team team_a">
          <img src={live.team_a_img} alt={live.team_a} />
          <div className="team_name">{live.team_a}</div>
          <div className="score">{live.team_a_scores ?? '--'}</div>
          <div className="over_numb">
            {live.team_a_over ? `${live.team_a_over} Ov` : ''}
          </div>
        </div>
      </div>

      {/* ---------------- RESULT ---------------- */}
      {scorecard.result && (
        <div className="scorecarddtls_result">
          <span>{scorecard.result}</span>
        </div>
      )}

      {/* ---------------- INNINGS ---------------- */}
      {innings.map((inning, index) => (
        <div className="team_section" key={index}>
          <div
            className={`team_heading ${
              activeInning === index ? 'active' : ''
            }`}
            onClick={() => setActiveInning(index)}
          >
            <h3>
              <span>
                {inning.team.name} ({inning.team.short_name})
              </span>
              <span className="toggle-arrow">
                <i className="fas fa-chevron-down"></i>
              </span>
            </h3>
          </div>

          {activeInning === index && (
            <div className="team_content">
              {/* -------- BATSMEN -------- */}
              {inning.batsman && (
                <>
                  <h4>Batsmen</h4>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>R</th>
                          <th>B</th>
                          <th>4s</th>
                          <th>6s</th>
                          <th>SR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inning.batsman.map((bat, i) => (
                          <tr key={i}>
                            <td>
                              {bat.name}
                              <br />
                              {bat.out_by === 'not out' ? (
                                <span style={{ color: 'green' }}>Batting</span>
                              ) : (
                                <>
                                  <span style={{ color: 'red' }}>Out:</span>{' '}
                                  {bat.out_by}
                                </>
                              )}
                            </td>
                            <td>{bat.run}</td>
                            <td>{bat.ball}</td>
                            <td>{bat.fours}</td>
                            <td>{bat.sixes}</td>
                            <td>{bat.strike_rate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <p>
                <b>Extras:</b> {inning.team.extras}
              </p>
              <p className="mb-2">
                <b>Total Runs:</b> {inning.team.score}/
                {inning.team.wicket} in {inning.team.over} overs
              </p>

              {/* -------- FALL OF WICKETS -------- */}
              {inning.fallwicket && (
                <>
                  <h4>Fall Of Wickets</h4>
                  {inning.fallwicket.map((fw, i) => (
                    <span key={i}>
                      <span className="black_font">
                        {fw.score}-{fw.wicket}
                      </span>{' '}
                      <span className="gray_font">
                        ({fw.player}, {fw.over})
                      </span>
                      ,{' '}
                    </span>
                  ))}
                </>
              )}

              {/* -------- BOWLERS -------- */}
              {inning.bolwer && (
                <>
                  <h4>Bowlers</h4>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>O</th>
                          <th>M</th>
                          <th>R</th>
                          <th>W</th>
                          <th>ER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inning.bolwer.map((bow, i) => (
                          <tr key={i}>
                            <td>{bow.name}</td>
                            <td>{bow.over}</td>
                            <td>{bow.maiden}</td>
                            <td>{bow.run}</td>
                            <td>{bow.wicket}</td>
                            <td>{bow.economy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LiveMatchScoreDetailPage;
