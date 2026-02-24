import {
  Component,
  computed,
  inject,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NotesStore } from '../../core/store/notes.store';
import { NoteColor, NOTE_COLORS, ViewFilter, COLOR_MAP } from '../../core/models/note.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  styles: [`
    aside {
      width: 260px;
      min-width: 260px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .sidebar-logo-area {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .logo {
      font-family: 'Lora', serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--text);
      display: flex;
      align-items: flex-end;
      gap: 6px;
      margin-bottom: 16px;
    }
    .logo span { color: var(--teal); }
    .logo em {
      font-style: normal;
      font-size: 9px;
      font-family: 'Fira Code', monospace;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding-bottom: 2px;
    }
    .sidebar-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 12px 0;
    }
    .section {
      padding: 0 12px;
      margin-bottom: 8px;
    }
    .section-label {
      font-size: 9px;
      font-family: 'Fira Code', monospace;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0 8px;
      margin-bottom: 8px;
      display: block;
    }
    .nav-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 8px 12px;
      border-radius: 12px;
      margin-bottom: 2px;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
      color: var(--text2);
      background: transparent;
    }
    .nav-btn:hover { background: var(--surface2); }
    .nav-btn.active { background: var(--teal-soft); color: var(--teal); }
    .nav-btn-left { display: flex; align-items: center; gap: 8px; }
    .badge {
      font-size: 10px;
      font-family: 'Fira Code', monospace;
      background: var(--surface3);
      color: var(--text3);
      padding: 1px 6px;
      border-radius: 999px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      margin-bottom: 8px;
    }
    .add-btn {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 8px;
      background: var(--teal-soft);
      color: var(--teal);
      border: none;
      cursor: pointer;
    }
    .notebook-input {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      padding: 0 8px;
    }
    .notebook-input input {
      flex: 1;
      font-size: 12px;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface2);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      outline: none;
    }
    .nb-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 8px 12px;
      border-radius: 12px;
      margin-bottom: 2px;
      font-size: 13px;
      font-weight: 500;
      font-family: 'Plus Jakarta Sans', sans-serif;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
      color: var(--text2);
      background: transparent;
    }
    .nb-btn:hover { background: var(--surface2); }
    .nb-btn.active { background: var(--teal-soft); color: var(--teal); }
    .nb-btn-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .nb-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .nb-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sidebar-bottom {
      padding: 16px 20px;
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }
    .user-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--teal), var(--sky));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .user-info { min-width: 0; }
    .user-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .user-stats {
      font-size: 9px;
      font-family: 'Fira Code', monospace;
      color: var(--text3);
    }
  `],
  template: `
    <aside role="navigation" aria-label="Sidebar">
      <div class="sidebar-logo-area">
        <div class="logo">
          Notes<span> Pro</span>
        </div>
      </div>

      <div class="sidebar-scroll">
        <div class="section">
          <span class="section-label">Navigation</span>
          @for (item of navItems; track item.filter) {
            <button
              class="nav-btn"
              [class.active]="activeFilter() === item.filter && !activeNotebookId()"
              (click)="setFilter(item.filter)"
              [attr.aria-current]="activeFilter() === item.filter && !activeNotebookId() ? 'page' : null"
            >
              <span class="nav-btn-left">
                <span>{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </span>
              <span class="badge">{{ item.count() }}</span>
            </button>
          }
        </div>

        <div class="section">
          <div class="section-header">
            <span class="section-label" style="margin-bottom:0;">Notebooks</span>
            <button class="add-btn" (click)="showAddNotebook.set(true)" aria-label="Add notebook">+</button>
          </div>

          @if (showAddNotebook()) {
            <div class="notebook-input">
              <input
                #notebookInput
                type="text"
                placeholder="Notebook name…"
                (keydown.enter)="addNotebook($event)"
                (keydown.escape)="showAddNotebook.set(false)"
                (blur)="showAddNotebook.set(false)"
              />
            </div>
          }

          @for (nb of store.notebooksWithCount(); track nb.id) {
            <button
              class="nb-btn"
              [class.active]="activeNotebookId() === nb.id"
              (click)="setNotebook(nb.id)"
            >
              <span class="nb-btn-left">
                <span class="nb-dot" [style.background]="getColor(nb.color)"></span>
                <span class="nb-name">{{ nb.name }}</span>
              </span>
              <span class="badge">{{ nb.noteCount }}</span>
            </button>
          }
        </div>
      </div>

      <div class="sidebar-bottom">
        <div class="user-row">
          <div class="avatar" aria-hidden="true">A</div>
          <div class="user-info">
            <div class="user-name">Your Notes</div>
            <div class="user-stats">{{ liveNoteCount() }} notes · {{ store.totalWordCount() }} words</div>
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @ViewChild('notebookInput') notebookInputRef?: ElementRef<HTMLInputElement>;

  store = inject(NotesStore);
  private router = inject(Router);

  showAddNotebook = signal(false);
  activeFilter = this.store.activeFilter;
  activeNotebookId = this.store.activeNotebookId;

  liveNoteCount = computed(() => this.store.notes().filter((n) => !n.deletedAt).length);

  navItems = [
    {
      filter: 'all' as ViewFilter,
      label: 'All Notes',
      icon: '📝',
      count: computed(() => this.store.notes().filter((n) => !n.deletedAt).length),
    },
    {
      filter: 'pinned' as ViewFilter,
      label: 'Pinned',
      icon: '📌',
      count: computed(() => this.store.pinnedNotes().length),
    },
    {
      filter: 'recent' as ViewFilter,
      label: 'Recent',
      icon: '🕒',
      count: computed(() => this.store.recentNotes().length),
    },
    {
      filter: 'trash' as ViewFilter,
      label: 'Trash',
      icon: '🗑️',
      count: computed(() => this.store.notes().filter((n) => !!n.deletedAt).length),
    },
  ];

  getColor(color: NoteColor): string {
    return COLOR_MAP[color].border;
  }

  setFilter(filter: ViewFilter): void {
    this.store.setFilter(filter);
    this.router.navigate(['/notes']);
  }

  setNotebook(id: string): void {
    this.store.setNotebook(id);
    this.router.navigate(['/notes']);
  }

  addNotebook(event: Event): void {
    const input = event.target as HTMLInputElement;
    const name = input.value.trim();
    if (!name) return;
    const colorIndex = this.store.notebooks().length % NOTE_COLORS.length;
    this.store.addNotebook(name, NOTE_COLORS[colorIndex]);
    this.showAddNotebook.set(false);
  }
}
