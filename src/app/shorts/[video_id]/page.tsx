import { Metadata } from 'next';
import ShortsDetailClient from './ShortsDetailClient';

interface Props {
  params: { video_id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'GSTV Shorts',
    description: 'GSTV Shorts Videos',
  };
}

export default function ShortsDetailPage({ params }: Props) {
  return <ShortsDetailClient initialVideoId={params.video_id} />;
}
