'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

export default function CreateNoteButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createNote = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const { id } = await res.json();
      router.push(`/notes/${id}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert('Failed to create note');
    }
  };

  return (
    <button
      onClick={createNote}
      disabled={loading}
      className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Plus size={18} />
      )}
      New Note
    </button>
  );
}
