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
      // Logged in user
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
            { status: 409 }
          );
        }
        throw err;
      }
    } else {
      // Anonymous user
      if (password || customAlias) {
        return NextResponse.json(
          { error: 'You must be logged in to use password or custom alias.' },
          { status: 403 }
        );
      }

      const cookieStore = await cookies();
      let anonId = cookieStore.get('anonId')?.value;

      let setNewCookie = false;
      if (!anonId) {
        anonId = generateAnonId();
        setNewCookie = true;
      }
      shorturl = await createShortUrlWithoutUser(formattedUrl, anonId, title);

      const response = NextResponse.json({
        _id: shorturl._id,
        message: 'Short URL created successfully',
        shortUrl: process.env.NEXT_PUBLIC_BASE_URL + '/' + shorturl.shortUrl,
        fullUrl: formattedUrl,
        createdAt: shorturl.createdAt,
        updatedAt: shorturl.updatedAt,
        title: shorturl.title,
        user: shorturl.user || null,
        password: shorturl.password || null,
        status: shorturl.status || 'active',
      });

      if (setNewCookie) {
        response.cookies.set('anonId', anonId, { path: '/', httpOnly: true });
      }

      return response;
    }

    // Logged in response
    return NextResponse.json({
      _id: shorturl._id,
      message: 'Short URL created successfully',
      shortUrl: process.env.NEXT_PUBLIC_BASE_URL + '/' + shorturl.shortUrl,
      fullUrl: formattedUrl,
      createdAt: shorturl.createdAt,
      updatedAt: shorturl.updatedAt,
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
