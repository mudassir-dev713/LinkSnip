import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';

export async function POST(request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { linkId, rules } = body;

    // Validate rules format
    if (!Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json({ error: 'Invalid rules format' }, { status: 400 });
    }

    // Find the link and ensure it belongs to the user
    const link = await ShortUrl.findOne({ 
      _id: linkId, 
      user: session.user.id 
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Save retargeting rules to the database
    link.retargetingRules = rules;
    await link.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Retargeting rules saved successfully' 
    });
  } catch (error) {
    console.error('Error saving retargeting rules:', error);
    return NextResponse.json({ error: 'Failed to save retargeting rules' }, { status: 500 });
  }
}