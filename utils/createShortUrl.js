import ShortUrl from '@/models/ShortUrl';
import { generateNanoId, getCustomShortUrl } from '@/utils/helper';
import bcrypt from 'bcryptjs';

export async function createShortUrlWithoutUser(
  url,
  anonId,
  title = 'Untitled Link',
  password = null
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
  title = 'Untitled Link',
  tags = [],
  extras = {}
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

  // The pre-save hook on the model hashes this before it hits the database.
  const urlShort = new ShortUrl({
    fullUrl: url,
    shortUrl: shorturl,
    user,
    password: password || null,
    title,
    tags,
    ...extras,
  });
  await urlShort.save();
  return urlShort;
}
