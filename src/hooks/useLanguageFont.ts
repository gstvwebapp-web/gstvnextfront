'use client';

import { useEffect, useRef } from 'react';
import { getLanguageFontClass, isGujaratiText } from '@/utils/commonFunctions';

/**
 * Hook to automatically apply language-specific font classes to text elements
 * @param text - Text content to analyze
 * @returns CSS class name for the appropriate font
 */
export const useLanguageFont = (text: string): string => {
  return getLanguageFontClass(text);
};

/**
 * Hook to automatically apply font classes to DOM elements based on their text content
 * @param containerRef - Ref to the container element
 * @param dependencies - Dependencies array to trigger re-analysis
 */
export const useAutoLanguageFont = (
  containerRef: React.RefObject<HTMLElement>,
  dependencies: any[] = []
) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const applyFontToElement = (element: Element) => {
      const text = element.textContent || '';
      if (text.trim()) {
        // Remove existing font classes
        element.classList.remove('custom-gujrati-font', 'english-font');

        // Add appropriate font class
        const fontClass = getLanguageFontClass(text);
        element.classList.add(fontClass);
      }
    };

    // Apply to all text elements within the container
    const textElements = containerRef.current.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, span, div, a, li, td, th, label, button'
    );

    textElements.forEach(applyFontToElement);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...dependencies]);
};

/**
 * Function to manually apply language-specific font to an element
 * @param element - DOM element to apply font to
 */
export const applyLanguageFont = (element: HTMLElement) => {
  const text = element.textContent || element.innerText || '';
  if (text.trim()) {
    // Remove existing font classes
    element.classList.remove('custom-gujrati-font', 'english-font');
    
    // Add appropriate font class
    const fontClass = getLanguageFontClass(text);
    element.classList.add(fontClass);
  }
};

/**
 * Function to apply language-specific fonts to all text elements in a container
 * @param container - Container element
 */
export const applyLanguageFontsToContainer = (container: HTMLElement) => {
  const textElements = container.querySelectorAll(
    'h1, h2, h3, h4, h5, h6, p, span, div, a, li, td, th, label, button'
  );
  
  textElements.forEach((element) => {
    applyLanguageFont(element as HTMLElement);
  });
};
