import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { isPublic } = await req.json();
  const val = isPublic ? 1 : 0;
  const now = Date.now();

  const info = db
    .prepare(
      'UPDATE notes SET is_public = ?, updated_at = ? WHERE id = ? AND user_id = ?',
    )
    .run(val, now, id, session.user.id);

  if (info.changes === 0)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ isPublic: !!val });
}
