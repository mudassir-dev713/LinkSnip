'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../urlsnip-blog/sanity.config'; // IMPORTANT

export default function StudioPage() {
  return <NextStudio config={config} />;
}
