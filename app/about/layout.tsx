import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about IKPL Group. Established in 2004, we are Bhutan\'s trusted provider of premium animal feeds, with manufacturing plants across Pasakha and a mission to revolutionize agriculture.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
