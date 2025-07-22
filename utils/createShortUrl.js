import ShortUrl from '@/models/ShortUrl';
import { generateNanoId, getCustomShortUrl } from '@/utils/helper';
import { NextResponse } from 'next/server';

export async function createShortUrlWithoutUser(
  url,
  anonId,
  password = null,
  title = 'Untitled Link'
) {
  const urlShort = new ShortUrl({
    fullUrl: url,
    shortUrl: generateNanoId(8),
    anonId,
    title,
  });
  await urlShort.save();
  return urlShort;
}

export async function createShortUrlWithUser(
  url,
  user,
  slug = null,
  password = null,
  title = 'Untitled Link'
) {
  const shorturl = slug || generateNanoId(8);
  if (slug) {
    const exists = await getCustomShortUrl(slug);
    if (exists) {
      throw new Error(
        'Custom alias already exists. Please choose another one.'
      );
    }
  }

  const urlShort = new ShortUrl({
    fullUrl: url,
    shortUrl: shorturl,
    user,
    password,
    title,
  });
  await urlShort.save();
  return urlShort;
}
