// utils/helper.js
import ShortUrl from '@/models/ShortUrl';
import { customAlphabet } from 'nanoid';

export const generateNanoId = (length = 8) => {
  const nanoid = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
    length
  );
  return nanoid();
};

export const getCustomShortUrl = async (slug) => {
  return await ShortUrl.findOne({ shortUrl: slug });
};

export const generateAnonId = () => {
  return generateNanoId(32); // Generates a 32-character anonymous ID
};
