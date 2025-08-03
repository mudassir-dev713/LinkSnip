import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/dbConnect';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import {
  createShortUrlWithoutUser,
  createShortUrlWithUser,
} from '@/utils/createShortUrl';
import { generateAnonId } from '@/utils/helper';

export async function POST(req) {
  try {
    const { url, password, customAlias, title } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }

    await dbConnect();
    const session = await getServerSession(authOptions);
    let shorturl;
    if (session?.user?.id) {
      try {
        shorturl = await createShortUrlWithUser(
          formattedUrl,
          session.user.id,
          customAlias,
          password,
          title
        );
      } catch (err) {
        if (
          err.message.includes('Custom alias already exists') ||
          err.code === 11000
        ) {
          return NextResponse.json(
            {
              error: 'Custom alias already exists. Please choose another one.',
            },
            { status: 409 } // Conflict
          );
        }
        throw err; // Re-throw if it's some other error
      }
    } else {
      if (password || customAlias) {
        return NextResponse.json(
          { error: 'You must be logged in to use password or custom alias.' },
          { status: 403 }
        );
      }

      const cookieStore = await cookies(); // no `await`
      let anonId = cookieStore.get('anonId')?.value;

      if (!anonId) {
        const newAnonId = generateAnonId();
        anonId = newAnonId;
        // You must use `NextResponse` to set cookies
        const response = NextResponse.json(
          { message: 'Short URL created successfully' },
          {
            status: 201,
          }
        );
        response.cookies.set('anonId', newAnonId);
        return response;
      }

      shorturl = await createShortUrlWithoutUser(formattedUrl, anonId, title);
    }

    return NextResponse.json({
      _id: shorturl._id,
      message: 'Short URL created successfully',
      shortUrl: process.env.NEXT_PUBLIC_BASE_URL + '/' + shorturl.shortUrl,
      fullUrl: formattedUrl,
      createdAt: shorturl.createdAt,
      createdAt: shorturl.updatedAt,
      title: shorturl.title,
      user: shorturl.user || null,
      password: shorturl.password || null,
      status: shorturl.status || 'active',
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
