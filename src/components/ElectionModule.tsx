'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Column {
  name: string;
  is_hidden: number; // 0 = show, 1 = hide
}

interface Party {
  party_name: string;
  color_code?: string;          // from API e.g. "#a03131"
  values: Record<string, string>;
}

interface Election {
  election_id: number;
  election_title: string;
  total_seats: number;
  state_name: string;
  columns: Column[];
  parties: Party[];
}

interface ElectionGroup {
  group_id: number;
  main_title: string;
  status: string;
  elections: Election[];
}

interface ElectionModuleResponse {
  status: boolean;
  data: ElectionGroup[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getVisibleCols = (cols: Column[]) => cols.filter((c) => c.is_hidden === 0);

// Fallback colours if color_code is missing
const FALLBACK_COLORS = ['#f5a623', '#4a90d9', '#e74c3c', '#7ed321', '#9b59b6', '#1abc9c'];

const partyColor = (party: Party, index: number): string =>
  party.color_code || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

// ─── Single election card ─────────────────────────────────────────────────────
//
//  Header : election_title  (કુલ - N)
//  Table  :
//    PARTY  |  col1  |  col2  ...   (NO total column)
//    BJP    |   34   |   54
//    INC    |   25   |   43
//
//  - Party name + values coloured by color_code
//  - Vertical scroll if many parties (max-height)
//  - NO horizontal scroll

function ElectionCard({ election }: { election: Election }) {
  const visCols = getVisibleCols(election.columns);

  return (
    <div className="em-card">
      {/* Title */}
      <div className="em-card-header">
        <span className="em-card-title custom-gujrati-font">
          {election.election_title}
        </span>
        <span className="em-total-seats custom-gujrati-font">
          (Total Seat - {election.total_seats})
        </span>
      </div>

      {/* Table — no x-scroll, vertical scroll only */}
      <div className="em-table-wrap">
        <table className="em-table">
          <thead>
            <tr>
              <th className="em-th em-th-party">Party</th>
              {visCols.map((col) => (
                <th key={col.name} className="em-th custom-gujrati-font">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {election.parties.map((party, pi) => {
              const color = partyColor(party, pi);
              return (
                <tr key={`${party.party_name}-${pi}`} className="em-party-row">
                  <td className="em-td em-td-party" style={{ color }}>
                    {party.party_name.toUpperCase()}
                  </td>
                  {visCols.map((col) => (
                    <td key={col.name} className="em-td em-td-val" style={{ color }}>
                      {party.values[col.name] ?? '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ElectionModule() {
  const [groups, setGroups] = useState<ElectionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/electionmodule', {
          method: 'GET',
          cache: 'no-store',
        });
        if (!res.ok) return;
        const json: ElectionModuleResponse = await res.json();
        if (json.status && Array.isArray(json.data) && json.data.length > 0) {
          setGroups(
            json.data.filter(
              (g) => g.status === 'Active' && g.elections && g.elections.length > 0
            )
          );
        }
      } catch (err) {
        console.error('ElectionModule fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || groups.length === 0) return null;

  return (
    <>
      {groups.map((group) => (
        <div key={group.group_id} className="em-section">
          <div className="em-outer-wrap">
            {/* Heading */}
            <div className="em-heading">
              <span className="em-dot" />
              <h2 className="em-heading-text custom-gujrati-font">{group.main_title}</h2>
            </div>

            {/* All elections in ONE horizontal row — scrollable if overflow */}
            <div className="em-elections-row">
              {group.elections.map((election) => (
                <div key={election.election_id} className="em-card-wrap">
                  <ElectionCard election={election} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
