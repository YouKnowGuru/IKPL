import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'IKPL Privacy Policy outlining how we handle your personal data and ensure the security of your information on our modern feed distribution platform.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
