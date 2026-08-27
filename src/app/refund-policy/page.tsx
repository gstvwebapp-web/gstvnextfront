import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - GSTV',
  description: 'Learn about GSTV refund and cancellation policy for subscriptions and services.',
  openGraph: {
    title: 'Refund Policy - GSTV',
    description: 'Learn about GSTV refund and cancellation policy for subscriptions and services.',
    url: 'https://www.gstv.in/refund-policy',
    siteName: 'GSTV',
    type: 'website',
  },
};

export default function RefundPolicyPage() {
  const refundHtml = `
    <h4>NO REFUNDS</h4>
    <p>We do not provide any credit, refunds, or prorated billing for subscriptions that are cancelled anytime during subscription.</p>
    <p>Subscription once made cannot be cancelled during the subscription period.</p>
    <p>In case your Card is charged twice, we may take upto 14 working days to process & refund your payment in the same payment mode.</p>
  `;

  return (
    <div className="blogs-main-section inner">
      <div className="detail-page-heading-h1">
        <h1 className="content-page-title">Refund Policy</h1>
      </div>

      <div className="row blog-content" id="news-container">
        <div className="col-lg-12 detail-page custom-content-page">
          <div className="blog-read-content">
            <div className="detail-page custom-content-text">
              <div
                className="policy-page"
                dangerouslySetInnerHTML={{ __html: refundHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}