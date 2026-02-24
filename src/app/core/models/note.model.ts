export type NoteColor = 'teal' | 'coral' | 'violet' | 'sky' | 'gold' | 'green';
export type ViewFilter = 'all' | 'pinned' | 'recent' | 'trash';

export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  isPinned: boolean;
  colorAccent: NoteColor;
  createdAt: Date;
  wordCount: number;
  charCount: number;
  readTimeMinutes: number;
  deletedAt?: Date;
}

export interface Notebook {
  id: string;
  name: string;
  color: NoteColor;
  noteCount: number;
  createdAt: Date;
}

export const NOTE_COLORS: NoteColor[] = ['teal', 'coral', 'violet', 'sky', 'gold', 'green'];

export const COLOR_MAP: Record<NoteColor, { border: string; bg: string; text: string }> = {
  teal: { border: 'var(--teal)', bg: 'var(--teal-soft)', text: 'var(--teal)' },
  coral: { border: 'var(--coral)', bg: 'var(--coral-soft)', text: 'var(--coral)' },
  violet: { border: 'var(--violet)', bg: 'var(--violet-soft)', text: 'var(--violet)' },
  sky: { border: 'var(--sky)', bg: 'var(--sky-soft)', text: 'var(--sky)' },
  gold: { border: 'var(--gold)', bg: 'var(--gold-soft)', text: 'var(--gold)' },
  green: { border: 'var(--green)', bg: 'var(--green-soft)', text: 'var(--green)' },
};
