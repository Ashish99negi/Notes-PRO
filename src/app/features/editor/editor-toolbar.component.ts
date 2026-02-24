import { Component, input, output } from '@angular/core';

interface ToolbarGroup {
  buttons: ToolbarButton[];
}

interface ToolbarButton {
  label: string;
  command: string;
  arg?: string;
  title: string;
  bold?: boolean;
  italic?: boolean;
}

const TOOLBAR_GROUPS: ToolbarGroup[] = [
  {
    buttons: [
      { label: 'B', command: 'bold', title: 'Bold (Ctrl+B)', bold: true },
      { label: 'I', command: 'italic', title: 'Italic (Ctrl+I)', italic: true },
      { label: 'U', command: 'underline', title: 'Underline (Ctrl+U)' },
      { label: 'S̶', command: 'strikeThrough', title: 'Strikethrough' },
    ],
  },
  {
    buttons: [
      { label: 'H1', command: 'formatBlock', arg: 'h1', title: 'Heading 1' },
      { label: 'H2', command: 'formatBlock', arg: 'h2', title: 'Heading 2' },
      { label: 'H3', command: 'formatBlock', arg: 'h3', title: 'Heading 3' },
    ],
  },
  {
    buttons: [
      { label: '≡', command: 'insertUnorderedList', title: 'Bullet List' },
      { label: '1.', command: 'insertOrderedList', title: 'Ordered List' },
      { label: '❝', command: 'formatBlock', arg: 'blockquote', title: 'Blockquote' },
    ],
  },
  {
    buttons: [
      { label: 'P', command: 'formatBlock', arg: 'p', title: 'Paragraph' },
    ],
  },
];

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  styles: [`
    .toolbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 2px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
      flex-shrink: 0;
      overflow-x: auto;
    }
    .tb-btn {
      padding: 4px 8px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      font-family: 'Fira Code', monospace;
      font-weight: 500;
      background: transparent;
      color: var(--text2);
      transition: background 0.15s, color 0.15s;
      min-width: 28px;
    }
    .tb-btn:hover { background: var(--surface3); }
    .tb-btn.active { background: var(--teal-soft); color: var(--teal); }
    .divider {
      width: 1px;
      height: 16px;
      background: var(--border);
      margin: 0 4px;
    }
  `],
  template: `
    <div class="toolbar" role="toolbar" aria-label="Text formatting">
      @for (group of groups; track $index) {
        @for (btn of group.buttons; track btn.command + btn.arg) {
          <button
            type="button"
            class="tb-btn"
            [class.active]="isActive(btn.command)"
            [style.font-weight]="btn.bold ? '700' : '500'"
            [style.font-style]="btn.italic ? 'italic' : 'normal'"
            (click)="formatCommand.emit({ command: btn.command, arg: btn.arg })"
            [title]="btn.title"
            [attr.aria-label]="btn.title"
            [attr.aria-pressed]="isActive(btn.command)"
          >{{ btn.label }}</button>
        }
        @if ($index < groups.length - 1) {
          <span class="divider"></span>
        }
      }
    </div>
  `,
})
export class EditorToolbarComponent {
  activeFormats = input<string[]>([]);
  formatCommand = output<{ command: string; arg?: string }>();

  groups = TOOLBAR_GROUPS;

  isActive(command: string): boolean {
    return this.activeFormats().includes(command);
  }
}
