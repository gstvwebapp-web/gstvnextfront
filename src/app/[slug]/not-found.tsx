import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="blogs-main-section inner">
      <div className="detail-page-heading-h1">
        <h1 className="content-page-title">Page Not Found</h1>
      </div>
      <div className="row blog-content">
        <div className="col-lg-12 detail-page custom-content-page">
          <div className="blog-read-content">
            <div className="detail-page custom-content-text">
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <i className="fa-solid fa-file-circle-exclamation" style={{ fontSize: '64px', color: '#dc3545', marginBottom: '20px' }}></i>
                <h2 style={{ marginBottom: '15px', color: '#333' }}>404 - Page Not Found</h2>
                <p style={{ marginBottom: '30px', color: '#666', fontSize: '16px' }}>
                  The page you are looking for could not be found.
                </p>
                <Link 
                  href="/" 
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                  <i className="fa-solid fa-home" style={{ marginRight: '8px' }}></i>
                  Go Back Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
