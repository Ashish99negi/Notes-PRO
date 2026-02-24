import {
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { NotesStore } from '../../core/store/notes.store';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  styles: [`
    .shell-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg);
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100%;
      overflow: hidden;
    }
    .router-area {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .mobile-topbar {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      flex-shrink: 0;
    }
    .mobile-bottomnav {
      display: flex;
      align-items: center;
      justify-content: space-around;
      border-top: 1px solid var(--border);
      background: var(--surface);
      height: 60px;
      flex-shrink: 0;
    }
    .mobile-nav-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 0 12px;
      background: none;
      border: none;
      cursor: pointer;
    }
    .mobile-nav-icon { font-size: 18px; }
    .mobile-nav-label {
      font-size: 9px;
      font-family: 'Fira Code', monospace;
    }
    .mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: rgba(0,0,0,0.4);
    }
    .mobile-sidebar-drawer {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 50;
      animation: fadeUp 0.25s ease;
    }
    .hamburger-btn {
      font-size: 20px;
      margin-right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text2);
    }
    .topbar-logo {
      font-family: 'Lora', serif;
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
    }
    .topbar-logo span { color: var(--teal); }
  `],
  template: `
    <div class="shell-layout">
      @if (isMobileSidebarOpen()) {
        <div class="mobile-overlay" (click)="isMobileSidebarOpen.set(false)" aria-hidden="true"></div>
        <div class="mobile-sidebar-drawer">
          <app-sidebar></app-sidebar>
        </div>
      }

      @if (!isMobile()) {
        <app-sidebar></app-sidebar>
      }

      <div class="main-content">
        @if (isMobile()) {
          <div class="mobile-topbar">
            <button class="hamburger-btn" (click)="isMobileSidebarOpen.set(true)" aria-label="Open menu">☰</button>
            <span class="topbar-logo">Notes<span> Pro</span></span>
          </div>
        }

        <div class="router-area">
          <router-outlet></router-outlet>
        </div>

        @if (isMobile()) {
          <nav class="mobile-bottomnav" aria-label="Mobile navigation">
            @for (item of mobileNavItems; track item.label) {
              <button
                class="mobile-nav-btn"
                (click)="item.action()"
                [style.color]="item.isActive() ? 'var(--teal)' : 'var(--text3)'"
                [attr.aria-label]="item.label"
              >
                <span class="mobile-nav-icon">{{ item.icon }}</span>
                <span class="mobile-nav-label">{{ item.label }}</span>
              </button>
            }
          </nav>
        }
      </div>
    </div>
  `,
})
export class ShellComponent implements OnInit {
  private store = inject(NotesStore);
  private breakpoints = inject(BreakpointObserver);

  isMobileSidebarOpen = signal(false);
  isMobile = toSignal(
    this.breakpoints.observe('(max-width: 767px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  mobileNavItems = [
    {
      label: 'Notes',
      icon: '📝',
      action: () => this.store.setFilter('all'),
      isActive: computed(() => this.store.activeFilter() === 'all'),
    },
    {
      label: 'Folders',
      icon: '📂',
      action: () => this.isMobileSidebarOpen.set(true),
      isActive: computed(() => false),
    },
    {
      label: 'Pinned',
      icon: '📌',
      action: () => this.store.setFilter('pinned'),
      isActive: computed(() => this.store.activeFilter() === 'pinned'),
    },
  ];

  ngOnInit(): void {
    this.store.loadFromStorage();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.isMobileSidebarOpen.set(false);
    }
  }
}
