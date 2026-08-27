'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdSlot from './AdSlot';
import ProFooter from './ProFooter';
import RightSidebar from './RightSidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check if current page should hide sidebars
  const shouldHideSidebars = pathname?.startsWith('/epaper') || pathname?.startsWith('/review') || pathname?.startsWith('/payment') || pathname?.startsWith('/magazine') || pathname?.startsWith('/buddhiprakash') || pathname?.startsWith('/videos/') || pathname === '/login' || pathname === '/profile' || pathname === '/bookmarklist' || pathname === '/userpoint' || pathname === '/addekasana' || pathname === '/addjournalist' || pathname === '/addcampuscorner' || pathname === '/addganapati' || pathname === '/getcampuscorner' || pathname === '/getganapati' || pathname === '/getjournalist' || pathname?.startsWith('/getekasana') || pathname === '/career';

  // Extract the actual page content (last child)
  const childrenArray = React.Children.toArray(children);
  const leftSidebar = childrenArray[0];
  const rightSidebar = childrenArray[1];
  const pageContent = childrenArray[2];

  // Fix hydration error - check mobile on client side only
  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showRightSidebar = !shouldHideSidebars && !isMobile;

  
  if (shouldHideSidebars) {
    // Check if it's a video detail page for full-screen layout
    if (pathname?.startsWith('/videos/')) {
      // Full-screen video layout
        return (
          <>
            {/* <AdSlot slotId="gstvin_top" /> */}

            {pageContent}
            {/* <AdSlot slotId="gstvin_footer" /> */}
          </>
        );
      //return <>{pageContent}</>;
    }

    // Check if it's login page for full-screen centered layout
    if (pathname === '/login') {
      return (
        <>
          <AdSlot slotId="gstvin_top" />

          {pageContent}
          <AdSlot slotId="gstvin_footer" />
        </>
      );
      //return <>{pageContent}</>;
    }

    // Check if it's profile page for full-width layout (with header)
    if (pathname === '/profile') {
      // Profile page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div" id="middlePage">
         
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
            <ProFooter />
        </div>
      );
    }

    // Check if it's career page for full-width layout (with header)
    if (pathname === '/career') {
      // Career page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div career-layout" id="middlePage">
            
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
            
          <ProFooter />
        </div>
      );
    }

    // Check if it's bookmarklist page for full-width layout (with header)
    if (pathname === '/bookmarklist') {
      // Bookmarklist page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div bookmarklist-layout" id="middlePage">
          
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
             
            <ProFooter />
        </div>
      );
    }

    // Check if it's userpoint page for full-width layout (with header)
    if (pathname === '/userpoint') {
      // Userpoint page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div userpoint-layout" id="middlePage">
          
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
                <ProFooter />
              </div>
           
      );
    }

    // Check if it's addekasana page for full-width layout (with header)
    if (pathname === '/addekasana') {
      // Addekasana page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div addekasana-layout" id="middlePage">
          
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
            <ProFooter />
        </div>
      );
    }

    // Check if it's getekasana page for full-width layout (with header)
    if (pathname?.startsWith('/getekasana')) {
      // Getekasana page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div getekasana-layout" id="middlePage">
          
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
             <ProFooter />
        </div>
      );
    }

    // Check if it's addjournalist page for full-width layout (with header)
    if (pathname === '/addjournalist') {
      // Addjournalist page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div" id="middlePage">
          
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
             <ProFooter />
        </div>
      );
    }

    // Check if it's addcampuscorner page for full-width layout (with header)
    if (pathname === '/addcampuscorner') {
      // Addcampuscorner page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div" id="middlePage">
          
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
             <ProFooter />
        </div>
      );
    }



    // Check if it's getcampuscorner page for full-width layout (with header)
    if (pathname === '/getcampuscorner') {
      // Getcampuscorner page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div" id="middlePage">
          
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
          <ProFooter />
        </div>
      );
    }

    // Check if it's getganapati page for full-width layout (with header)
    if (pathname === '/getganapati') {
      // Getganapati page layout - full width without sidebars but with header space
      return (
        <div className="contents-main-div" id="middlePage">
        
                {/* Top Ad Slot */}
                <AdSlot slotId="gstvin_top" />

                {pageContent}

                {/* Footer Ad Slot */}
                <AdSlot slotId="gstvin_footer" />
        <ProFooter />
        </div>
      );
    }



    // Epaper pages: Full width layout without sidebars
    return (
      <div className="contents-main-div epaper-layout" id="middlePage">
        
              {/* Top Ad Slot */}
              <AdSlot slotId="gstvin_top" />

              {pageContent}

              {/* Footer Ad Slot */}
              <AdSlot slotId="gstvin_footer" />
          <ProFooter />
      </div>
    );
  }

  // Default layout: With sidebars
  if (shouldHideSidebars) {
    return (
      <div className="contents-main-div" id="middlePage">
        <AdSlot slotId="gstvin_top" />
        {pageContent}
        <AdSlot slotId="gstvin_footer" />
        <ProFooter />
      </div>
    );
  }

  // DEFAULT LAYOUT WITH OPTIONAL RIGHT SIDEBAR
  return (
    <div className="contents-main-div">
      {leftSidebar}
      <div className="row left-nav">
        <div className="col-md-9 col-lg-9 Center-main-div">
          <AdSlot slotId="gstvin_top" />
          {pageContent}
          <AdSlot slotId="gstvin_footer" />
        </div>

        {/* RIGHT SIDEBAR CONTROLLED HERE */}
        {showRightSidebar && (
          <div className="col-md-3 col-lg-3 right-sidebar">
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );

};

export default LayoutWrapper;
