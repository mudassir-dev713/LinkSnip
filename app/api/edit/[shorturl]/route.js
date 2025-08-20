import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

export async function PATCH(request, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { shorturl } = await params;
  const body = await request.json();
  const { fullUrl, title, password, shortUrl: customAlias } = body;

  // -------------------
  // Validation
  // -------------------
  const errors = {};

  if (!fullUrl || typeof fullUrl !== 'string') {
    errors.fullUrl = 'Full URL is required';
  } else {
    try {
      const parsed = new URL(fullUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.fullUrl = 'URL must start with http:// or https://';
      }
    } catch {
      errors.fullUrl = 'Invalid URL format';
    }
  }

  if (title && title.length > 100) {
    errors.title = 'Title cannot exceed 100 characters';
  }

  if (customAlias && !/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
    errors.shortUrl = 'Alias can only contain letters, numbers, -, and _';
  }

  if (password && password.length < 2) {
    errors.password = 'Password must be at least 2 characters';
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    // Ensure the document belongs to the logged-in user
    const urlDoc = await ShortUrl.findOne({
      _id: shorturl,
      user: session.user.id,
    });
    if (!urlDoc) {
      return NextResponse.json(
        { error: 'URL not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update only provided fields
    if (fullUrl) urlDoc.fullUrl = fullUrl;
    if (typeof title !== 'undefined') urlDoc.title = title;
    if (typeof password !== 'undefined') urlDoc.password = password;
    if (typeof customAlias !== 'undefined') urlDoc.shortUrl = customAlias;

    await urlDoc.save();

    return NextResponse.json({ message: 'Short URL updated.', data: urlDoc });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update short URL.' },
      { status: 500 }
    );
  }
}
