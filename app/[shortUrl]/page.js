// app/[shortUrl]/page.js
import UrlInfoClient from './UrlInfoClient';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';

export default async function UrlPage({ params }) {
  await dbConnect();

  const { shortUrl } = await params;

  const urlData = await ShortUrl.findOne({ shortUrl: shortUrl }).lean();

  if (!urlData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold">❌ URL Not Found</h2>
      </div>
    );
  }

  return <UrlInfoClient urlData={JSON.parse(JSON.stringify(urlData))} />;
}
