"use client";

import { useState, useEffect } from "react";
import PollSection from "./PollSection";

export default function PollPopup({ poll }) {
  const [open, setOpen] = useState(false);
  const [pollLoaded, setPollLoaded] = useState(false);
  if (!poll || !Array.isArray(poll.poll) || poll.poll[0] === null) {
    return null;
  }

  const togglePopup = () => setOpen(!open);

  // When popup opens → wait for PollSection to load → then apply CSS tweaks
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setPollLoaded(true);
      }, 50); // small delay to ensure DOM is rendered

      return () => clearTimeout(timer);
    } else {
      setPollLoaded(false);
    }
  }, [open]);

  return (
    <>
      {/* Floating Button */}
      
      <div
        id="knowMoreBtn"
        className="know-more-btn"
        onClick={togglePopup}
        title="Poll"
      >
        <img
          src={
            open
              ? "/assets/images/close.svg"
              : "/assets/images/poll.svg"
          }
          alt="Poll Icon"
        />
      </div>
    
      {/* Popup */}
      {open && (
        <div id="floatingNewsPopup" className="floating-news-popup">
          <div className="popup-header">
            <span className="popup-title">પોલ</span>

            <button className="close-btn" onClick={togglePopup}>
              ×
            </button>
          </div>

          <div
            className={`popup-body ${
              pollLoaded ? "poll-loaded" : ""
            }`}
          >
            <PollSection />
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
  .know-more-btn {
    position: fixed;
    left: 20px;
    bottom: 70px;
    width: 48px;
    height: 48px;
    background: #800d00;
    border-radius: 50%;
    display: none;/*flex;*/
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 999999;
  }

  .floating-news-popup {
    position: fixed;
    bottom: 120px;
    left: 20px;
    width: 320px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    display: ${open ? "block" : "none"};
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: #800d00;
    color: #fff;
    border-radius: 10px 10px 0 0;
  }

  .popup-body {
    padding: 15px;
  }
  
`}</style>
    </>
  );
}
