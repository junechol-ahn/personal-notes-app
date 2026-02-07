import { client } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const rs = await client.execute({
    sql: 'SELECT title, content, updated_at, created_at FROM notes WHERE id = ? AND is_public = 1',
    args: [id],
  });

  if (rs.rows.length === 0)
    return NextResponse.json(
      { error: 'Not found or private' },
      { status: 404 },
    );
  return NextResponse.json(rs.rows[0]);
}
