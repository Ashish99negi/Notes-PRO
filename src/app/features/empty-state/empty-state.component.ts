import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { NotesStore } from '../../core/store/notes.store';

export type EmptyStateType = 'no-notes' | 'no-notebook' | 'no-selection' | 'trash';

const MESSAGES: Record<EmptyStateType, { icon: string; title: string; sub: string; cta?: string }> = {
  'no-notes':      { icon: '📝', title: 'No notes yet',      sub: 'Create your first note to get started.', cta: 'Create a note' },
  'no-notebook':   { icon: '📒', title: 'Notebook is empty', sub: 'Add a note to this notebook.',           cta: 'Create a note' },
  'no-selection':  { icon: '✨', title: 'Select a note',     sub: 'Pick a note from the list, or create a new one.', cta: 'New note' },
  'trash':         { icon: '🗑️', title: 'Trash is empty',    sub: 'Deleted notes appear here for 30 days.' },
};

@Component({
  selector: 'app-empty-state',
  standalone: true,
  styles: [`
    .empty-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      gap: 16px;
      padding: 32px;
      text-align: center;
      animation: fadeUp 0.4s ease;
    }
    .empty-icon { font-size: 48px; line-height: 1; }
    .empty-title {
      font-size: 16px;
      font-weight: 600;
      font-family: 'Lora', serif;
      color: var(--text);
      margin-bottom: 4px;
    }
    .empty-sub {
      font-size: 13px;
      color: var(--text3);
      font-family: 'Plus Jakarta Sans', sans-serif;
      line-height: 1.6;
    }
    .empty-cta {
      margin-top: 8px;
      padding: 10px 24px;
      background: var(--teal);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .empty-cta:hover { opacity: 0.88; }
  `],
  template: `
    <div class="empty-wrap">
      <span class="empty-icon">{{ msg().icon }}</span>
      <div>
        <div class="empty-title">{{ msg().title }}</div>
        <div class="empty-sub">{{ msg().sub }}</div>
      </div>
      @if (msg().cta) {
        <button class="empty-cta" (click)="createNote()">{{ msg().cta }}</button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  type = input<EmptyStateType>('no-notes');

  private store = inject(NotesStore);
  private router = inject(Router);

  msg() {
    return MESSAGES[this.type()];
  }

  createNote(): void {
    const note = this.store.addNote();
    this.router.navigate(['/notes', note.id]);
  }
}
