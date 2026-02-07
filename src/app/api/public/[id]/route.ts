import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const note = db
    .prepare(
      'SELECT title, content, updated_at, created_at FROM notes WHERE id = ? AND is_public = 1',
    )
    .get(id);

  if (!note)
    return NextResponse.json(
      { error: 'Not found or private' },
      { status: 404 },
    );
  return NextResponse.json(note);
}
