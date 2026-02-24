import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'notes',
        loadComponent: () =>
          import('./features/notes-list/notes-list.component').then(
            (m) => m.NotesListComponent,
          ),
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./features/editor/editor.component').then(
                (m) => m.EditorComponent,
              ),
          },
        ],
      },
      {
        path: 'notebooks/:notebookId',
        loadComponent: () =>
          import('./features/notes-list/notes-list.component').then(
            (m) => m.NotesListComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
