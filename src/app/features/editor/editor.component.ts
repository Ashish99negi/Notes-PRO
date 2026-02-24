import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';
import { NotesStore } from '../../core/store/notes.store';
import { NoteColor, COLOR_MAP } from '../../core/models/note.model';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { EditorToolbarComponent } from './editor-toolbar.component';
import { EditorFooterComponent } from './editor-footer.component';
import { ColorPickerComponent } from '../../shared/components/color-picker.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    EmptyStateComponent,
    EditorToolbarComponent,
    EditorFooterComponent,
    ColorPickerComponent,
    ConfirmDialogComponent,
  ],
  styles: [`
    .editor-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface);
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
      flex-shrink: 0;
    }
    .breadcrumb {
      font-size: 11px;
      font-family: 'Fira Code', monospace;
      color: var(--text3);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 300px;
    }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .action-btn {
      font-size: 14px;
      padding: 4px 8px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      background: transparent;
      color: var(--text3);
      transition: background 0.15s;
    }
    .action-btn:hover { background: var(--surface2); }
    .action-btn.pin-active { background: var(--gold-soft); color: var(--gold); }
    .action-btn.delete-hover:hover { background: var(--coral-soft); }
    .back-btn {
      font-size: 13px;
      padding: 0;
      margin-right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--teal);
      display: none;
    }
    .editor-scroll {
      flex: 1;
      overflow-y: auto;
    }
    .editor-inner {
      max-width: 720px;
      margin: 0 auto;
      padding: 32px 40px;
      animation: fadeUp 0.3s ease;
    }
    .meta-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    @media (max-width: 767px) {
      .back-btn { display: inline; }
      .editor-inner { padding: 20px 20px; }
    }
  `],
  template: `
    <div class="editor-shell">
      @if (!note()) {
        <app-empty-state type="no-selection" style="flex:1; display:flex;"></app-empty-state>
      } @else {
        <div class="topbar">
          <div style="display:flex; align-items:center; min-width:0;">
            <button class="back-btn" (click)="goBack()" aria-label="Back to list">← Back</button>
            <span class="breadcrumb">{{ notebookName() }} › {{ note()!.title || 'Untitled' }}</span>
          </div>
          <div class="topbar-actions">
            <button
              class="action-btn"
              [class.pin-active]="note()!.isPinned"
              (click)="togglePin()"
              title="Toggle pin"
              aria-label="Toggle pin"
            >📌</button>
            <button class="action-btn" (click)="exportNote()" title="Export as .txt" aria-label="Export">⬇</button>
            <button class="action-btn" (click)="duplicateNote()" title="Duplicate" aria-label="Duplicate">⊕</button>
            <button
              class="action-btn delete-hover"
              (click)="showDeleteDialog.set(true)"
              title="Delete"
              aria-label="Delete note"
            >🗑</button>
          </div>
        </div>

        <app-editor-toolbar [activeFormats]="activeFormats()" (formatCommand)="execFormat($event)"></app-editor-toolbar>

        <div class="editor-scroll">
          <div class="editor-inner">
            <div
              #titleEl
              contenteditable="true"
              class="editor-title"
              data-placeholder="Note title…"
              (input)="onTitleInput($event)"
              (keydown.enter)="$event.preventDefault(); contentEl.focus()"
              role="textbox"
              aria-label="Note title"
              aria-multiline="false"
            ></div>

            <div class="meta-row">
              <app-color-picker [selectedColor]="note()!.colorAccent" (colorChange)="onColorChange($event)"></app-color-picker>
            </div>

            <div
              #contentEl
              contenteditable="true"
              class="editor-content"
              data-placeholder="Start writing…"
              (input)="onContentInput()"
              (keyup)="updateActiveFormats()"
              (mouseup)="updateActiveFormats()"
              role="textbox"
              aria-label="Note content"
              aria-multiline="true"
            ></div>
          </div>
        </div>

        <app-editor-footer
          [wordCount]="note()!.wordCount"
          [charCount]="note()!.charCount"
          [readTime]="note()!.readTimeMinutes"
          [isSaving]="isSaving()"
          [savedAt]="savedAt()"
        ></app-editor-footer>
      }
    </div>

    <app-confirm-dialog
      [visible]="showDeleteDialog()"
      title="Delete note?"
      message="This note will be moved to trash. You can restore it later."
      confirmLabel="Move to trash"
      (result)="onDeleteConfirm($event)"
    ></app-confirm-dialog>
  `,
})
export class EditorComponent implements OnInit {
  @ViewChild('titleEl') titleEl!: ElementRef<HTMLDivElement>;
  @ViewChild('contentEl') contentEl!: ElementRef<HTMLDivElement>;

  store = inject(NotesStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  note = this.store.selectedNote;
  isSaving = signal(false);
  savedAt = signal<Date | null>(null);
  showDeleteDialog = signal(false);
  activeFormats = signal<string[]>([]);

  private saveSubject = new Subject<void>();
  private destroyed = takeUntilDestroyed();
  private currentNoteId = signal<string | null>(null);

  notebookName = computed(() => {
    const note = this.note();
    if (!note) return '';
    return this.store.notebooksWithCount().find((nb) => nb.id === note.notebookId)?.name ?? 'Notes';
  });

  constructor() {
    const params = toSignal(this.route.paramMap, { requireSync: true });

    effect(() => {
      const id = params().get('id');
      if (id && id !== this.currentNoteId()) {
        this.currentNoteId.set(id);
        this.store.selectNote(id);
        setTimeout(() => this.syncEditorDom(), 0);
      }
    });

    this.saveSubject
      .pipe(debounceTime(500), this.destroyed)
      .subscribe(() => this.performSave());
  }

  ngOnInit(): void {
    setTimeout(() => this.syncEditorDom(), 0);
  }

  private syncEditorDom(): void {
    const note = this.note();
    if (!note) return;
    if (this.titleEl?.nativeElement) {
      this.titleEl.nativeElement.textContent = note.title;
    }
    if (this.contentEl?.nativeElement) {
      this.contentEl.nativeElement.innerHTML = note.content;
    }
  }

  onTitleInput(event: Event): void {
    const title = (event.target as HTMLElement).textContent ?? '';
    if (this.note()) {
      this.store.updateNote(this.note()!.id, { title });
      this.saveSubject.next();
    }
  }

  onContentInput(): void {
    if (!this.note() || !this.contentEl) return;
    const content = this.contentEl.nativeElement.innerHTML;
    this.store.updateNote(this.note()!.id, { content });
    this.saveSubject.next();
    this.updateActiveFormats();
  }

  private performSave(): void {
    this.isSaving.set(true);
    this.store.saveToStorage();
    setTimeout(() => {
      this.isSaving.set(false);
      this.savedAt.set(new Date());
    }, 300);
  }

  execFormat(cmd: { command: string; arg?: string }): void {
    document.execCommand(cmd.command, false, cmd.arg ?? '');
    this.contentEl?.nativeElement.focus();
    this.updateActiveFormats();
    this.onContentInput();
  }

  updateActiveFormats(): void {
    const formats: string[] = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('strikeThrough')) formats.push('strikeThrough');
    this.activeFormats.set(formats);
  }

  onColorChange(color: NoteColor): void {
    if (this.note()) this.store.updateNote(this.note()!.id, { colorAccent: color });
  }

  togglePin(): void {
    if (this.note()) this.store.togglePin(this.note()!.id);
  }

  exportNote(): void {
    if (this.note()) this.store.exportNote(this.note()!.id);
  }

  duplicateNote(): void {
    if (this.note()) {
      const copy = this.store.duplicateNote(this.note()!.id);
      if (copy) this.router.navigate(['/notes', copy.id]);
    }
  }

  onDeleteConfirm(confirmed: boolean): void {
    this.showDeleteDialog.set(false);
    if (confirmed && this.note()) {
      this.store.deleteNote(this.note()!.id);
      this.router.navigate(['/notes']);
    }
  }

  goBack(): void {
    this.router.navigate(['/notes']);
    this.store.selectNote(null);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      this.performSave();
    }
  }
}
