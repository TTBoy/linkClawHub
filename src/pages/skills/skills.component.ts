
import { Component, inject, signal, effect } from '@angular/core';
import { SkillService } from '../../services/skill.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-brand-textLight dark:text-brand-textDark mb-2">技能</h1>
          <p class="text-brand-mutedLight dark:text-brand-mutedDark">浏览技能库。</p>
        </div>
        
        <div class="w-full md:w-auto flex flex-col gap-4">
           <!-- Search Box -->
           <div class="relative">
             <input 
               type="text" 
               [(ngModel)]="searchQuery"
               placeholder="按名称、别名或摘要筛选..." 
               class="w-full md:w-80 pl-4 pr-10 py-2 rounded-full border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-brand-cardDark text-brand-textLight dark:text-brand-textDark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-gray-400 font-light"
             >
             <span class="material-icons absolute right-3 top-2.5 text-gray-400 text-sm">search</span>
           </div>
           
           <!-- Filter Tags -->
           <div class="flex gap-2 items-center justify-end">
             <button class="px-4 py-1.5 rounded-full text-sm font-bold bg-white dark:bg-brand-cardDark border border-brand-borderLight dark:border-brand-borderDark text-brand-textLight dark:text-brand-textDark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">突出显示</button>
             <button class="px-4 py-1.5 rounded-full text-sm font-bold bg-white dark:bg-brand-cardDark border border-brand-borderLight dark:border-brand-borderDark text-brand-textLight dark:text-brand-textDark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">最新</button>
             
             <button class="p-1.5 rounded-full border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-brand-cardDark hover:bg-gray-50 dark:hover:bg-gray-800 text-brand-textLight dark:text-brand-textDark flex items-center justify-center w-8 h-8">
                <span class="material-icons text-sm">arrow_downward</span>
             </button>
              
             <!-- View Toggle Button -->
             <button 
               (click)="toggleViewMode()"
               class="px-4 py-1.5 rounded-full text-sm font-bold border transition-colors flex items-center gap-1"
               [class.bg-brand-primary-light]="viewMode() === 'card'"
               [class.bg-brand-primary]="viewMode() === 'card'"
               [class.text-white]="viewMode() === 'card'"
               [class.border-brand-primary]="viewMode() === 'card'"
               [class.bg-white]="viewMode() === 'list'"
               [class.dark:bg-brand-cardDark]="viewMode() === 'list'"
               [class.text-brand-textLight]="viewMode() === 'list'"
               [class.dark:text-brand-textDark]="viewMode() === 'list'"
               [class.border-brand-borderLight]="viewMode() === 'list'"
               [class.dark:border-brand-borderDark]="viewMode() === 'list'"
             >
                {{ viewMode() === 'card' ? '列表' : '卡片' }}
             </button>
           </div>
        </div>
      </div>

      <!-- Skills Container -->
      @if (viewMode() === 'card') {
        <!-- Grid / Card View -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (skill of skills(); track skill.id) {
            <div [routerLink]="['/skills', skill.slug]" class="bg-brand-cardLight dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-borderLight dark:border-brand-borderDark hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full">
               <!-- Header -->
               <div class="mb-3">
                  <h3 class="text-lg font-bold text-brand-textLight dark:text-brand-textDark mb-1 leading-snug group-hover:text-brand-primary transition-colors">{{ skill.name }}</h3>
               </div>
               
               <!-- Description -->
               <p class="text-sm text-brand-mutedLight dark:text-brand-mutedDark mb-6 flex-grow line-clamp-4 leading-relaxed">
                 {{ skill.description }}
               </p>
               
               <!-- Footer Stats -->
               <div class="flex items-center gap-4 text-xs font-mono text-brand-mutedLight dark:text-brand-mutedDark mt-auto">
                 <div class="flex items-center gap-1">
                    <span class="material-icons text-yellow-400 text-sm">star</span>
                    <span class="text-brand-textLight dark:text-brand-textDark">{{ skill.stars }}</span>
                 </div>
                 <div class="flex items-center gap-1">
                    <span class="material-icons text-brand-mutedLight dark:text-brand-mutedDark text-sm rotate-180" style="transform: rotate(180deg);">arrow_upward</span>
                    <span class="text-brand-textLight dark:text-brand-textDark">{{ skill.downloads }}</span>
                 </div>
                 <div class="flex items-center gap-1">
                    <span class="material-icons text-brand-mutedLight dark:text-brand-mutedDark text-sm">arrow_upward</span>
                    <span class="text-brand-textLight dark:text-brand-textDark">{{ skill.trending || 0 }}</span>
                 </div>
               </div>
            </div>
          }
        </div>
      } @else {
        <!-- List View -->
        <div class="flex flex-col gap-4">
          @for (skill of skills(); track skill.id) {
            <div [routerLink]="['/skills', skill.slug]" class="bg-brand-cardLight dark:bg-brand-cardDark p-6 rounded-xl border border-brand-borderLight dark:border-brand-borderDark hover:shadow-md transition-shadow group cursor-pointer">
               <div class="flex flex-col md:flex-row justify-between md:items-start gap-2">
                  <div>
                     <div class="flex items-baseline gap-2 mb-1">
                        <h3 class="text-base font-bold text-brand-textLight dark:text-brand-textDark group-hover:text-brand-primary transition-colors">{{ skill.name }}</h3>
                        <span class="font-mono text-sm text-brand-mutedLight dark:text-brand-mutedDark">/{{ skill.slug }}</span>
                     </div>
                     <p class="text-brand-mutedLight dark:text-brand-mutedDark text-sm max-w-2xl">{{ skill.description }}</p>
                     
                     <div class="flex gap-2 mt-2">
                        @for(tag of skill.tags; track tag) {
                            <span class="px-2 py-0.5 rounded text-xs bg-brand-primary/10 text-brand-primary border border-brand-primary/20">{{tag}}</span>
                        }
                     </div>
                  </div>
                  
                  <div class="flex items-center gap-4 text-xs font-mono text-brand-mutedLight dark:text-brand-mutedDark shrink-0 mt-2 md:mt-0">
                    <div class="flex items-center gap-1">
                       <span class="material-icons text-yellow-400 text-sm">star</span>
                       {{ skill.stars }}
                    </div>
                     <div class="flex items-center gap-1">
                       <span class="material-icons-outlined text-sm">download</span>
                       {{ skill.downloads }}
                    </div>
                     <div class="flex items-center gap-1">
                       <span class="material-icons-outlined text-sm">history</span>
                       v{{ skill.version }}
                    </div>
                  </div>
               </div>
            </div>
          }
        </div>
      }
      
      @if (skills().length === 0) {
        <div class="text-center py-20 bg-brand-cardLight dark:bg-brand-cardDark rounded-xl border border-dashed border-brand-borderLight dark:border-brand-borderDark mt-6">
           <span class="material-icons text-4xl text-brand-mutedLight mb-2">dns</span>
           <p class="text-brand-textLight dark:text-brand-textDark font-medium">没有数据？</p>
           <p class="text-brand-mutedLight dark:text-brand-mutedDark text-sm mt-1">请确保您已在终端运行 <code>node server.js</code> 以启动后端数据服务。</p>
        </div>
      }
    </div>
  `
})
export class SkillsComponent {
  skillService = inject(SkillService);
  searchQuery = signal('');
  viewMode = signal<'list' | 'card'>('card');
  
  // Directly expose the service signal
  skills = this.skillService.skills;

  constructor() {
    // Whenever searchQuery changes, trigger the backend call
    effect(() => {
      this.skillService.loadSkills(this.searchQuery());
    });
  }

  toggleViewMode() {
    this.viewMode.update(mode => mode === 'list' ? 'card' : 'list');
  }
}
