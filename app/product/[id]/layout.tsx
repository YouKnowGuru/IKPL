import type { Metadata } from 'next';
import connectDB from '@/lib/db';
import { Product } from '@/models';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const product = await Product.findById(id).lean() as any;

    if (!product) {
      return { title: 'Product Not Found | IKPL' };
    }

    const cleanDescription = product.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
    const imageUrl = product.images?.length > 0 ? product.images[0] : (product.image || undefined);

    return {
      title: product.name,
      description: cleanDescription,
      openGraph: {
        title: product.name,
        description: cleanDescription,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: cleanDescription,
        images: imageUrl ? [imageUrl] : [],
      }
    };
  } catch (error) {
    return { title: 'Product | IKPL' };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
