import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import TipTapEditor from '@/components/Editor';

export const dynamic = 'force-dynamic';

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const note = db
    .prepare('SELECT * FROM notes WHERE id = ? AND is_public = 1')
    .get(id) as
    | {
        id: string;
        content: string;
        title?: string;
      }
    | undefined;

  if (!note) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-inter)] selection:bg-primary/20 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8 glass p-8 md:p-12 rounded-2xl shadow-xl border border-border/30">
        <header className="border-b border-border/50 pb-6 flex items-center justify-between">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
            {note.title || 'Untitled Note'}
          </h1>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Public Read-Only
          </span>
        </header>
        <div className="prose-container">
          <TipTapEditor content={note.content} editable={false} />
        </div>
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Powered by{' '}
        <span className="font-semibold text-foreground">
          Personal Notes App
        </span>
      </footer>
    </div>
  );
}
