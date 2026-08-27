import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Poll Results | GSTV News',
  description: 'View the latest poll results and voting statistics on GSTV News. See what people are saying about current topics and issues.',
  keywords: 'poll results, voting, statistics, GSTV, news, Gujarat, public opinion',
  openGraph: {
    title: 'Poll Results | GSTV News',
    description: 'View the latest poll results and voting statistics on GSTV News.',
    type: 'website',
    siteName: 'GSTV News',
  },
  twitter: {
    card: 'summary',
    title: 'Poll Results | GSTV News',
    description: 'View the latest poll results and voting statistics on GSTV News.',
  },
};

export default function PollResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
