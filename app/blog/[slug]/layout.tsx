import type { Metadata } from 'next';
import connectDB from '@/lib/db';
import { Blog } from '@/models';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug }).lean() as any;

    if (!blog) {
      return { title: 'Post Not Found | IKPL' };
    }

    const cleanDescription = (blog.excerpt || blog.content.replace(/<[^>]*>?/gm, '')).substring(0, 160) + '...';

    return {
      title: blog.title,
      description: cleanDescription,
      openGraph: {
        title: blog.title,
        description: cleanDescription,
        images: blog.coverImage ? [{ url: blog.coverImage }] : [],
        type: 'article',
        publishedTime: blog.createdAt,
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: cleanDescription,
        images: blog.coverImage ? [blog.coverImage] : [],
      }
    };
  } catch (error) {
    return { title: 'Blog Post | IKPL' };
  }
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
