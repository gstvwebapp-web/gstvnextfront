'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { API_ENDPOINTS } from '@/constants/api';

interface PartyData {
  partyname: string[];
  partyseat: string[];
  partylead: string[];
  partycolor: string[];
}

interface StarCandidate {
  id: number;
  stateId: number;
  title: string;
  city: string;
  partytype: string;
  image: string;
  party_status: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ElectionState {
  electiontitle: string;
  statename: string;
  totalseats: number;
  partydata: PartyData;
  starcandidates: StarCandidate[];
}

interface ElectionResponse {
  status: boolean;
  data: ElectionState[];
}

export default function ElectionResults() {
  const [electionData, setElectionData] = useState<ElectionState[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const chartRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});
  const chartInstances = useRef<{ [key: number]: any }>({});

  useEffect(() => {
    const fetchElectionResults = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ELECTIONRESULTS, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ElectionResponse = await response.json();

        if (result.status && result.data.length > 0) {
          setElectionData(result.data);
        }
      } catch (error) {
        console.error('Election results fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionResults();
  }, []);

  useEffect(() => {
    // Load Chart.js dynamically
    if (typeof window !== 'undefined' && electionData.length > 0) {
      const loadChartJS = async () => {
        try {
          const Chart = (await import('chart.js/auto')).default;
          const ChartDataLabels = (await import('chartjs-plugin-datalabels')).default;

          // Register the plugin
          Chart.register(ChartDataLabels);

          // Render chart for active tab
          renderChart(activeTab, Chart, ChartDataLabels);
        } catch (error) {
          console.error('Failed to load Chart.js:', error);
        }
      };

      loadChartJS();
    }
  }, [electionData, activeTab]);

  const renderChart = (index: number, Chart: any, ChartDataLabels: any) => {
    const canvas = chartRefs.current[index];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstances.current[index]) {
      chartInstances.current[index].destroy();
    }

    const state = electionData[index];
    if (!state) return;

    const combinedData = state.partydata.partyname.map((_, i) => {
      const seats = parseInt(state.partydata.partyseat[i]) || 0;
      const leads = parseInt(state.partydata.partylead[i]) || 0;
      return seats + leads;
    });

    chartInstances.current[index] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: state.partydata.partyname,
        datasets: [{
          data: combinedData,
          backgroundColor: state.partydata.partycolor,
          borderWidth: 3,
          borderColor: '#fff',
          hoverBorderWidth: 3,
          hoverBorderColor: '#fff',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        rotation: 270, // Start from bottom left
        circumference: 180, // Half circle (180 degrees)
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context: any) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value}`;
              }
            }
          },
          datalabels: {
            color: '#fff',
            font: {
              weight: 'bold',
              size: 16
            },
            formatter: (value: number) => {
              return value > 0 ? value : '';
            },
            anchor: 'center',
            align: 'center'
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  };

 

  if (electionData.length === 0) return null;

  return (
    <div className="election-results-section" style={{ marginBottom: '20px' }} id="electionresults">
      <div className="container">
        {/* Tabs */}
        <ul className="nav nav-tabs" role="tablist">
          {electionData.map((state, index) => (
            <li className="nav-item" key={index}>
              <button
                className={`nav-link ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
                type="button"
                role="tab"
              >
                {state.statename}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab Content */}
        <div className="tab-content electionbox" id="tabContent">
          {electionData.map((state, index) => (
            <div
              key={index}
              className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`}
              role="tabpanel"
              style={{ display: activeTab === index ? 'block' : 'none' }}
            >
              <div className="row">
                {/* Chart Section */}
                <div className="col-lg-6 chart-section text-center">
                  <h3 className="custom-gujrati-font">{state.electiontitle}</h3>
                  <h4 className="custom-gujrati-font">{state.statename} ({state.totalseats})</h4>
                  <div style={{
                    width: '280px',
                    height: '160px',
                    margin: '0px auto',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <canvas
                      ref={(el) => { chartRefs.current[index] = el; }}
                      id={`electionChart_${index}`}
                    ></canvas>
                  </div>
                </div>

                {/* Table Section */}
                <div className="col-lg-6 chart-section" style={{ marginTop: '15px' }}>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>પાર્ટી</th>
                        <th>આગળ</th>
                        <th>જીત્યા</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.partydata.partyname.map((partyName, i) => (
                        <tr
                          key={i}
                          style={{
                            backgroundColor: state.partydata.partycolor[i],
                            color: '#fff'
                          }}
                        >
                          <td style={{
                            backgroundColor: state.partydata.partycolor[i],
                            color: '#fff'
                          }}>                            
                            {partyName}
                          </td>
                          <td style={{
                            backgroundColor: state.partydata.partycolor[i],
                            color: '#fff'
                          }}>{state.partydata.partylead[i] || 'N/A'}</td>
                          <td style={{
                            backgroundColor: state.partydata.partycolor[i],
                            color: '#fff'
                          }}>{state.partydata.partyseat[i] || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Star Candidates Section */}
              {state.starcandidates.length > 0 && (
                <div className="election">
                <div className="container mt-4">
                  <h4 className="election_starts custom-gujrati-font">સ્ટાર ઉમેદવારો</h4>
                  <div className="row mt-3">
                    {state.starcandidates.map((candidate) => (
                      <div key={candidate.id} className="col-md-6">
                        <div className="candidate-card">
                          <Image
                            src={candidate.image}
                            alt={candidate.title}
                            width={80}
                            height={80}
                            unoptimized
                          />
                          <div className="candidate-details">
                            <h4>{candidate.title}</h4>
                            <p>
                              {candidate.city} <br /> {candidate.partytype}
                            </p>
                            <span
                              className="status"
                              style={{
                                backgroundColor: candidate.party_status === 'Won' ? 'green' : 'red',
                                color: '#fff',
                                padding: '5px 10px',
                                borderRadius: '4px'
                              }}
                            >
                              {candidate.party_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
