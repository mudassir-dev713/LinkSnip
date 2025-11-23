import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';

export async function PUT(request, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { shortUrl } = params;
    const body = await request.json();
    const {
      utmSource,
      utmMedium,
      utmCampaign,
      abTesting,
      geoRedirects,
      deviceRedirects,
      oneTimeLink,
      password,
      scheduledActiveTimes,
      qrCodeBranding,
    } = body;

    // Find the link and ensure it belongs to the user
    const link = await ShortUrl.findOne({ 
      shortUrl: shortUrl, 
      user: session.user.id 
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Update link with new settings
    link.utmSource = utmSource;
    link.utmMedium = utmMedium;
    link.utmCampaign = utmCampaign;
    link.abTesting = abTesting;
    link.geoRedirects = geoRedirects;
    link.deviceRedirects = deviceRedirects;
    link.oneTimeLink = oneTimeLink;
    link.password = password;
    link.scheduledActiveTimes = scheduledActiveTimes;
    link.qrCodeBranding = qrCodeBranding;

    await link.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Smart link settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving smart link settings:', error);
    return NextResponse.json({ error: 'Failed to save smart link settings' }, { status: 500 });
  }
}