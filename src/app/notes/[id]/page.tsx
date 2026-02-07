import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { client } from '@/lib/db';
import NoteEditor from '@/components/NoteEditor';

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const rs = await client.execute({
    sql: 'SELECT * FROM notes WHERE id = ? AND user_id = ?',
    args: [id, session.user.id],
  });

  if (rs.rows.length === 0) {
    notFound();
  }

  const note = rs.rows[0] as unknown as {
    id: string;
    content: string;
    title?: string;
    is_public: number;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-inter)] selection:bg-primary/20">
      <NoteEditor
        noteId={note.id}
        initialContent={note.content}
        initialTitle={note.title || ''}
        initialIsPublic={!!note.is_public}
      />
    </div>
  );
}
