import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { client } from '@/lib/db';
import Link from 'next/link';
import { Clock, Plus, FilePlus } from 'lucide-react';
import CreateNoteButton from '@/components/CreateNoteButton';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const rs = await client.execute({
    sql: 'SELECT id, title, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
    args: [session.user.id],
  });

  const notes = rs.rows as unknown as {
    id: string;
    title?: string;
    updated_at: number;
  }[];

  return (
    <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-inter)] selection:bg-primary/20">
      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border/50">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent pb-1">
              My Notes
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Good day, {session.user.name}
            </p>
          </div>
          <CreateNoteButton />
        </header>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border/50 rounded-3xl bg-card/30">
            <div className="p-5 bg-muted/30 rounded-full mb-6 text-primary/60">
              <FilePlus size={56} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No notes found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-lg">
              Your thoughts are safe here. Start capturing your ideas.
            </p>
            <CreateNoteButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="group relative flex flex-col p-6 h-52 rounded-2xl border border-border bg-card hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 to-violet-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {note.title || 'Untitled Note'}
                </h3>

                <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    <span>
                      {new Date(note.updated_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
