import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '../components/navbar';
import { sanity } from '@/lib/sanity.client';
import { urlFor } from '@/lib/sanity.image';
import { ur } from 'zod/v4/locales';

async function getData() {
  const query = `*[_type=="post"]{
  title,
   "currentSlug": slug.current,
    shortDescription,
    mainImage,
  "mainImage":mainImage.asset._ref
}
`;

  const data = await sanity.fetch(query);
  return data;
}

export default async function BlogList() {
  const data = await getData();
  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="mt-10 text-5xl font-extrabold mb-12 text-center dark:text-white text-black bg-clip-text">
          Our Blogs
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.map((blog) => (
            <div
              key={blog.currentSlug}
              className="rounded-2xl shadow-lg overflow-hidden  hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <Image
                src={urlFor(blog.mainImage).url()}
                alt={blog.title}
                width={600}
                height={350}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex flex-col">
                <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.shortDescription}
                </p>
                <Link
                  href={`/blog/${blog.currentSlug}`}
                  className="mt-auto inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
