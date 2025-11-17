import Image from 'next/image';
import Link from 'next/link';
import { blogs } from '../../data/blogs';
import { Navbar } from '@/app/components/navbar';
import { Footer } from '@/app/components/footer';
import { Metadata } from 'next';
import { sanity } from '@/lib/sanity.client';
import { urlFor } from '@/lib/sanity.image';

import { PortableText } from '@portabletext/react';
async function getBlog(slug) {
  const query = `*[_type=="post" && slug.current == "${slug}"]{
    title,
     content,
    "mainImage":mainImage.asset._ref
  }
  `;

  const data = await sanity.fetch(query);
  return data;
}
export async function generateMetadata({ params }) {
  const data = await getBlog(params.id);
  const blog = data[0];

  return {
    title: blog?.title,
    description: blog?.seo?.description,
    openGraph: {
      title: blog?.title,
      description: blog?.seo?.description,
      images: [blog?.seo?.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog?.title,
      description: blog?.seo?.description,
      images: [blog?.seo?.image],
    },
  };
}

export default async function BlogDetail({ params }) {
  const data = await getBlog(params.id);
  const blog = data[0];
  console.log(blog);
  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Blog not found</h1>
        <Link href="/blog" className="text-blue-600 hover:underline mt-4 block">
          ← Back to blogs
        </Link>
      </div>
    );
  }

  return (
    <>
      <div>
        <Navbar />
        <main className="pt-8 pb-16 lg:pt-16 lg:pb-24 antialiased mt-10">
          <div className="flex justify-between px-4 mx-auto max-w-screen-xl">
            <article className="mx-auto w-full max-w-2xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert">
              <header className="mb-6 not-format">
                <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:text-4xl dark:text-white">
                  {blog.title}
                </h1>
                <Image
                  src={urlFor(blog.mainImage).url()}
                  alt={blog.title}
                  width={800}
                  height={400}
                  priority
                  className="rounded-xl mt-4"
                />
              </header>

              {/* Dynamic Blog Content */}
              <div className="prose dark:prose-invert">
                <PortableText value={blog.content} />
              </div>
            </article>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
