'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_V5_BASE_URL } from '@/constants/api';
import Head from 'next/head';

interface PageData {
  id: number;
  title: string;
  description: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  pages: PageData;
  status?: boolean;
  message?: string;
}

const DynamicPage: React.FC = () => {
  const params = useParams();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params?.slug as string;

  useEffect(() => {
    const fetchPageData = async () => {
      if (!params || !params.slug || !slug) {
        setError('Page not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiUrl = `${API_V5_BASE_URL}/page/${slug}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Page not found. This page may not exist in the database.');
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (!data || !data.pages) {
          throw new Error(data?.message || 'Page not found in database');
        }

        setPageData(data.pages);
        
        // Update page title
        document.title = `${data.pages.title} - GSTV`;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load page';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug, params]);

  if (loading) {
    return (
      <div className="blogs-main-section inner">
        <div className="detail-page-heading-h1">
          <h1 className="content-page-title">Loading...</h1>
        </div>
        <div className="row blog-content" id='news-container'>
          <div className="col-lg-12 detail-page custom-content-page">
            <div className="blog-read-content">
              <div className="detail-page custom-content-text">
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                  <p>Loading page content...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-main-section inner">
        <div className="detail-page-heading-h1">
          <h1 className="content-page-title">Error</h1>
        </div>
        <div className="row blog-content" id="news-container">
          <div className="col-lg-12 detail-page custom-content-page">
            <div className="blog-read-content">
              <div className="detail-page custom-content-text">
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#dc3545' }}>
                  <i className="fa-solid fa-exclamation-triangle" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                  <p>{error}</p>
                  <p style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
                    This page may not exist in the database. Please contact the administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="blogs-main-section inner">
        <div className="detail-page-heading-h1">
          <h1 className="content-page-title">Page Not Found</h1>
        </div>
        <div className="row blog-content" id="news-container">
          <div className="col-lg-12 detail-page custom-content-page">
            <div className="blog-read-content">
              <div className="detail-page custom-content-text">
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                  <p>The requested page could not be found.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageData.title} - GSTV</title>
        <meta name="description" content={pageData.description.replace(/<[^>]*>/g, '').substring(0, 160)} />
      </Head>
      <div className="blogs-main-section inner">
        <div className="detail-page-heading-h1">
          <h1 className="content-page-title">{pageData.title}</h1>
        </div>
        <div className="row blog-content" id='news-container'>
          <div className="col-lg-12 detail-page custom-content-page">
            <div className="blog-read-content">
              <div className="detail-page custom-content-text">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: pageData.description 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicPage;