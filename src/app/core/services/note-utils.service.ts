import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NoteUtilsService {
  stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent ?? '';
  }

  countWords(text: string): number {
    const clean = text.trim().replace(/\s+/g, ' ');
    if (!clean) return 0;
    return clean.split(' ').length;
  }

  countChars(text: string): number {
    return text.length;
  }

  readTime(wordCount: number): number {
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  calcStats(content: string): { wordCount: number; charCount: number; readTimeMinutes: number } {
    const plain = this.stripHtml(content);
    const wordCount = this.countWords(plain);
    return {
      wordCount,
      charCount: plain.length,
      readTimeMinutes: this.readTime(wordCount),
    };
  }

  generateId(): string {
    return crypto.randomUUID();
  }

  preview(html: string, maxChars = 120): string {
    const plain = this.stripHtml(html);
    return plain.length > maxChars ? plain.slice(0, maxChars) + '…' : plain;
  }
}
