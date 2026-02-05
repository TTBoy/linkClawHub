
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Login Check -->
      @if (!authService.currentUser()) {
        <h1 class="text-3xl font-bold text-brand-textLight dark:text-brand-textDark mb-2">从 GitHub 导入</h1>
        <p class="text-brand-mutedLight dark:text-brand-mutedDark mb-8">连接公共存储库以发布您的技能。</p>
        
        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <p class="text-amber-800 dark:text-amber-200 mb-0">您必须登录才能导入技能。</p>
        </div>
      } @else {
        <!-- Main Content -->
        <div class="relative">
           <!-- Header Section -->
           <div class="mb-12">
             <div class="text-brand-primary font-bold tracking-widest text-sm uppercase mb-2">GITHUB 导入</div>
             
             <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div>
                 <h1 class="text-4xl md:text-5xl font-bold text-brand-textLight dark:text-brand-textDark mb-4">从 GitHub 导入</h1>
                 <p class="text-xl text-brand-mutedLight dark:text-brand-mutedDark font-light">
                   仅限公共仓库。自动检测 SKILL.md。
                 </p>
               </div>
               
               <!-- Badge -->
               <div class="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-6 py-4 rounded-3xl text-center shadow-sm">
                 <div class="text-sm font-bold opacity-80 mb-1">仅限公共</div>
                 <div class="font-bold tracking-wide">提交固定</div>
               </div>
             </div>
           </div>

           <!-- Card Section -->
           <div class="bg-brand-cardLight dark:bg-brand-cardDark rounded-[2rem] shadow-xl border border-brand-borderLight dark:border-brand-borderDark p-8 md:p-12 relative overflow-hidden">
             <!-- Background decoration -->
             <div class="absolute -top-20 -right-20 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl"></div>
             
             <div class="relative z-10">
               <div class="flex justify-between items-end mb-2">
                 <label class="font-bold text-lg text-brand-textLight dark:text-brand-textDark">GitHub 网址</label>
                 <span class="text-sm text-brand-mutedLight dark:text-brand-mutedDark">仓库、树路径或 Blob</span>
               </div>
               
               <div class="mb-8">
                 <input 
                   [formControl]="urlControl"
                   type="text" 
                   placeholder="https://github.com/owner/repo" 
                   class="w-full px-6 py-4 rounded-xl border border-brand-borderLight dark:border-brand-borderDark bg-gray-50 dark:bg-[#1E1E1E] text-brand-textLight dark:text-brand-textDark text-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all"
                 >
                 @if (urlControl.dirty && urlControl.invalid) {
                   <p class="text-red-500 text-sm mt-2 ml-2">请输入有效的 GitHub URL</p>
                 }
               </div>
               
               <button 
                 (click)="onDetect()"
                 [disabled]="urlControl.invalid || isDetecting()"
                 class="px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-medium rounded-full transition-colors shadow-lg shadow-brand-primary/30 flex items-center gap-2"
               >
                 @if (isDetecting()) {
                   <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                   检测中...
                 } @else {
                   检测
                 }
               </button>
             </div>
           </div>
        </div>
      }
    </div>
  `
})
export class ImportComponent {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  
  urlControl = this.fb.control('', [
    Validators.required, 
    Validators.pattern(/^https:\/\/github\.com\/[^\/]+\/[^\/]+.*$/)
  ]);

  isDetecting = signal(false);

  onDetect() {
    if (this.urlControl.valid) {
      this.isDetecting.set(true);
      // Simulate API call
      setTimeout(() => {
        this.isDetecting.set(false);
        alert('SKILL.md detected! Ready to import...');
      }, 1500);
    }
  }
}
