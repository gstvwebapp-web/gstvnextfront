import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - GSTV',
  description: 'Get in touch with GSTV. Contact us for any queries, feedback, or support.',
  openGraph: {
    title: 'Contact Us - GSTV',
    description: 'Get in touch with GSTV. Contact us for any queries, feedback, or support.',
    url: 'https://www.gstv.in/contact-us',
    siteName: 'GSTV',
    type: 'website',
  },
};

export default function ContactUsPage() {
  return (
    <div className="blogs-main-section inner">
      <div className="detail-page-heading-h1">
        <h1 className="content-page-title">Contact Us</h1>
      </div>

      <div className="row blog-content">
        <div className="col-lg-12 detail-page custom-content-page">
          <div className="blog-read-content">
            <div className="detail-page custom-content-text">

              <p><strong>Address:</strong> GSTV, Nr. ISCKON Temple, S. G Highway, Ahmedabad</p>

              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:gstvwebsite@gmail.com">
                  gstvwebsite@gmail.com
                </a>
              </p>

              <p>
                <strong>Telephone:</strong>{' '}
                <a href="tel:+919825493898">
                  +91 98254 93898
                </a>
              </p>

              <p>
                <iframe
                  style={{ border: 0 }}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.8425483211463!2d72.50548905074467!3d23.02955268487571!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9b38353e64d7%3A0x47e9f584b56e8eed!2sGSTV+News!5e0!3m2!1sen!2sin!4v1552985953796"
                  width="100%"
                  height="450"
                  allowFullScreen
                  loading="lazy"
                />
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}