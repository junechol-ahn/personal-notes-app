import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = crypto.randomUUID();
  const now = Date.now();

  // Default empty content for TipTap
  const content = JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [], // Empty paragraph to start
      },
    ],
  });

  const stmt = db.prepare(
    'INSERT INTO notes (id, user_id, title, content, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );

  try {
    stmt.run(id, session.user.id, '', content, 0, now, now);
    return NextResponse.json({ id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notes = db
    .prepare(
      'SELECT id, title, updated_at, created_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
    )
    .all(session.user.id);
  return NextResponse.json(notes);
}
