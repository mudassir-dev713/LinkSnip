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

    if (!domain || !domain.includes('.')) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Check if domain already exists for this user
    const existingDomain = await Domain.findOne({ 
      domain: domain.toLowerCase().trim(), 
      user: session.user.id 
    });

    if (existingDomain) {
      return NextResponse.json({ error: 'Domain already added' }, { status: 400 });
    }

    // Create new domain entry
    const newDomain = new Domain({
      domain: domain.toLowerCase().trim(),
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

    if (action !== 'verify') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the domain and ensure it belongs to the user
    const domain = await Domain.findOne({ 
      _id: domainId, 
      user: session.user.id 
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // In a real implementation, you would check DNS records here
    // For demo purposes, we'll simulate verification
    const isVerified = Math.random() > 0.3; // 70% success rate
    
    if (isVerified) {
      domain.isVerified = true;
      await domain.save();
      return NextResponse.json({ success: true, domain });
    } else {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json({ error: 'Failed to verify domain' }, { status: 500 });
  }
}