'use client';

import { useState, useEffect, useRef } from 'react';
import TipTapEditor from './Editor';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Share,
  Check,
  Download,
  Eye,
  Link as LinkIcon,
  Lock,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NoteEditor({
  initialContent,
  noteId,
  initialTitle,
  initialIsPublic,
}: {
  initialContent: string;
  noteId: string;
  initialTitle: string;
  initialIsPublic: boolean;
}) {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  );
  const isFirstRun = useRef(true);

  const debouncedState = useDebounce({ content, title }, 1000);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const save = async () => {
      setStatus('saving');
      try {
        // Parse content to ensure it is valid JSON before sending?
        // Actually server expects JSON body: { content: object, title: string }
        // My state `content` is a JSON string stringified from Editor.

        let contentObj;
        try {
          contentObj = JSON.parse(debouncedState.content);
        } catch (e) {
          console.error('Content is not valid JSON', e);
          return;
        }

        const res = await fetch(`/api/notes/${noteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: contentObj,
            title: debouncedState.title,
          }),
        });

        if (!res.ok) throw new Error('Failed');

        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };

    save();
  }, [debouncedState, noteId]);

  const toggleShare = async () => {
    const newVal = !isPublic;
    setIsPublic(newVal); // Optimistic
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: newVal }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch (e) {
      setIsPublic(!newVal); // Revert
      alert('Failed to update share settings');
    }
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/public/${noteId}`;
    navigator.clipboard.writeText(url);
    alert('Public link copied to clipboard!');
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4 md:p-6 gap-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass p-4 rounded-2xl shadow-sm border border-border/50">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link
            href="/"
            className="p-2 hover:bg-muted rounded-full transition-colors"
            title="Back to Notes"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1 relative group">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Note"
              className="text-xl md:text-2xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none placeholder-gray-400 w-full transition-colors pb-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[80px] justify-end">
            {status === 'saving' && (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {status === 'saved' && (
              <>
                <Check size={14} className="text-green-500" />
                <span>Saved</span>
              </>
            )}
            {status === 'error' && <span className="text-red-500">Error!</span>}
          </div>

          <div className="h-6 w-px bg-border/50 hidden md:block" />

          <button
            onClick={toggleShare}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${isPublic ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            {isPublic ? <Eye size={16} /> : <Lock size={16} />}
            {isPublic ? 'Public' : 'Private'}
          </button>

          {isPublic && (
            <button
              onClick={copyPublicLink}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Copy public link"
            >
              <LinkIcon size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 relative">
        <TipTapEditor
          content={content}
          onChange={(json) => setContent(JSON.stringify(json))}
          editable={true}
        />
      </div>
    </div>
  );
}
