import { NextResponse } from 'next/server';
import { getActiveAnnouncements } from '@/data/announcements';

export async function GET() {
  try {
    // TODO: Fetch from Google Sheets
    // const sheetData = await fetchAnnouncementsFromSheet();
    
    const announcements = getActiveAnnouncements();
    
    return NextResponse.json({
      success: true,
      data: announcements,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch announcements'
    }, { status: 500 });
  }
}
