import { Component, input, output } from '@angular/core';
import { NoteColor, NOTE_COLORS, COLOR_MAP } from '../../core/models/note.model';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  template: `
    <div class="flex items-center gap-2" role="group" aria-label="Note color">
      @for (c of colors; track c) {
        <button
          type="button"
          (click)="colorChange.emit(c)"
          class="w-4 h-4 rounded-full transition-transform hover:scale-110"
          [style.background]="getColor(c)"
          [style.outline]="selectedColor() === c ? '2px solid ' + getColor(c) : 'none'"
          [style.outline-offset]="selectedColor() === c ? '2px' : '0'"
          [attr.aria-label]="'Color: ' + c"
          [attr.aria-pressed]="selectedColor() === c"
        ></button>
      }
    </div>
  `,
})
export class ColorPickerComponent {
  selectedColor = input.required<NoteColor>();
  colorChange = output<NoteColor>();

  colors: NoteColor[] = NOTE_COLORS;

  getColor(c: NoteColor): string {
    return COLOR_MAP[c].border;
  }
}
