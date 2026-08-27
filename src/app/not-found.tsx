import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-12">
          <div className="not-found-page" style={{ 
            textAlign: 'center', 
            padding: '50px 20px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontSize: '72px', 
              color: '#850E00', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              404
            </h1>
            <h2 className="custom-gujrati-font" style={{ 
              color: '#850E00', 
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              પેજ મળ્યું નથી
            </h2>
            <p className="custom-gujrati-font" style={{ 
              color: '#666', 
              marginBottom: '30px',
              fontSize: '16px'
            }}>
              તમે જે પેજ શોધી રહ્યા છો તે અસ્તિત્વમાં નથી અથવા ખસેડવામાં આવ્યું છે.
            </p>
            <Link 
              href="/" 
              className="custom-link-btn"
              style={{
                backgroundColor: '#850E00',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                display: 'inline-block',
                fontSize: '16px'
              }}
            >
              <span className="custom-gujrati-font">હોમ પેજ પર જાઓ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
