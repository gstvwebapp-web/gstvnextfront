"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserSession } from "@/hooks/useUserSession";
import { getOrCreateDeviceId } from "@/utils/deviceId";
import { redirectToLogin } from "@/utils/authUtils";
import { API_ENDPOINTS } from "@/constants/api";
import LoginOtpModal from "@/components/LoginOtpModal";

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
  status?: boolean;
  message?: string;
}

interface SubmitPollResponse {
  success?: boolean;
  status?: boolean;
  message?: string;

  // ✅ allow pollID & voteId anywhere
  pollID?: string | number;
  poll_id?: string | number;
  voteId?: string | number;
  vote_id?: string | number;

  data?: {
    pollID?: string | number;
    poll_id?: string | number;
    voteId?: string | number;
    vote_id?: string | number;
  };

  result?: {
    pollID?: string | number;
    poll_id?: string | number;
    voteId?: string | number;
    vote_id?: string | number;
  };
}

const PollPage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, user_id } = useUserSession();

  const [polls, setPolls] = useState<PollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawData, setDrawData] = useState<{ pollID: string; voteId: string } | null>(null);

  // ✅ REMOVE LOGIN BLOCK — NO PENDING ACTION REQUIRED
  const [pendingPollAction, setPendingPollAction] = useState<null>(null);

  const deviceId = useMemo(() => getOrCreateDeviceId(), []);

  const voteKey = useCallback(
    (pollId: number) => `poll_voted_${pollId}_${user_id || deviceId}`,
    [user_id, deviceId]
  );

  // Fetch polls
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_ENDPOINTS.POLL, {
          method: "POST",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const data: PollApiResponse = await res.json();
        const active = (data.poll || []).filter((p) => p.status === "Active");
        setPolls(active);

        // Load local votes
        const selections: Record<number, string> = {};
        active.forEach((p) => {
          const key = voteKey(p.id);
          const val = localStorage.getItem(key);
          if (val && val !== "1") selections[p.id] = val;
        });
        setSelectedOptions(selections);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load polls");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [voteKey]);

  // ✅ VOTE WITHOUT LOGIN + OPEN POPUP
  const handleSelect = (pollId: number, option: string) => {

    if (submitting[pollId]) return;

    setSelectedOptions((prev) => ({ ...prev, [pollId]: option }));

    const prevStored = localStorage.getItem(voteKey(pollId)) || "";
    const prevSelected = selectedOptions[pollId] || prevStored;

    // ✅ Submit vote immediately
    submitVote(pollId, option, prevSelected);

    // ✅ Open popup (no login required)
    setIsModalOpen(true);
  };

  // ✅ No OTP logic needed anymore
  const handleLoginSuccess = () => {
    setIsModalOpen(false);
  };

  // ✅ UPDATED: submit without login check
  const submitVote = async (pollId: number, selectedParam?: string, prevSelected?: string) => {

    const selected = selectedParam ?? selectedOptions[pollId];
    if (!selected) return;

    setSubmitting((s) => ({ ...s, [pollId]: true }));
    setMessages((m) => ({ ...m, [pollId]: "Submitting..." }));

    try {
      const res = await fetch(API_ENDPOINTS.POLL_SUBMIT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          pollID: String(pollId),
          selectedAnswer: String(selected),
          userID: user_id || "",      // ✅ empty if not logged in
          IPaddress: String(deviceId) // ✅ device fallback
        }),
      });

      const data: SubmitPollResponse = await res.json();

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

      if (!res.ok || data.status === false || data.success === false) {
        throw new Error(data?.message || `Failed (${res.status})`);
      }

      const isUpdate = !!prevSelected && prevSelected !== selected;

      setMessages((m) => ({
        ...m,
        [pollId]: data.message || (isUpdate ? "તમારો મત અપડેટ થયો છે." : "આપનો મત નોંધાયો છે!")
      }));

      localStorage.setItem(voteKey(pollId), selected);
    } catch (e: any) {
      setMessages((m) => ({ ...m, [pollId]: e.message || "મત આપવામાં ભૂલ થઈ છે!" }));
    } finally {
      setSubmitting((s) => ({ ...s, [pollId]: false }));
      setTimeout(() => setMessages((m) => ({ ...m, [pollId]: "" })), 3000);
    }
  };

  // ---------------- UI (UNCHANGED) ----------------

  if (loading) {
    return (
      <div className="poll-section" style={{ padding: "20px" }}>
        <div className="blogs-head-bar first">
          <span className="blog-category">Poll</span>
        </div>
        <div style={{ textAlign: "center", color: "#666" }}>
          <i className="fa-solid fa-spinner fa-spin" />
          <span style={{ marginLeft: 8 }}>Loading polls...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-main-section">
        <div className="blogs-head-bar first">
          <span className="blog-category">Poll</span>
        </div>
        <div style={{ textAlign: "center", color: "#c00" }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="blogs-main-section">
      <div className="blogs-head-bar first">
        <span className="blog-category">પોલ</span>
      </div>

      {(polls || []).map((poll) => {
        const options = poll.answerOption.split(":").map((s) => s.trim()).filter(Boolean);
        const isSubmitting = !!submitting[poll.id];
        const selected = selectedOptions[poll.id];
        const isExpired = new Date() > new Date(poll.expiredate);
        return (
          <div key={poll.id} className="MCQ">
            <h5 className="MCQ-Question custom-gujrati-font">{poll.question}</h5>
            <div className="MCQ-options custom-gujrati-font">

              {messages[poll.id] && (
                <p className={`MCQ-msg rightpoll poll${poll.id}`}>{messages[poll.id]}</p>
              )}
              <div style={{ float: 'left', width: '100%', position: 'relative' ,gap:'10px',display:'flex',flexDirection:'column'}}>
               {new Date() > new Date(poll.expiredate) && (
                <div className="poll-overlay">
                  <p>{poll.pollmsg}</p>
                </div>
              )}
              {options.map((opt, idx) => (
                <div key={idx} className="all-options">
                  <input
                    type="radio"
                    className="polloptioncls"
                    name={`pollOption${poll.id}`}
                    id={`${poll.id}_${opt}`}
                    value={opt}
                    checked={selected === opt}
                    // disabled={isSubmitting}
                    disabled={isExpired || isSubmitting}
                    onChange={() => handleSelect(poll.id, opt)}
                  />
                  <label htmlFor={`${poll.id}_${opt}`}>{opt}</label>
                </div>
              ))}
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                <Link href="/poll-result" className="poleres">પરિણામો જુઓ</Link>
              </div>
            </div>
          </div>
        );
      })}

      {polls.length === 0 && (
        <div style={{ padding: 20, textAlign: "center", color: "#666" }}>કોઈ સક્રિય પોલ્સ ઉપલબ્ધ નથી.</div>
      )}

      {/* ✅ POPUP ALWAYS OPENS */}
      
      <LoginOtpModal
        isOpen={isModalOpen}
        pollData={drawData}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default PollPage;
