import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Premium Products',
  description: 'Explore the full range of IKPL and UDOR premium animal feeds. Nutritionally balanced, scientifically formulated feeds for poultry, cattle, pigs, and fish.',
  openGraph: {
    title: 'Our Premium Products | IKPL',
    description: 'Explore the full range of IKPL and UDOR premium animal feeds. Nutritionally balanced, scientifically formulated feeds for poultry, cattle, pigs, and fish.',
  }
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
