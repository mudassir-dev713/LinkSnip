import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { generateNanoId } from '@/utils/helper';

export async function POST(request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { urls } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    // Limit to 100 URLs per request
    if (urls.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 URLs per request' }, { status: 400 });
    }

    const results = [];
    
    for (const url of urls) {
      try {
        // Validate URL format
        let formattedUrl = url.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
          formattedUrl = 'https://' + formattedUrl;
        }

        // Create short URL
        const shortUrl = new ShortUrl({
          fullUrl: formattedUrl,
          shortUrl: generateNanoId(8),
          user: session.user.id,
          title: `Bulk URL ${results.length + 1}`
        });

        await shortUrl.save();
        results.push({
          original: url,
          short: `${process.env.NEXT_PUBLIC_BASE_URL}/${shortUrl.shortUrl}`,
          status: 'success',
          id: shortUrl._id
        });
      } catch (error) {
        results.push({
          original: url,
          short: null,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in bulk shortening:', error);
    return NextResponse.json({ error: 'Failed to process URLs' }, { status: 500 });
  }
}