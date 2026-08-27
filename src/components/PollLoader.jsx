"use client";

import { useEffect, useState } from "react";
import PollPopup from "./PollPopup";
import { API_ENDPOINTS } from "@/constants/api";

export default function PollLoader() {
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    async function loadPoll() {
      try {
        const res = await fetch(API_ENDPOINTS.POLL, {
          method: "POST",
          cache: 'no-store',
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({}), // 👈 IMPORTANT
        });
        if (!res) {
          console.log("API Error:", res.status);
          setPoll(null);
          return;
        }

        const data = await res.json();

        if (data && data.poll) {
          setPoll(data);
        } else {
          setPoll(null);
        }
      } catch (err) {
        console.error("Poll Load Error:", err);
        setPoll(null);
      }
    }

    loadPoll();
  }, []);

  return poll ? <PollPopup poll={poll} /> : null;
}
