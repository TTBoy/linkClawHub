
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SkillService } from '../../services/skill.service';
import { DatePipe, DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DecimalPipe, CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <div class="inline-block px-3 py-1 mb-4 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium border border-brand-primary/20">
            淡龙虾味。经纪人合适。
          </div>
          <h1 class="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-brand-textLight dark:text-brand-textDark">
            ClawHub， 精英特工的<br>技能平台。
          </h1>
          <p class="text-xl text-brand-mutedLight dark:text-brand-mutedDark mb-8 leading-relaxed">
            上传 AgentSkills 包， 像 npm 一样进行版本控制， 并使用向量使其可搜索。无需任何门槛， 只需发出信号即可。
          </p>
          <div class="flex gap-4">
            <a routerLink="/upload" class="px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-full transition-colors shadow-lg shadow-brand-primary/30">
              发布一项技能
            </a>
            <a routerLink="/skills" class="px-6 py-3 bg-white dark:bg-brand-cardDark border border-brand-borderLight dark:border-brand-borderDark text-brand-textLight dark:text-brand-textDark font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              浏览技能
            </a>
          </div>
        </div>

        <!-- Terminal/Command Card -->
        <div class="bg-brand-cardLight dark:bg-brand-cardDark p-8 rounded-3xl shadow-xl border border-brand-borderLight dark:border-brand-borderDark">
          <p class="mb-4 text-brand-mutedLight dark:text-brand-mutedDark">搜索技能。版本控制，可回滚。</p>
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
             <span class="text-sm text-brand-mutedLight dark:text-brand-mutedDark">一次性安装任意技能文件夹：</span>
             <div class="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 mt-2 sm:mt-0">
               <button 
                 (click)="setPkg('npm')"
                 class="px-3 py-1 text-xs font-bold rounded-full transition-all duration-200"
                 [ngClass]="pkg() === 'npm' ? 'bg-brand-primary/20 text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
               >npm</button>

               <button 
                 (click)="setPkg('pnpm')"
                 class="px-3 py-1 text-xs font-bold rounded-full transition-all duration-200"
                 [ngClass]="pkg() === 'pnpm' ? 'bg-brand-primary/20 text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
               >pnpm</button>

               <button 
                 (click)="setPkg('bun')"
                 class="px-3 py-1 text-xs font-bold rounded-full transition-all duration-200"
                 [ngClass]="pkg() === 'bun' ? 'bg-brand-primary/20 text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
               >bun</button>
             </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl p-4 font-mono text-sm overflow-x-auto text-brand-textLight dark:text-gray-300 flex items-center gap-2">
             <span class="text-brand-mutedLight dark:text-brand-mutedDark select-none">$</span>
             <span class="whitespace-nowrap">{{ installCommand() }}</span>
          </div>
        </div>
      </div>

      <!-- Highlighted Skills -->
      <div class="mb-16">
        <h2 class="text-3xl font-semibold mb-2 text-brand-textLight dark:text-brand-textDark">突出技能</h2>
        <p class="text-brand-mutedLight dark:text-brand-mutedDark mb-8">精选信号——突出显示，以便快速建立信任。</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (skill of highlightedSkills(); track skill.id) {
            <div [routerLink]="['/skills', skill.slug]" class="bg-brand-cardLight dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-borderLight dark:border-brand-borderDark hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer group">
              <div class="mb-4">
                <span class="inline-block px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md">
                  突出显示
                </span>
              </div>
              <h3 class="text-lg font-bold mb-2 text-brand-textLight dark:text-brand-textDark group-hover:text-brand-primary transition-colors">{{ skill.name }}</h3>
              <p class="text-sm text-brand-mutedLight dark:text-brand-mutedDark mb-6 flex-grow line-clamp-3">
                {{ skill.description }}
              </p>
              <div class="flex items-center gap-4 text-xs text-brand-mutedLight dark:text-brand-mutedDark font-medium">
                <div class="flex items-center gap-1">
                   <span class="material-icons-outlined text-yellow-500 text-sm">star</span>
                   {{ skill.stars }}
                </div>
                <div class="flex items-center gap-1">
                   <span class="material-icons-outlined text-sm">download</span>
                   {{ skill.downloads | number }}
                </div>
                <div class="flex items-center gap-1">
                   <span class="material-icons-outlined text-sm">publish</span>
                   {{ skill.version }}
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Latest Drops -->
      <div>
        <h2 class="text-3xl font-semibold mb-2 text-brand-textLight dark:text-brand-textDark">最新发布</h2>
        <p class="text-brand-mutedLight dark:text-brand-mutedDark mb-6">注册中心最新上传内容。</p>
        
        <div class="bg-brand-cardLight dark:bg-brand-cardDark border border-brand-borderLight dark:border-brand-borderDark rounded-xl p-8 py-12 text-center text-brand-mutedLight dark:text-brand-mutedDark">
          还没有技能。快来成为第一个！
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  skillService = inject(SkillService);
  highlightedSkills = this.skillService.highlightedSkills;
  
  pkg = signal<'npm' | 'pnpm' | 'bun'>('npm');
  
  installCommand = computed(() => {
    switch(this.pkg()) {
      case 'npm': return 'npx clawhub@latest install sonoscli';
      case 'pnpm': return 'pnpm dlx clawhub@latest install sonoscli';
      case 'bun': return 'bunx clawhub@latest install sonoscli';
      default: return 'npx clawhub@latest install sonoscli';
    }
  });

  ngOnInit() {
    // Reset any search filter when entering home
    this.skillService.loadSkills('');
  }

  setPkg(p: 'npm' | 'pnpm' | 'bun') {
    this.pkg.set(p);
  }
}
