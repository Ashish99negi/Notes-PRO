import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.4);"
        (click)="onBackdrop($event)"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
      >
        <div
          class="rounded-2xl p-6 w-full max-w-sm shadow-xl"
          style="background: var(--surface); border: 1px solid var(--border);"
          (click)="$event.stopPropagation()"
        >
          <h3 class="text-base font-semibold mb-2" style="font-family: 'Lora', serif; color: var(--text);">
            {{ title() }}
          </h3>
          <p class="text-sm mb-6" style="color: var(--text2);">{{ message() }}</p>
          <div class="flex gap-3 justify-end">
            <button
              (click)="result.emit(false)"
              class="px-4 py-2 text-sm rounded-lg border hover:opacity-80 transition"
              style="border-color: var(--border); color: var(--text2);"
            >{{ cancelLabel() }}</button>
            <button
              (click)="result.emit(true)"
              class="px-4 py-2 text-sm rounded-lg text-white hover:opacity-90 transition"
              style="background: var(--coral);"
            >{{ confirmLabel() }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  visible = input(false);
  title = input('Confirm');
  message = input('Are you sure?');
  confirmLabel = input('Delete');
  cancelLabel = input('Cancel');
  result = output<boolean>();

  onBackdrop(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.result.emit(false);
  }
}
