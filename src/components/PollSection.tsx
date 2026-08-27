'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getOrCreateDeviceId } from '@/utils/deviceId';
import { useUserSession } from '@/hooks/useUserSession';
import { API_ENDPOINTS } from '@/constants/api';
import LoginOtpModal from './LoginOtpModal';

interface PollData {
  id: number;
  userID: number;
  parentID: number;
  question: string;
  answerOption: string;
  status: string;
  created_at: string;
  updated_at: string;
  expiredate: string;
  pollmsg: string;
}

interface PollApiResponse {
  poll: PollData[];
}

const PollSection: React.FC = () => {

  const { isLoggedIn, user_id } = useUserSession();
  const deviceId = useMemo(() => getOrCreateDeviceId(), []);

  const [polls, setPolls] = useState<PollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: string }>({});
  const [voteMessages, setVoteMessages] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState<{ [key: number]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  // ✅ STORE pollID & voteId
  const [drawData, setDrawData] = useState<{ pollID: string; voteId: string } | null>(null);

  const voteKey = (pollId: number) => `poll_voted_${pollId}_${user_id || deviceId}`;

  // ---------------- FETCH POLLS ----------------
  useEffect(() => {

    const fetchPolls = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.POLL, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
        });
        const data: PollApiResponse = await response.json();
        setPolls(data.poll.filter(p => p.status === 'Active'));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  // ---------------- LOAD SAVED VOTES ----------------
  useEffect(() => {
    const selections: any = {};
    polls.forEach(p => {
      const saved = localStorage.getItem(voteKey(p.id));
      if (saved && saved !== '1') selections[p.id] = saved;
    });
    setSelectedOptions(selections);
  }, [polls]);

  // ---------------- OPTION CHANGE ----------------
  const handleOptionChange = (pollId: number, option: string) => {

    if (submitting[pollId]) return;

    setSelectedOptions(prev => ({ ...prev, [pollId]: option }));

    const prevStored = localStorage.getItem(voteKey(pollId)) || '';
    const prevSelected = selectedOptions[pollId] || prevStored;

    submitVote(pollId, option, prevSelected);

    if (!isLoggedIn) setIsModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
  };

  // ---------------- SUBMIT VOTE ----------------
  const submitVote = async (pollId: number, option: string, prevSelected?: string) => {

    try {
      setSubmitting(prev => ({ ...prev, [pollId]: true }));
      setVoteMessages(prev => ({ ...prev, [pollId]: 'Submitting...' }));

      let currentUserId = user_id || localStorage.getItem('userId');

      const payload = {
        pollID: String(pollId),
        selectedAnswer: String(option),
        userID: currentUserId || '',
        IPaddress: String(deviceId || '')
      };

      const res = await fetch(API_ENDPOINTS.POLL_SUBMIT, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // ✅ SAFE EXTRACTION (FIXED)
      const pollID =
        data?.pollID ||
        data?.poll_id ||
        data?.data?.pollID ||
        data?.data?.poll_id ||
        data?.result?.pollID ||
        data?.result?.poll_id;

      const voteId =
        data?.voteId ||
        data?.vote_id ||
        data?.data?.voteId ||
        data?.data?.vote_id ||
        data?.result?.voteId ||
        data?.result?.vote_id;

      if (pollID && voteId) {
        setDrawData({ pollID: String(pollID), voteId: String(voteId) });
        setIsModalOpen(true);
      } else {
        console.error('❌ pollID or voteId not found:', data);
      }

      localStorage.setItem(voteKey(pollId), option);

      const msg = prevSelected && prevSelected !== option
        ? 'તમારો મત અપડેટ થયો છે.'
        : 'આપનો મત નોંધાયો છે!';

      setVoteMessages(prev => ({ ...prev, [pollId]: data.message || msg }));

      setTimeout(() => {
        setVoteMessages(prev => {
          const next = { ...prev };
          delete next[pollId];
          return next;
        });
      }, 3000);

    } catch {
      setVoteMessages(prev => ({ ...prev, [pollId]: 'મત આપવામાં ભૂલ થઈ છે!' }));
    } finally {
      setSubmitting(prev => ({ ...prev, [pollId]: false }));
    }
  };

  // ---------------- UI (UNCHANGED) ----------------

  

  if (error || !polls.length) return null;

  return (

    <div className="poll-section">

      {polls.map((poll, index) => {

        const options = poll.answerOption.split(':');
        const isLast = index === polls.length - 1;

        const words = poll.question.split(/\s+/);
        const isLong = words.length > 50;
        const text = expanded[poll.id] ? poll.question : words.slice(0, 50).join(' ') + (isLong ? '...' : '');
        const isExpired = new Date() > new Date(poll.expiredate);

        return (
          <div key={poll.id} className="MCQs" style={{ border: '1px solid #800d00', borderRadius: '12px 12px 0 0' }}>

            <div className="storySectionNav blogs-head-bar first fastrack_head" style={{ justifyContent: 'center', alignItems: 'center' }}>
              <h3 className="blog-category">પોલ</h3>
            </div>

            <h5 className="MCQ-Question custom-gujrati-font" style={{ margin: '10px' }}>
              {text}
              {isLong && (
                <span
                  onClick={() => setExpanded(prev => ({ ...prev, [poll.id]: !prev[poll.id] }))}
                  style={{ cursor: 'pointer', color: 'var(--primary-color)' }}
                >
                  {/* {expanded[poll.id] ? ' પાછા જાઓ' : ' વધુ વાંચો'} */}
                  {expanded[poll.id] ? (
                      <button
                        title="પાછા જાઓ"
                        style={{
                          background: "rgb(128, 13, 0)",
                          border: "2px solid rgb(128, 13, 0)",
                          borderRadius: "50%",
                          width: "25px",
                          height: "25px",
                          color: "white",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "0.3s",
                          backdropFilter: "blur(10px)",
                          boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 15px",
                          marginLeft: "5px"
                        }}
                      >
                        <i className="fas fa-arrow-left"></i>
                      </button>
                    ) : (
                      " વધુ વાંચો"
                    )}
                  
                </span>
              )}
            </h5>
               
            <div className="MCQ-options custom-gujrati-font" style={{ padding: '10px' , position: 'relative' }}>
              <p className="MCQ-msg">{voteMessages[poll.id]}</p>
              {/* {poll.expiredate} */}
              {/* <p>Current: {new Date().toLocaleString()}</p>
                <p>Expiry: {new Date(poll.expiredate).toLocaleString()}</p> */}
              <div style={{ float: 'left', width: '100%', position: 'relative' ,gap:'10px',display:'flex',flexDirection:'column'}}>
              {new Date() > new Date(poll.expiredate) && (
                <div className="poll-overlay">
                  <p>{poll.pollmsg}</p>
                </div>
              )}
              {options.map((opt, i) => (
                <div key={i} className="all-options">
                  <input id={`pollOption${poll.id}`}
                    type="radio"
                    name={`pollOption${poll.id}`}
                    checked={selectedOptions[poll.id] === opt}
                    onChange={() => handleOptionChange(poll.id, opt)}
                    disabled={isExpired || submitting[poll.id]}
                  />
                  <label htmlFor={`pollOption${poll.id}`}>{opt}</label>
                </div>
              ))}
              </div>

              {isLast && <Link href="/poll-result" className="poleres">પરિણામો જુઓ</Link>}
            </div>
          </div>
        );
      })}

      <LoginOtpModal
        isOpen={isModalOpen}
        pollData={drawData}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

    </div>
  );
}; 
export default PollSection;
