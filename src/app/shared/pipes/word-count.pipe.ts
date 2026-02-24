import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'wordCount', standalone: true, pure: true })
export class WordCountPipe implements PipeTransform {
  transform(html: string | null | undefined): number {
    if (!html) return 0;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = (doc.body.textContent ?? '').trim().replace(/\s+/g, ' ');
    if (!text) return 0;
    return text.split(' ').length;
  }
}
