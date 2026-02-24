import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  styles: [`
    .landing {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
    }
    .nav {
      padding: 20px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .logo {
      font-family: 'Lora', serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.02em;
    }
    .logo span { color: var(--teal); }
    .nav-open-btn {
      font-size: 13px;
      font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--teal);
      background: var(--teal-soft);
      border: none;
      border-radius: 10px;
      padding: 8px 18px;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .nav-open-btn:hover { opacity: 0.8; }

    .hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 64px 40px 48px;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-family: 'Fira Code', monospace;
      color: var(--teal);
      background: var(--teal-soft);
      border: 1px solid rgba(15, 118, 110, 0.2);
      padding: 5px 14px;
      border-radius: 999px;
      margin-bottom: 32px;
      letter-spacing: 0.04em;
      animation: fadeUp 0.5s ease forwards;
    }
    .hero-title {
      font-family: 'Lora', serif;
      font-size: clamp(44px, 7vw, 72px);
      font-weight: 700;
      color: var(--text);
      line-height: 1.12;
      margin: 0 0 20px;
      letter-spacing: -0.02em;
      animation: fadeUp 0.5s 0.1s ease both;
    }
    .hero-title em {
      font-style: normal;
      color: var(--teal);
    }
    .hero-sub {
      font-size: 17px;
      color: var(--text2);
      max-width: 440px;
      line-height: 1.75;
      margin: 0 0 40px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      animation: fadeUp 0.5s 0.2s ease both;
    }
    .cta-row {
      display: flex;
      align-items: center;
      gap: 14px;
      animation: fadeUp 0.5s 0.3s ease both;
    }
    .cta-primary {
      padding: 14px 32px;
      background: var(--teal);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 20px rgba(15, 118, 110, 0.28);
      letter-spacing: -0.01em;
    }
    .cta-primary:hover {
      opacity: 0.92;
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(15, 118, 110, 0.36);
    }
    .cta-secondary {
      font-size: 14px;
      color: var(--text3);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      max-width: 840px;
      width: 100%;
      margin: 56px auto 0;
      padding: 0 40px;
      animation: fadeUp 0.5s 0.4s ease both;
    }
    .feature-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      text-align: left;
      transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
    }
    .feature-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
      border-color: var(--border2);
      transform: translateY(-2px);
    }
    .feature-icon {
      font-size: 26px;
      margin-bottom: 14px;
      display: block;
    }
    .feature-title {
      font-size: 14px;
      font-weight: 700;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--text);
      margin-bottom: 6px;
    }
    .feature-desc {
      font-size: 12px;
      color: var(--text3);
      font-family: 'Plus Jakarta Sans', sans-serif;
      line-height: 1.65;
    }

    .footer {
      text-align: center;
      padding: 32px 40px 28px;
      font-size: 11px;
      font-family: 'Fira Code', monospace;
      color: var(--text3);
      letter-spacing: 0.04em;
    }

    @media (max-width: 640px) {
      .nav { padding: 16px 24px; }
      .features { grid-template-columns: 1fr; padding: 0 24px; }
      .hero { padding: 48px 24px 40px; }
    }
  `],
  template: `
    <div class="landing">
      <nav class="nav">
        <span class="logo">Notes<span> Pro</span></span>
        <button class="nav-open-btn" (click)="open()">Open App →</button>
      </nav>

      <section class="hero">
        <div class="hero-badge">✦ distraction-free writing</div>
        <h1 class="hero-title">Write more.<br><em>Think clearer.</em></h1>
        <p class="hero-sub">
          A minimal, beautiful notes app that keeps your thoughts organized and your focus sharp.
        </p>
        <div class="cta-row">
          <button class="cta-primary" (click)="open()">Start Writing →</button>
          <span class="cta-secondary">No sign-up · Works offline</span>
        </div>

        <div class="features">
          <div class="feature-card">
            <span class="feature-icon">✍️</span>
            <div class="feature-title">Rich Editing</div>
            <div class="feature-desc">Format your notes with bold, headings, lists, quotes, and more.</div>
          </div>
          <div class="feature-card">
            <span class="feature-icon">📒</span>
            <div class="feature-title">Notebooks</div>
            <div class="feature-desc">Group your notes into color-coded notebooks to stay organized.</div>
          </div>
          <div class="feature-card">
            <span class="feature-icon">💾</span>
            <div class="feature-title">Offline First</div>
            <div class="feature-desc">Everything is saved locally in your browser. Fast, private, always available.</div>
          </div>
        </div>
      </section>

      <footer class="footer">Notes Pro · your thoughts, beautifully kept</footer>
    </div>
  `,
})
export class LandingComponent {
  private router = inject(Router);

  open(): void {
    this.router.navigate(['/notes']);
  }
}
