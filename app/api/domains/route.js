import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Domain from '@/models/Domain';

export async function GET(request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const domains = await Domain.find({ user: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { domain } = body;

    // Check if domain already exists for this user
    const existingDomain = await Domain.findOne({ 
      domain: domain.toLowerCase(), 
      user: session.user.id 
    });

    if (existingDomain) {
      return NextResponse.json({ error: 'Domain already added' }, { status: 400 });
    }

    // Create new domain entry
    const newDomain = new Domain({
      domain: domain.toLowerCase(),
      user: session.user.id,
      verificationToken: Math.random().toString(36).substring(2, 15),
      verificationMethod: 'DNS'
    });

    await newDomain.save();
    return NextResponse.json({ domain: newDomain });
  } catch (error) {
    console.error('Error adding domain:', error);
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 });
  }
}

export async function PUT(request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { domainId, action } = body;

    if (action === 'verify') {
      // In a real implementation, you would check DNS records here
      // For now, we'll simulate verification
      const domain = await Domain.findOne({ 
        _id: domainId, 
        user: session.user.id 
      });

      if (!domain) {
        return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
      }

      // Simulate verification (80% success rate)
      const isVerified = Math.random() > 0.2;
      
      if (isVerified) {
        domain.isVerified = true;
        await domain.save();
        return NextResponse.json({ success: true, domain });
      } else {
        return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json({ error: 'Failed to verify domain' }, { status: 500 });
  }
}