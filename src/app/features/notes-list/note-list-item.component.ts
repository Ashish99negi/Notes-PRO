import { Component, input, output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Note, COLOR_MAP } from '../../core/models/note.model';
import { NoteUtilsService } from '../../core/services/note-utils.service';
import { NotesStore } from '../../core/store/notes.store';

@Component({
  selector: 'app-note-list-item',
  standalone: true,
  imports: [],
  styles: [`
    .note-card {
      position: relative;
      border-radius: 16px;
      padding: 14px;
      cursor: pointer;
      transition: box-shadow 0.2s, border-color 0.2s;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left-width: 3px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      display: block;
      width: 100%;
    }
    .note-card:hover {
      border-color: var(--border2);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .note-card.selected {
      background: var(--teal-soft);
      border-color: var(--teal);
      box-shadow: 0 2px 8px rgba(15,118,110,0.12);
    }
    .note-card:hover .delete-btn,
    .note-card.selected .delete-btn {
      opacity: 1;
    }
    .pin-indicator {
      position: absolute;
      top: 8px;
      right: 32px;
      font-size: 10px;
      color: var(--text3);
    }
    .delete-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--text3);
      font-size: 12px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s, background 0.15s, color 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .delete-btn:hover {
      background: var(--coral-soft);
      color: var(--coral);
    }
    .note-title {
      font-size: 14px;
      font-weight: 600;
      font-family: 'Lora', serif;
      line-height: 1.35;
      margin-bottom: 6px;
      padding-right: 48px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text);
    }
    .note-card.selected .note-title { color: var(--teal); }
    .note-preview {
      font-size: 12px;
      color: var(--text2);
      font-family: 'Plus Jakarta Sans', sans-serif;
      line-height: 1.55;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
  template: `
    <div
      class="note-card"
      [class.selected]="isSelected()"
      [style.border-left-color]="accentColor()"
      (click)="onSelect()"
      role="button"
      tabindex="0"
      (keydown.enter)="onSelect()"
      [attr.aria-selected]="isSelected()"
    >
      <button
        class="delete-btn"
        (click)="onDelete($event)"
        title="Move to trash"
        aria-label="Delete note"
      >🗑</button>

      @if (note().isPinned) {
        <span class="pin-indicator">📌</span>
      }

      <div class="note-title">{{ note().title || 'Untitled' }}</div>
      <div class="note-preview">{{ preview() }}</div>
    </div>
  `,
})
export class NoteListItemComponent {
  note = input.required<Note>();
  isSelected = input(false);
  selected = output<string>();
  deleted = output<string>();

  private router = inject(Router);
  private utils = inject(NoteUtilsService);
  private store = inject(NotesStore);

  accentColor(): string {
    return COLOR_MAP[this.note().colorAccent].border;
  }

  preview(): string {
    return this.utils.preview(this.note().content, 120);
  }

  onSelect(): void {
    this.selected.emit(this.note().id);
    this.router.navigate(['/notes', this.note().id]);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.store.deleteNote(this.note().id);
    this.deleted.emit(this.note().id);
    if (this.store.selectedNoteId() === null) {
      this.router.navigate(['/notes']);
    }
  }
}
