import { NextRequest, NextResponse } from 'next/server';
import { searchEngine } from '@/lib/search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // Initialize index if not ready
  await searchEngine.init();

  const results = searchEngine.search(query);

  return NextResponse.json({ results });
}
