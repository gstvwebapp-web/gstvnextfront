'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-12">
          <div className="error-page" style={{ 
            textAlign: 'center', 
            padding: '50px 20px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h2 className="custom-gujrati-font" style={{ 
              color: '#850E00', 
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              કંઈક ખોટું થયું છે!
            </h2>
            <p className="custom-gujrati-font" style={{ 
              color: '#666', 
              marginBottom: '30px',
              fontSize: '16px'
            }}>
              પેજ લોડ કરવામાં સમસ્યા આવી છે. કૃપા કરીને ફરી પ્રયાસ કરો.
            </p>
            <button
              onClick={reset}
              className="custom-link-btn"
              style={{
                backgroundColor: '#850E00',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              <span className="custom-gujrati-font">ફરી પ્રયાસ કરો</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
