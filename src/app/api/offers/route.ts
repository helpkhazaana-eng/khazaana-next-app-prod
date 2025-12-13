import { NextResponse } from 'next/server';
import { getActiveOffers } from '@/data/offers'; // Fallback/Initial data
// In a real implementation, this would fetch from Google Sheets
// For now, we serve the static data which mimics the "cached" behavior
// Later, we can add the Google Sheets fetching logic here with revalidation

export async function GET() {
  try {
    // TODO: Fetch from Google Sheets using the Sheets API
    // const sheetData = await fetchOffersFromSheet();
    
    // For now, return static data
    const offers = getActiveOffers();
    
    return NextResponse.json({
      success: true,
      data: offers,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch offers'
    }, { status: 500 });
  }
}
