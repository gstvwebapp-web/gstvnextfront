'use client';

import { useEffect, useRef } from "react";

export default function MobileInput({ value, onChange }) {

  const inputRef = useRef(null);
  const boxRef = useRef(null);

  const MASK = "___-___-____";

  // Build masked value
  const applyMask = (digits) => {
    let maskArr = MASK.split("");
    let di = 0;
    for (let i = 0; i < maskArr.length; i++) {
      if (maskArr[i] === "_" && di < digits.length) {
        maskArr[i] = digits[di];
        di++;
      }
    }
    return maskArr.join("");
  };

  const nextCaret = (masked, digitCount) => {
    let count = 0;
    for (let i = 0; i < masked.length; i++) {
      if (/\d/.test(masked[i])) {
        count++;
        if (count === digitCount) return i + 1;
      }
    }
    return masked.length;
  };

  useEffect(() => {
    const input = inputRef.current;
    const box = boxRef.current;

    if (!input || !box) return;

    const handleMouseEnter = () => {
      if (value === "") onChange("");
      //if (input.value === "") input.value = MASK;
      if (input.value === "") {
        input.value = MASK;
        input.setSelectionRange(0, 0);   // ⭐ always start
        }
    };

    const handleMouseLeave = () => {
      if (!input.matches(":focus") && input.value === MASK) {
        input.value = "";
      }
    };

    const handleFocus = () => {
      box.classList.add("focused");
      //if (input.value === "") input.value = MASK;
      if (input.value === "") {
        input.value = MASK;
        input.setSelectionRange(0, 0);   // ⭐ cursor always at start
      }
    };

    const handleBlur = () => {
      box.classList.remove("focused");
      if (input.value.replace(/\D/g, "") === "") {
        input.value = "";
      }
    };

    const handleInput = () => {
      const digits = input.value.replace(/\D/g, "").slice(0, 10);

      onChange(digits); // ⭐ Return only clean digits to parent

      if (digits.length === 0) {
        input.value = MASK;
        input.setSelectionRange(0, 0);
        return;
      }

      const masked = applyMask(digits);
      const caretPos = nextCaret(masked, digits.length);

      input.value = masked;
      input.setSelectionRange(caretPos, caretPos);
    };

    const handleKeyPress = (e) => {
      if (!/\d/.test(e.key)) e.preventDefault();
    };

    // Listeners
    box.addEventListener("mouseenter", handleMouseEnter);
    box.addEventListener("mouseleave", handleMouseLeave);
    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);
    input.addEventListener("input", handleInput);
    input.addEventListener("keypress", handleKeyPress);

    return () => {
      box.removeEventListener("mouseenter", handleMouseEnter);
      box.removeEventListener("mouseleave", handleMouseLeave);
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
      input.removeEventListener("input", handleInput);
      input.removeEventListener("keypress", handleKeyPress);
    };
  }, [value, onChange]);

  // Sync masked value whenever parent value changes
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (!value) {
      input.value = "";
      return;
    }

    input.value = applyMask(value);
  }, [value]);

  return (
    <>
      <div className="inputOuter"  ref={boxRef}>
              <span>+91</span>
              
              <input
                ref={inputRef}
                type="text"
                maxLength="14"
                autoComplete="tel"
                inputMode="numeric"
                placeholder="તમારો મોબાઈલ નંબર દાખલ કરો"
              />
            </div>
      

    </>
  );
}
