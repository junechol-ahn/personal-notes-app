import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
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

  const note = db
    .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(id, session.user.id);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(note);
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

  // title is optional, but if content changes maybe we extract title?
  // Spec says: "title: 옵션, 텍스트 파싱하여 추출"
  // So client should send title or server should extract.
  // I'll assume client sends it for now, or just updates content.

  const info = db
    .prepare(
      'UPDATE notes SET content = ?, title = ?, updated_at = ? WHERE id = ? AND user_id = ?',
    )
    .run(JSON.stringify(content), title || '', now, id, session.user.id);

  if (info.changes === 0)
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

  const info = db
    .prepare('DELETE FROM notes WHERE id = ? AND user_id = ?')
    .run(id, session.user.id);
  if (info.changes === 0)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
