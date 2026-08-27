'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Entry {
  id: string;
  title: string;
  content: string;
  date: string;
  status: 'draft' | 'published';
}

const MyEntriesPage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading entries from localStorage or API
    const loadEntries = () => {
      try {
        const savedEntries = localStorage.getItem('athaitap-entries');
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  const deleteEntry = (id: string) => {
    if (confirm('શું તમે ખરેખર આ એન્ટ્રી ડિલીટ કરવા માંગો છો?')) {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      localStorage.setItem('athaitap-entries', JSON.stringify(updatedEntries));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('gu-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="blogs-main-section inner">
      <div className="athaitap-page-header">
        <h1 className="athaitap-main-title">
          મારા એકાસન
        </h1>
        <div className="athaitap-subtitle-container">
          <Link href="/athaitap" className="athaitap-user-link">
            ← પાછા જાઓ
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <p>લોડ થઈ રહ્યું છે...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center">
              <div style={{
                padding: '40px 20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                margin: '20px 0',
                border: '2px dashed #dee2e6'
              }}>
                <h3 style={{ color: '#850e00', marginBottom: '20px' }}>
                  હજુ સુધી કોઈ એન્ટ્રી નથી
                </h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  તમે હજુ સુધી કોઈ એન્ટ્રી બનાવી નથી. તમારી પ્રથમ એન્ટ્રી ઉમેરીને શરૂઆત કરો!
                </p>
                <Link href="/athaitap/create" className="btn btn-primary">
                  નવી એન્ટ્રી ઉમેરો
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>કુલ એન્ટ્રીઓ: {entries.length}</h3>
                <Link href="/athaitap/create" className="btn btn-primary">
                  નવી એન્ટ્રી ઉમેરો
                </Link>
              </div>

              <div className="row">
                {entries.map((entry) => (
                  <div key={entry.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100" style={{ border: '1px solid #dee2e6' }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title" style={{ color: '#850e00' }}>
                            {entry.title}
                          </h5>
                          <span className={`badge ${entry.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                            {entry.status === 'published' ? 'પ્રકાશિત' : 'ડ્રાફ્ટ'}
                          </span>
                        </div>
                        <p className="card-text text-muted small">
                          {formatDate(entry.date)}
                        </p>
                        <p className="card-text">
                          {entry.content.length > 100
                            ? entry.content.substring(0, 100) + '...'
                            : entry.content}
                        </p>
                      </div>
                      <div className="card-footer bg-transparent">
                        <div className="btn-group w-100">
                          <Link
                            href={`/athaitap/edit/${entry.id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            સંપાદિત કરો
                          </Link>
                          <Link
                            href={`/athaitap/view/${entry.id}`}
                            className="btn btn-outline-info btn-sm"
                          >
                            જુઓ
                          </Link>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            ડિલીટ કરો
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEntriesPage;