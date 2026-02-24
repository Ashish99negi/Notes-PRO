import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { Note, Notebook, NoteColor, ViewFilter, NOTE_COLORS } from '../models/note.model';
import { StorageService } from '../services/storage.service';
import { NoteUtilsService } from '../services/note-utils.service';

const STORAGE_NOTES_KEY = 'inkwell_notes_v2';
const STORAGE_NOTEBOOKS_KEY = 'inkwell_notebooks_v2';

interface NotesState {
  notes: Note[];
  notebooks: Notebook[];
  selectedNoteId: string | null;
  activeFilter: ViewFilter;
  activeNotebookId: string | null;
  isLoading: boolean;
  isSaving: boolean;
}

const initialState: NotesState = {
  notes: [],
  notebooks: [],
  selectedNoteId: null,
  activeFilter: 'all',
  activeNotebookId: null,
  isLoading: false,
  isSaving: false,
};

export const NotesStore = signalStore(
  { providedIn: 'root' },
  withState<NotesState>(initialState),
  withComputed((store) => ({
    filteredNotes: computed(() => {
      let notes = store.notes().filter((n) => !n.deletedAt);
      const filter = store.activeFilter();
      const notebookId = store.activeNotebookId();

      if (filter === 'trash') {
        return store.notes().filter((n) => !!n.deletedAt);
      }
      if (filter === 'pinned') {
        notes = notes.filter((n) => n.isPinned);
      }
      if (filter === 'recent') {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        notes = notes.filter((n) => n.createdAt >= cutoff);
      }
      if (notebookId) {
        notes = notes.filter((n) => n.notebookId === notebookId);
      }

      return [...notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }),
    selectedNote: computed(() => {
      const id = store.selectedNoteId();
      if (!id) return null;
      return store.notes().find((n) => n.id === id) ?? null;
    }),
    pinnedNotes: computed(() => store.notes().filter((n) => n.isPinned && !n.deletedAt)),
    recentNotes: computed(() => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      return store.notes().filter((n) => n.createdAt >= cutoff && !n.deletedAt);
    }),
    totalWordCount: computed(() =>
      store.notes().filter((n) => !n.deletedAt).reduce((sum, n) => sum + n.wordCount, 0),
    ),
    notebooksWithCount: computed(() => {
      const notes = store.notes().filter((n) => !n.deletedAt);
      return store.notebooks().map((nb) => ({
        ...nb,
        noteCount: notes.filter((n) => n.notebookId === nb.id).length,
      }));
    }),
  })),
  withMethods((store) => {
    const storage = inject(StorageService);
    const utils = inject(NoteUtilsService);

    function saveToStorage(): void {
      const serialized = store.notes().map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        deletedAt: n.deletedAt?.toISOString(),
      }));
      storage.set(STORAGE_NOTES_KEY, serialized);
      storage.set(
        STORAGE_NOTEBOOKS_KEY,
        store.notebooks().map((nb) => ({
          ...nb,
          createdAt: nb.createdAt.toISOString(),
        })),
      );
    }

    function loadFromStorage(): void {
      const rawNotes = storage.get<any[]>(STORAGE_NOTES_KEY);
      const rawNotebooks = storage.get<any[]>(STORAGE_NOTEBOOKS_KEY);

      if (rawNotes && rawNotebooks) {
        const notes: Note[] = rawNotes.map((n) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          deletedAt: n.deletedAt ? new Date(n.deletedAt) : undefined,
        }));
        const notebooks: Notebook[] = rawNotebooks.map((nb) => ({
          ...nb,
          createdAt: new Date(nb.createdAt),
        }));
        patchState(store, { notes, notebooks });
      }
    }

    function addNote(partial: Partial<Note> = {}): Note {
      const now = new Date();
      const defaultNotebook = store.notebooks()[0]?.id ?? '';
      const colorOptions = NOTE_COLORS;
      const colorIndex = store.notes().length % colorOptions.length;
      const note: Note = {
        id: utils.generateId(),
        title: '',
        content: '',
        notebookId: store.activeNotebookId() ?? defaultNotebook,
        isPinned: false,
        colorAccent: colorOptions[colorIndex],
        createdAt: now,
        wordCount: 0,
        charCount: 0,
        readTimeMinutes: 1,
        ...partial,
      };
      patchState(store, { notes: [note, ...store.notes()], selectedNoteId: note.id });
      saveToStorage();
      return note;
    }

    function updateNote(id: string, changes: Partial<Note>): void {
      const statsChanges: Partial<Note> = {};
      if ('content' in changes && changes.content !== undefined) {
        const stats = utils.calcStats(changes.content);
        Object.assign(statsChanges, stats);
      }
      patchState(store, {
        notes: store.notes().map((n) =>
          n.id === id ? { ...n, ...changes, ...statsChanges } : n,
        ),
      });
      saveToStorage();
    }

    function deleteNote(id: string): void {
      patchState(store, {
        notes: store.notes().map((n) =>
          n.id === id ? { ...n, deletedAt: new Date() } : n,
        ),
        selectedNoteId: store.selectedNoteId() === id ? null : store.selectedNoteId(),
      });
      saveToStorage();
    }

    function restoreNote(id: string): void {
      patchState(store, {
        notes: store.notes().map((n) =>
          n.id === id ? { ...n, deletedAt: undefined } : n,
        ),
      });
      saveToStorage();
    }

    function permanentlyDeleteNote(id: string): void {
      patchState(store, {
        notes: store.notes().filter((n) => n.id !== id),
        selectedNoteId: store.selectedNoteId() === id ? null : store.selectedNoteId(),
      });
      saveToStorage();
    }

    function duplicateNote(id: string): Note | null {
      const original = store.notes().find((n) => n.id === id);
      if (!original) return null;
      const now = new Date();
      const copy: Note = {
        ...original,
        id: utils.generateId(),
        title: `${original.title} (copy)`,
        createdAt: now,
        deletedAt: undefined,
        isPinned: false,
      };
      patchState(store, { notes: [copy, ...store.notes()], selectedNoteId: copy.id });
      saveToStorage();
      return copy;
    }

    function togglePin(id: string): void {
      patchState(store, {
        notes: store.notes().map((n) =>
          n.id === id ? { ...n, isPinned: !n.isPinned } : n,
        ),
      });
      saveToStorage();
    }

    function selectNote(id: string | null): void {
      patchState(store, { selectedNoteId: id });
    }

    function setFilter(filter: ViewFilter): void {
      patchState(store, { activeFilter: filter, activeNotebookId: null });
    }

    function setNotebook(notebookId: string | null): void {
      patchState(store, { activeNotebookId: notebookId, activeFilter: 'all' });
    }

    function addNotebook(name: string, color: NoteColor): void {
      const nb: Notebook = {
        id: utils.generateId(),
        name,
        color,
        noteCount: 0,
        createdAt: new Date(),
      };
      patchState(store, { notebooks: [...store.notebooks(), nb] });
      saveToStorage();
    }

    function deleteNotebook(id: string): void {
      patchState(store, {
        notebooks: store.notebooks().filter((nb) => nb.id !== id),
        activeNotebookId: store.activeNotebookId() === id ? null : store.activeNotebookId(),
      });
      saveToStorage();
    }

    function exportNote(id: string): void {
      const note = store.notes().find((n) => n.id === id);
      if (!note) return;
      const doc = new DOMParser().parseFromString(note.content, 'text/html');
      const text = `${note.title}\n${'='.repeat(note.title.length)}\n\n${doc.body.textContent ?? ''}`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title || 'note'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    return {
      loadFromStorage,
      saveToStorage,
      addNote,
      updateNote,
      deleteNote,
      restoreNote,
      permanentlyDeleteNote,
      duplicateNote,
      togglePin,
      selectNote,
      setFilter,
      setNotebook,
      addNotebook,
      deleteNotebook,
      exportNote,
    };
  }),
);
