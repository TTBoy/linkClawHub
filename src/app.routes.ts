
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SkillsComponent } from './pages/skills/skills.component';
import { SkillDetailComponent } from './pages/skill-detail/skill-detail.component';
import { UploadComponent } from './pages/upload/upload.component';
import { ImportComponent } from './pages/import/import.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'skills/:slug', component: SkillDetailComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'import', component: ImportComponent },
  { path: '**', redirectTo: '' }
];
