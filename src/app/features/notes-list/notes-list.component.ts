import {
  Component,
  inject,
  computed,
  HostListener,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { NotesStore } from '../../core/store/notes.store';
import { NoteListItemComponent } from './note-list-item.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [NoteListItemComponent, EmptyStateComponent, RouterOutlet],
  styles: [`
    .notes-layout {
      display: flex;
      height: 100%;
    }
    .list-panel {
      width: 340px;
      min-width: 340px;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: var(--bg);
      border-right: 1px solid var(--border);
      flex-shrink: 0;
    }
    .list-panel.mobile-hidden { display: none; }
    .list-panel.mobile-full  { width: 100%; min-width: 0; }

    .editor-area {
      flex: 1;
      min-width: 0;
      height: 100%;
      overflow: hidden;
    }
    .editor-area.mobile-hidden { display: none; }
    .editor-area.mobile-full  { width: 100%; flex: unset; }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      flex-shrink: 0;
    }
    .list-title-area { display: flex; align-items: center; gap: 8px; }
    .list-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .list-badge {
      font-size: 10px;
      font-family: 'Fira Code', monospace;
      background: var(--surface3);
      color: var(--text3);
      padding: 1px 6px;
      border-radius: 999px;
    }
    .new-note-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 12px;
      background: var(--teal);
      color: white;
      font-size: 12px;
      font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s;
      white-space: nowrap;
    }
    .new-note-btn:hover { opacity: 0.9; }

    .list-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .note-item-wrapper {
      opacity: 0;
      animation: fadeUp 0.4s ease forwards;
    }

    .trash-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
    }
    .trash-title {
      font-size: 13px;
      font-weight: 600;
      font-family: 'Lora', serif;
      color: var(--text);
      margin-bottom: 10px;
    }
    .trash-actions { display: flex; gap: 8px; }
    .restore-btn {
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 8px;
      background: var(--teal-soft);
      color: var(--teal);
      border: none;
      cursor: pointer;
    }
    .perm-delete-btn {
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 8px;
      background: var(--coral-soft);
      color: var(--coral);
      border: none;
      cursor: pointer;
    }

    .fab {
      position: fixed;
      bottom: 76px;
      right: 16px;
      z-index: 30;
      display: none;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 16px;
      background: var(--teal);
      color: white;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Plus Jakarta Sans', sans-serif;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(15,118,110,0.4);
    }
    @media (max-width: 767px) {
      .new-note-btn { display: none; }
      .fab { display: flex; }
    }
  `],
  template: `
    <div class="notes-layout">

      <div
        class="list-panel"
        [class.mobile-hidden]="isMobile() && hasSelectedNote()"
        [class.mobile-full]="isMobile() && !hasSelectedNote()"
      >
        <div class="list-header">
          <div class="list-title-area">
            <span class="list-title">{{ panelTitle() }}</span>
            <span class="list-badge">{{ store.filteredNotes().length }}</span>
          </div>
          <button class="new-note-btn" (click)="newNote()" aria-label="Create new note">
            + New note
          </button>
        </div>

        <div class="list-scroll">
          @if (store.filteredNotes().length === 0) {
            <app-empty-state [type]="emptyType()"></app-empty-state>
          }

          @for (note of store.filteredNotes(); track note.id; let i = $index) {
            @if (store.activeFilter() !== 'trash') {
              <div class="note-item-wrapper" [style.animation-delay]="(i * 50) + 'ms'">
                <app-note-list-item
                  [note]="note"
                  [isSelected]="store.selectedNoteId() === note.id"
                  (selected)="onNoteSelect($event)"
                ></app-note-list-item>
              </div>
            } @else {
              <div class="trash-card">
                <div class="trash-title">{{ note.title || 'Untitled' }}</div>
                <div class="trash-actions">
                  <button class="restore-btn" (click)="store.restoreNote(note.id)">Restore</button>
                  <button class="perm-delete-btn" (click)="store.permanentlyDeleteNote(note.id)">Delete permanently</button>
                </div>
              </div>
            }
          }
        </div>
      </div>

      <div
        class="editor-area"
        [class.mobile-hidden]="isMobile() && !hasSelectedNote()"
        [class.mobile-full]="isMobile() && hasSelectedNote()"
      >
        <router-outlet></router-outlet>
      </div>

    </div>

    @if (!isMobile() || !hasSelectedNote()) {
      <button class="fab" (click)="newNote()" aria-label="Create new note">✏️ New Note</button>
    }
  `,
})
export class NotesListComponent {
  store = inject(NotesStore);
  private router = inject(Router);
  private breakpoints = inject(BreakpointObserver);

  isMobile = toSignal(
    this.breakpoints.observe('(max-width: 767px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  hasSelectedNote = computed(() => this.store.selectedNoteId() !== null);

  panelTitle = computed(() => {
    const filter = this.store.activeFilter();
    const nbId = this.store.activeNotebookId();
    if (nbId) {
      return this.store.notebooksWithCount().find((n) => n.id === nbId)?.name ?? 'Notebook';
    }
    const map: Record<string, string> = { all: 'All Notes', pinned: 'Pinned', recent: 'Recent', trash: 'Trash' };
    return map[filter] ?? 'Notes';
  });

  emptyType() {
    if (this.store.activeFilter() === 'trash') return 'trash' as const;
    if (this.store.activeNotebookId()) return 'no-notebook' as const;
    return 'no-notes' as const;
  }

  newNote(): void {
    const note = this.store.addNote();
    this.router.navigate(['/notes', note.id]);
  }

  onNoteSelect(id: string): void {
    this.store.selectNote(id);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      this.newNote();
    }
  }
}
