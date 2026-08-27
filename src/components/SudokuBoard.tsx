"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function SudokuBoard() {
  const [isReady, setIsReady] = useState(false);

  /* 🔴 SUDOKU INIT */
  useEffect(() => {
    if (!isReady || typeof window === "undefined") return;

    const $ = (window as any).$;
    if (!$ || !$.fn.sudokuJS) return;

    $(document).on("keydown", ".sudoku-board input", function (event: any) {
      if ([8, 9, 13, 37, 38, 39, 40, 46].includes(event.keyCode)) return;
      if (event.keyCode < 48 || event.keyCode > 57) {
        event.preventDefault();
      }
    });

    const mySudokuJS = $("#sudoku").sudokuJS({
      difficulty: "very hard",
    });

    $(".js-solve-step-btn").on("click", mySudokuJS.solveStep);
    $(".js-solve-all-btn").on("click", mySudokuJS.solveAll);
    $(".js-clear-board-btn").on("click", mySudokuJS.clearBoard);

    $(".js-generate-board-btn--medium").on("click", () => {
      mySudokuJS.generateBoard("medium");
    });

    return () => {
      $(document).off("keydown");
    };
  }, [isReady]);

  return (
    <>
      {/* jQuery */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />

      {/* sudokuJS */}
      <Script
        src="/assets/js/sudokuJS.js"
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      {/* sudoku CSS */}
      <link rel="stylesheet" href="/assets/css/sudokuJS.css" />

      <div className="wrap">
        <button className="sudokubutton2 js-generate-board-btn--medium">
          New Generate
        </button>

        <div id="sudoku" className="sudoku-board"></div>

        <div className="bottomBtnGroup">
          <div className="solveBtnbox">
            <button className="sudokubutton5 js-solve-step-btn">
              Solve One Step
            </button>
            <button className="sudokubutton6 js-solve-all-btn">
              Solve All
            </button>
          </div>

          <div className="clearBtnbox">
            <button className="sudokubutton7 js-clear-board-btn">
              Clear Board
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
