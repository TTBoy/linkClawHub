
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SkillService } from '../../services/skill.service';

// --- GitHub API Interfaces ---
interface GitHubRepo {
  default_branch: string;
}

interface GitHubRef {
  object: {
    sha: string;
  };
}

interface GitHubTree {
  tree: {
    path: string;
    type: 'blob' | 'tree';
    size?: number;
  }[];
}

// --- Local Interfaces for this component ---
interface DetectedSkill {
  name: string; // e.g., "技能/内部通信"
  path: string; // e.g., "internal-comms-2"
}

interface DetectedFile {
  name: string; // e.g., "技能/内部通信/示例/公司通讯.md"
  path: string;
  size: number; // in bytes
  selected: boolean;
}

type ImportState = 'idle' | 'detecting' | 'selectSkill' | 'configure' | 'importing' | 'error';


@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './import.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `]
})
export class ImportComponent {
  // --- Injected Services ---
  authService = inject(AuthService);
  skillService = inject(SkillService);
  router = inject(Router);
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  
  // --- State Management ---
  importState = signal<ImportState>('idle');
  errorMessage = signal('');

  // --- Form Controls ---
  urlControl = this.fb.control('', [
    Validators.required, 
    Validators.pattern(/^https:\/\/github\.com\/[^\/]+\/[^\/]+.*$/)
  ]);

  importForm = this.fb.group({
    selectedSkillPath: ['', Validators.required],
    slug: ['', Validators.required],
    name: ['', Validators.required],
    version: ['0.1.0', Validators.required],
    tags: ['latest']
  });
  
  // --- Data Signals ---
  detectedSkills = signal<DetectedSkill[]>([]);
  detectedFiles = signal<DetectedFile[]>([]);
  private fullFileTree = signal<{path: string; type: string; size?: number}[]>([]);


  // --- Computed Signals for UI ---
  selectionSummary = computed(() => {
    const files = this.detectedFiles();
    const selectedFiles = files.filter(f => f.selected);
    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    return {
      count: selectedFiles.length,
      totalCount: files.length,
      size: this.formatBytes(totalSize)
    };
  });

  // --- Main Actions ---

  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
      const path = new URL(url).pathname.substring(1);
      const [owner, repo] = path.split('/');
      if (owner && repo) {
        return { owner, repo };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Starts the detection process by calling the GitHub API.
   */
  onDetect() {
    if (this.urlControl.invalid) return;
    this.importState.set('detecting');
    this.errorMessage.set('');

    const repoInfo = this.parseGitHubUrl(this.urlControl.value!);
    if (!repoInfo) {
      this.errorMessage.set('无效的 GitHub 仓库 URL。');
      this.importState.set('error');
      return;
    }

    const { owner, repo } = repoInfo;

    // Chain of API calls to get the full file tree
    this.http.get<GitHubRepo>(`https://api.github.com/repos/${owner}/${repo}`).pipe(
      switchMap(repoData => {
        const branch = repoData.default_branch;
        return this.http.get<GitHubRef>(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`);
      }),
      switchMap(refData => {
        const treeSha = refData.object.sha;
        return this.http.get<GitHubTree>(`https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
      }),
      map(treeData => {
        this.fullFileTree.set(treeData.tree);
        
        const skillDirs = new Set<string>();
        for (const file of treeData.tree) {
          const fileName = file.path.split('/').pop()?.toLowerCase();
          if (fileName === 'skill.md' || fileName === 'readme.md') {
            const parts = file.path.split('/');
            parts.pop(); // remove filename
            const dir = parts.join('/');
            if (dir) skillDirs.add(dir);
          }
        }
        
        return Array.from(skillDirs).map(path => ({
          name: `技能/${path.split('/').pop()}`,
          path: path
        }));
      }),
      catchError(err => {
        console.error('GitHub API Error:', err);
        this.errorMessage.set('无法从 GitHub 获取数据。请检查 URL 是否正确，以及仓库是否为公开的。');
        this.importState.set('error');
        return of(null);
      })
    ).subscribe(skills => {
      if (skills) {
        if (skills.length === 0) {
          this.errorMessage.set('在该仓库中未检测到技能 (未找到 SKILL.md 文件)。');
          this.importState.set('error');
        } else {
          this.detectedSkills.set(skills);
          if (skills.length === 1) {
            this.selectSkill(skills[0].path);
          } else {
            this.importState.set('selectSkill');
          }
        }
      }
    });
  }


  /**
   * Triggered when a skill is selected. Filters the full file list.
   */
  selectSkill(skillPath: string) {
    const skill = this.detectedSkills().find(s => s.path === skillPath);
    if (!skill) return;

    this.importForm.patchValue({
      selectedSkillPath: skill.path,
      slug: skill.path.split('/').pop() || skill.path,
      name: skill.name.split('/')[1] || skill.path 
    });
    
    const filesForSkill = this.fullFileTree()
      .filter(f => f.type === 'blob' && f.path.startsWith(skillPath + '/'))
      .map(f => ({
          name: f.path,
          path: f.path,
          size: f.size || 0,
          selected: f.path.toLowerCase().endsWith('skill.md') || f.path.toLowerCase().endsWith('readme.md')
      }));

    this.detectedFiles.set(filesForSkill);
    this.importState.set('configure');
  }

  /**
   * Handles the final import and publish action.
   */
  onImportAndPublish() {
    if (this.importForm.invalid) return;

    this.importState.set('importing');
    const formValue = this.importForm.value;

    this.skillService.addSkill({
      slug: formValue.slug!,
      name: formValue.name!,
      version: formValue.version!,
      tags: (formValue.tags || '').split(',').map(t => t.trim()),
      description: `从 GitHub 导入: ${this.urlControl.value}`,
      readme: `从 GitHub 导入的技能 ${formValue.name}`,
      author: this.authService.currentUser()?.username || 'github-importer'
    }).subscribe({
      next: (newSkill) => {
        setTimeout(() => {
          this.router.navigate(['/skills', newSkill.slug]);
        }, 1000);
      },
      error: (err) => {
        this.importState.set('error');
        this.errorMessage.set('导入失败。请稍后再试。');
        console.error(err);
      }
    });
  }

  // --- File Selection Helpers ---

  toggleFileSelection(index: number) {
    this.detectedFiles.update(files => {
      const newFiles = [...files];
      newFiles[index] = { ...newFiles[index], selected: !newFiles[index].selected };
      return newFiles;
    });
  }

  selectAllFiles() {
    this.detectedFiles.update(files => files.map(f => ({ ...f, selected: true })));
  }

  clearSelection() {
    this.detectedFiles.update(files => files.map(f => ({ ...f, selected: false })));
  }

  selectExample() {
    this.detectedFiles.update(files => files.map(f => ({ ...f, selected: f.name.toLowerCase().includes('skill.md') || f.name.toLowerCase().includes('readme.md') })));
  }

  // --- Utility Functions ---

  formatBytes(bytes: number, decimals = 2): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  reset() {
    this.importState.set('idle');
    this.detectedSkills.set([]);
    this.detectedFiles.set([]);
    this.urlControl.reset('');
    this.importForm.reset({ version: '0.1.0', tags: 'latest' });
  }
}
