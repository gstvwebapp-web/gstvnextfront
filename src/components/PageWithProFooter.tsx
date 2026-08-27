'use client';

import React from 'react';
import ProFooter from './ProFooter';

interface PageWithProFooterProps {
  children: React.ReactNode;
  className?: string;
  containerClass?: string;
}

/**
 * A reusable layout component that wraps page content with ProFooter
 * Use this for pages that need the professional footer (contact, privacy, etc.)
 */
export default function PageWithProFooter({ 
  children, 
  className = '', 
  containerClass = 'contents-main-div' 
}: PageWithProFooterProps) {
  return (
    <div className={`${containerClass} ${className}`} id="middlePage">
      {children}
      <ProFooter />
    </div>
  );
}

/**
 * Alternative: Higher-Order Component approach
 * Use this to wrap any page component with ProFooter
 */
export function withProFooter<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  layoutProps?: {
    className?: string;
    containerClass?: string;
  }
) {
  const WithProFooterComponent = (props: P) => {
    return (
      <PageWithProFooter 
        className={layoutProps?.className} 
        containerClass={layoutProps?.containerClass}
      >
        <WrappedComponent {...props} />
      </PageWithProFooter>
    );
  };

  WithProFooterComponent.displayName = `withProFooter(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithProFooterComponent;
}
