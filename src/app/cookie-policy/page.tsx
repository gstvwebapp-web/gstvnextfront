import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - GSTV',
  description: 'Learn about how GSTV uses cookies and similar technologies on our website.',
  openGraph: {
    title: 'Cookie Policy - GSTV',
    description: 'Learn about how GSTV uses cookies and similar technologies on our website.',
    url: 'https://www.gstv.in/cookie-policy',
    siteName: 'GSTV',
    type: 'website',
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="blogs-main-section inner">
      <div className="detail-page-heading-h1">
        <h1 className="content-page-title">Cookie Policy</h1>
      </div>
      <div className="row blog-content" id="news-container">
        <div className="col-lg-12 detail-page custom-content-page">
          <div className="blog-read-content">
            <div className="detail-page custom-content-text">
              <div className="policy-page">
                <h2>Cookie Policy for GSTV</h2>
                <p>This is the Cookie Policy for GSTV, accessible from GSTV.in</p>

                <h3>What Are Cookies</h3>
                <p>
                  As is common practice with almost all professional websites, this site uses cookies, 
                  which are tiny files that are downloaded to your computer, to improve your experience. 
                  This page describes what information they gather, how we use it and why we sometimes 
                  need to store these cookies. We will also share how you can prevent these cookies from 
                  being stored however this may downgrade or break certain elements of the site's functionality.
                </p>

                <h3>How We Use Cookies</h3>
                <p>
                  We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, 
                  there are no industry standard options for disabling cookies without completely disabling 
                  the functionality and features they add to this site. It is recommended that you leave on 
                  all cookies if you are not sure whether you need them or not in case they are used to 
                  provide a service that you use.
                </p>

                <h3>Disabling Cookies</h3>
                <p>
                  You can prevent the setting of cookies by adjusting the settings on your browser 
                  (see your browser Help for how to do this). Be aware that disabling cookies will affect 
                  the functionality of this and many other websites that you visit. Disabling cookies will 
                  usually result in also disabling certain functionality and features of this site. 
                  Therefore it is recommended that you do not disable cookies.
                </p>

                <h3>The Cookies We Set</h3>
                <ul>
                  <li>
                    <strong>Account related cookies:</strong> If you create an account with us, we will use 
                    cookies for the management of the signup process and general administration. These cookies 
                    will usually be deleted when you log out however in some cases they may remain afterwards 
                    to remember your site preferences when logged out.
                  </li>
                  <li>
                    <strong>Login related cookies:</strong> We use cookies when you are logged in so that we 
                    can remember this fact. This prevents you from having to log in every single time you visit 
                    a new page. These cookies are typically removed or cleared when you log out to ensure that 
                    you can only access restricted features and areas when logged in.
                  </li>
                  <li>
                    <strong>Site preferences cookies:</strong> In order to provide you with a great experience 
                    on this site, we provide the functionality to set your preferences for how this site runs 
                    when you use it. In order to remember your preferences, we need to set cookies so that this 
                    information can be called whenever you interact with a page is affected by your preferences.
                  </li>
                </ul>

                <h3>Third Party Cookies</h3>
                <p>
                  In some special cases, we also use cookies provided by trusted third parties. The following 
                  section details which third party cookies you might encounter through this site.
                </p>
                <ul>
                  <li>
                    This site uses Google Analytics which is one of the most widespread and trusted analytics 
                    solutions on the web for helping us to understand how you use the site and ways that we can 
                    improve your experience. These cookies may track things such as how long you spend on the 
                    site and the pages that you visit so we can continue to produce engaging content.
                  </li>
                  <li>
                    From time to time we test new features and make subtle changes to the way that the site is 
                    delivered. When we are still testing new features these cookies may be used to ensure that 
                    you receive a consistent experience whilst on the site whilst ensuring we understand which 
                    optimizations our users appreciate the most.
                  </li>
                </ul>

                <h3>More Information</h3>
                <p>
                  Hopefully that has clarified things for you and as was previously mentioned if there is 
                  something that you aren't sure whether you need or not it's usually safer to leave cookies 
                  enabled in case it does interact with one of the features you use on our site.
                </p>
                <p>
                  However, if you are still looking for more information, you can contact us through one of 
                  our preferred contact methods:
                </p>
                <ul>
                  <li>Email: gstvwebsite@gmail.com</li>
                  <li>Phone: +91 98254 93898</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
