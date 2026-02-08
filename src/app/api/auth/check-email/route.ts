import { client } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const rs = await client.execute({
    sql: 'SELECT id FROM user WHERE email = ?',
    args: [email],
  });

  return NextResponse.json({ exists: rs.rows.length > 0 });
}
