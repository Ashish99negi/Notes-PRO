import { Component, input } from '@angular/core';

@Component({
  selector: 'app-editor-footer',
  standalone: true,
  styles: [`
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 24px;
      border-top: 1px solid var(--border);
      background: var(--bg);
      flex-shrink: 0;
    }
    .counts {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .count-item {
      font-size: 10px;
      font-family: 'Fira Code', monospace;
      color: var(--text3);
    }
    .save-status {
      font-size: 10px;
      font-family: 'Fira Code', monospace;
    }
  `],
  template: `
    <div class="footer">
      <div class="counts">
        <span class="count-item">{{ wordCount() }} words</span>
        <span class="count-item">{{ charCount() }} chars</span>
        <span class="count-item">{{ readTime() }} min read</span>
      </div>
      <div>
        @if (isSaving()) {
          <span class="save-status" style="color: var(--text3);">Saving…</span>
        } @else if (savedAt()) {
          <span class="save-status" style="color: var(--green);">Saved ✓</span>
        }
      </div>
    </div>
  `,
})
export class EditorFooterComponent {
  wordCount = input(0);
  charCount = input(0);
  readTime = input(1);
  isSaving = input(false);
  savedAt = input<Date | null>(null);
}
