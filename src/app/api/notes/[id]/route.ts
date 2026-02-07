import { auth } from '@/lib/auth';
import { client } from '@/lib/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rs = await client.execute({
    sql: 'SELECT * FROM notes WHERE id = ? AND user_id = ?',
    args: [id, session.user.id],
  });

  if (rs.rows.length === 0)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rs.rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content, title } = await req.json();
  const now = Date.now();

  const rs = await client.execute({
    sql: 'UPDATE notes SET content = ?, title = ?, updated_at = ? WHERE id = ? AND user_id = ?',
    args: [JSON.stringify(content), title || '', now, id, session.user.id],
  });

  if (rs.rowsAffected === 0)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rs = await client.execute({
    sql: 'DELETE FROM notes WHERE id = ? AND user_id = ?',
    args: [id, session.user.id],
  });

  if (rs.rowsAffected === 0)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
