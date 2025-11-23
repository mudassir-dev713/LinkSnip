import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/dbConnect";
import ShortUrl from "@/models/ShortUrl";

export default async function sitemap() {
  const baseUrl = 'https://urlsnip.vercel.app';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/qr-generator`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Connect to database to get dynamic content
  await dbConnect();
  
  // Get all public URLs (this is a simplified example)
  // In a real app, you might want to limit this or use a different approach
  const publicUrls = await ShortUrl.find({ status: 'active' }).limit(1000);
  
  const dynamicUrls = publicUrls.map(url => ({
    url: `${baseUrl}/${url.shortUrl}`,
    lastModified: url.updatedAt || url.createdAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...dynamicUrls];
}