import { NextResponse } from 'next/server';
import { searchItems } from '@/lib/search';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const query =
    body && typeof body === 'object' && 'query' in body && typeof body.query === 'string'
      ? body.query
      : '';
  const limitRaw =
    body && typeof body === 'object' && 'limit' in body && typeof body.limit === 'number'
      ? body.limit
      : undefined;
  const limit = limitRaw !== undefined ? Math.min(Math.max(limitRaw, 1), 100) : undefined;

  try {
    const results = await searchItems(query, limit);
    return NextResponse.json({ results });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
