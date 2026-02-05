
import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SkillService } from '../../services/skill.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DecimalPipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold text-brand-textLight dark:text-brand-textDark mb-2">发布一项技能</h1>
      <p class="text-brand-mutedLight dark:text-brand-mutedDark mb-8">拖放一个包含 SKILL.md 和文本文件的文件夹。我们会处理剩下的部分。</p>
      
      @if (!authService.currentUser()) {
        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <p class="text-amber-800 dark:text-amber-200 mb-0">您必须登录才能上传技能。</p>
        </div>
      } @else {
        <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Left Column: Metadata -->
          <div class="space-y-6">
            <div class="bg-brand-cardLight dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-borderLight dark:border-brand-borderDark shadow-sm">
              <div class="space-y-4">
                 <div>
                   <label class="block text-sm font-medium text-brand-textLight dark:text-brand-textDark mb-1">Slug (唯一标识)</label>
                   <input formControlName="slug" type="text" class="w-full px-4 py-2 rounded-lg border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-[#1E1E1E] text-brand-textLight dark:text-brand-textDark focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all" placeholder="skill-name">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-brand-textLight dark:text-brand-textDark mb-1">显示名称</label>
                   <input formControlName="name" type="text" class="w-full px-4 py-2 rounded-lg border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-[#1E1E1E] text-brand-textLight dark:text-brand-textDark focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all" placeholder="我的酷技能">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-brand-textLight dark:text-brand-textDark mb-1">版本</label>
                   <div class="flex items-center gap-2">
                     <span class="text-brand-mutedLight font-mono">v</span>
                     <input formControlName="version" type="text" class="w-full px-4 py-2 rounded-lg border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-[#1E1E1E] text-brand-textLight dark:text-brand-textDark focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all" placeholder="1.0.0">
                   </div>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-brand-textLight dark:text-brand-textDark mb-1">标签 (逗号分隔)</label>
                   <input formControlName="tags" type="text" class="w-full px-4 py-2 rounded-lg border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-[#1E1E1E] text-brand-textLight dark:text-brand-textDark focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all" placeholder="latest, beta, tools">
                 </div>
              </div>
            </div>

            <div class="bg-brand-cardLight dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-borderLight dark:border-brand-borderDark shadow-sm">
               <h3 class="font-medium text-brand-textLight dark:text-brand-textDark mb-2">验证清单</h3>
               <ul class="space-y-2 text-sm text-brand-mutedLight dark:text-brand-mutedDark">
                 <li class="flex items-center gap-2">
                    <span class="material-icons text-base" [class.text-green-500]="uploadForm.get('slug')?.valid" [class.text-gray-300]="!uploadForm.get('slug')?.valid">check_circle</span>
                    <span>Slug 必须填写</span>
                 </li>
                 <li class="flex items-center gap-2">
                    <span class="material-icons text-base" [class.text-green-500]="uploadForm.get('name')?.valid" [class.text-gray-300]="!uploadForm.get('name')?.valid">check_circle</span>
                    <span>需要显示名称</span>
                 </li>
                 <li class="flex items-center gap-2">
                    <span class="material-icons text-base" [class.text-green-500]="filesCount() > 0" [class.text-gray-300]="filesCount() === 0">check_circle</span>
                    <span>包含文件 ({{ filesCount() }})</span>
                 </li>
               </ul>
            </div>
            
            <button 
              type="submit" 
              [disabled]="uploadForm.invalid || isSubmitting()"
              class="w-full py-3.5 bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primaryHover text-white font-bold text-lg rounded-full transition-all shadow-lg shadow-brand-primary/30 active:scale-95"
            >
              @if (isSubmitting()) {
                <span class="inline-block animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              }
              {{ isSubmitting() ? '正在上传...' : '发布技能包' }}
            </button>
          </div>

          <!-- Right Column: Dropzone & Changelog -->
          <div class="space-y-6">
            
            <!-- Hidden File Input for Directory -->
            <input 
              #fileInput 
              type="file" 
              webkitdirectory 
              directory 
              multiple 
              class="hidden" 
              (change)="onFileSelected($event)"
            >

            <!-- Drop Zone -->
            <div 
              (click)="fileInput.click()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              class="group relative bg-brand-cardLight dark:bg-brand-cardDark p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center min-h-[240px]"
              [class.border-brand-primary]="isDragging() || filesCount() > 0"
              [class.bg-brand-primary-50]="isDragging()"
              [class.dark:bg-brand-primary-900_10]="isDragging()"
              [class.border-brand-borderLight]="!isDragging() && filesCount() === 0"
              [class.dark:border-brand-borderDark]="!isDragging() && filesCount() === 0"
            >
               @if (filesCount() > 0) {
                 <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
                   <span class="material-icons text-3xl">folder_zip</span>
                 </div>
                 <h3 class="font-bold text-lg text-brand-textLight dark:text-brand-textDark mb-1">已选择 {{ filesCount() }} 个文件</h3>
                 <p class="text-brand-mutedLight dark:text-brand-mutedDark text-sm mb-4">{{ totalSize() | number }} 字节</p>
                 
                 <div class="flex gap-2">
                    <button type="button" (click)="$event.stopPropagation(); fileInput.click()" class="px-3 py-1 rounded-md bg-white dark:bg-[#1E1E1E] border border-brand-borderLight dark:border-brand-borderDark text-sm font-medium hover:text-brand-primary">
                      更改
                    </button>
                    <button type="button" (click)="clearFiles($event)" class="px-3 py-1 rounded-md bg-white dark:bg-[#1E1E1E] border border-brand-borderLight dark:border-brand-borderDark text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      清除
                    </button>
                 </div>
               } @else {
                 <div class="w-16 h-16 rounded-full bg-brand-light dark:bg-[#1E1E1E] text-brand-mutedLight flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                   <span class="material-icons text-3xl">folder_open</span>
                 </div>
                 <p class="font-bold text-lg text-brand-textLight dark:text-brand-textDark mb-1">点击选择文件夹</p>
                 <p class="text-sm text-brand-mutedLight dark:text-brand-mutedDark">或将文件夹拖放到此处</p>
               }
            </div>

            <div class="bg-brand-cardLight dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-borderLight dark:border-brand-borderDark h-[340px] flex flex-col shadow-sm">
              <div class="flex justify-between items-center mb-2">
                <label class="text-sm font-medium text-brand-textLight dark:text-brand-textDark">
                   README / 更新日志
                </label>
                @if (autoFilledReadme()) {
                  <span class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 animate-pulse">
                    <span class="material-icons text-xs">auto_fix_high</span>
                    已从文件自动填充
                  </span>
                }
              </div>
              <textarea 
                formControlName="changelog" 
                class="flex-grow w-full resize-none bg-gray-50 dark:bg-[#1E1E1E] rounded-xl p-4 border border-brand-borderLight dark:border-brand-borderDark outline-none text-brand-textLight dark:text-brand-textDark placeholder-brand-mutedLight text-sm font-mono leading-relaxed focus:ring-2 focus:ring-brand-primary/30 transition-all" 
                placeholder="# Skill Name&#10;&#10;Description of the changes..."
              ></textarea>
            </div>
          </div>

        </form>
      }
    </div>
  `
})
export class UploadComponent {
  authService = inject(AuthService);
  skillService = inject(SkillService);
  router = inject(Router);
  fb = inject(FormBuilder);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isSubmitting = signal(false);
  isDragging = signal(false);
  filesCount = signal(0);
  totalSize = signal(0);
  autoFilledReadme = signal(false);

  uploadForm = this.fb.group({
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    name: ['', Validators.required],
    version: ['1.0.0', [Validators.required, Validators.pattern(/^\d+\.\d+\.\d+$/)]],
    tags: ['latest'],
    changelog: ['']
  });

  // Handle drag events
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(input.files);
    }
  }

  clearFiles(event: Event) {
    event.stopPropagation();
    this.filesCount.set(0);
    this.totalSize.set(0);
    this.autoFilledReadme.set(false);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private handleFiles(fileList: FileList) {
    this.filesCount.set(fileList.length);
    
    let size = 0;
    let readmeFile: File | null = null;

    Array.from(fileList).forEach(file => {
      size += file.size;
      // Look for readme
      if (file.name.toLowerCase() === 'readme.md' || file.name.toLowerCase() === 'skill.md') {
        readmeFile = file;
      }
    });

    this.totalSize.set(size);

    // Auto-fill content if README found
    if (readmeFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          this.uploadForm.patchValue({ changelog: content });
          this.autoFilledReadme.set(true);
          
          // Try to guess name from first line if empty
          if (!this.uploadForm.get('name')?.value) {
            const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
            if (firstLine) {
               this.uploadForm.patchValue({ name: firstLine });
            }
          }
        }
      };
      reader.readAsText(readmeFile as File);
    }
  }

  onSubmit() {
    if (this.uploadForm.valid) {
      this.isSubmitting.set(true);
      const formVal = this.uploadForm.value;
      
      // Since backend doesn't support multipart yet, we send metadata
      // In a real app, we would use FormData to append files
      this.skillService.addSkill({
        slug: formVal.slug!,
        name: formVal.name!,
        version: formVal.version!,
        description: formVal.changelog || 'No description provided.',
        readme: formVal.changelog || '', // Use changelog as readme for now
        tags: (formVal.tags || '').split(',').map(t => t.trim()),
        author: this.authService.currentUser()?.username || 'Unknown'
      }).subscribe({
        next: () => {
          setTimeout(() => { // Small delay for UX
            this.isSubmitting.set(false);
            this.router.navigate(['/skills']);
          }, 800);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert('Publish failed. Ensure backend is running.');
          console.error(err);
        }
      });
    }
  }
}
