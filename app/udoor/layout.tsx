import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UDOR Feeds Brand',
  description: 'Produced by IKPL, UDOR Feeds delivers nutritionally balanced feed products developed for performance, health, and a sustainable future for Bhutanese farmers.',
};

export default function UdoorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
