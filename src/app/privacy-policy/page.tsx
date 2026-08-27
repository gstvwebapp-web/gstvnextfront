import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - GSTV',
  description: 'Read about how GSTV collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy - GSTV',
    description: 'Read about how GSTV collects, uses, and protects your personal information.',
    url: 'https://www.gstv.in/privacy-policy',
    siteName: 'GSTV',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const privacyHtml = `
<p><strong>Effective date: October 01, 2018</strong></p>
<p>Shreyarth Aaspas LTD (“us”, “we”, or “our”) operates the https://www.gstv.in website and the GSTV NEWS mobile application (the “Service”).</p>
<p>This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
<p>We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms and Conditions.</p>

<h3>Information Collection And Use</h3>
<p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>

<h3>Types of Data Collected</h3>
<p><strong>Personal Data</strong></p>
<p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (“Personal Data”). Personally identifiable information may include, but is not limited to:</p>

<ul>
<li>Email address</li>
<li>First name and last name</li>
<li>Phone number</li>
<li>Address, State, Province, ZIP/Postal code, City</li>
<li>Cookies and Usage Data</li>
</ul>

<h3>Usage Data</h3>
<p>We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device (“Usage Data”).</p>

<h3>Tracking & Cookies Data</h3>
<p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.</p>

<h3>Use of Data</h3>
<p>Shreyarth Aaspas LTD uses the collected data for various purposes:</p>

<ul>
<li>To provide and maintain the Service</li>
<li>To notify you about changes to our Service</li>
<li>To provide customer care and support</li>
<li>To monitor the usage of the Service</li>
<li>To detect, prevent and address technical issues</li>
</ul>

<h3>Security Of Data</h3>
<p>The security of your data is important to us, but remember that no method of transmission over the Internet is 100% secure.</p>

<h3>Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us:</p>
<p>By email: <a href="mailto:gstvwebsite@gmail.com">gstvwebsite@gmail.com</a></p>
`;

  return (
    <div className="blogs-main-section inner">
      <div className="detail-page-heading-h1">
        <h1 className="content-page-title">Privacy Policy</h1>
      </div>

      <div className="row blog-content" id="news-container">
        <div className="col-lg-12 detail-page custom-content-page">
          <div className="blog-read-content">
            <div className="detail-page custom-content-text">
              <div
                className="policy-page"
                dangerouslySetInnerHTML={{ __html: privacyHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}