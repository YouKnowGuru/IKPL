import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'View photos of the IKPL facilities, our distribution networks, and the successful farmers utilizing our premium feeds across Bhutan.',
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
