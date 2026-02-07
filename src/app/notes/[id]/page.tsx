import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
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

  const note = db
    .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(id, session.user.id) as
    | {
        id: string;
        content: string;
        title?: string;
        is_public: number;
      }
    | undefined;

  if (!note) {
    notFound();
  }

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
