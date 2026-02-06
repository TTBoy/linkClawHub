
import { Component, inject, signal, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SkillService, Skill } from '../../services/skill.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type Tab = 'files' | 'compare' | 'versions';

@Component({
  selector: 'app-skill-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (skill()) {
        <!-- Header Section -->
        <div class="bg-brand-cardLight dark:bg-brand-cardDark rounded-2xl p-6 md:p-8 border border-brand-borderLight dark:border-brand-borderDark shadow-sm mb-6">
          <div class="flex flex-col md:flex-row justify-between items-start gap-6">
            <div class="flex-grow">
              <h1 class="text-3xl md:text-4xl font-bold text-brand-textLight dark:text-brand-textDark mb-3">{{ skill()?.name }}</h1>
              <p class="text-lg text-brand-mutedLight dark:text-brand-mutedDark mb-6 leading-relaxed max-w-3xl">
                {{ skill()?.description }}
              </p>
              
              <!-- Stats Row -->
              <div class="flex flex-wrap items-center gap-6 text-sm">
                <div class="flex items-center gap-1.5 text-yellow-500 font-medium">
                   <span class="material-icons text-base">star</span>
                   <span>{{ skill()?.stars }}</span>
                </div>
                <div class="flex items-center gap-1.5 text-brand-mutedLight dark:text-brand-mutedDark">
                   <span class="material-icons-outlined text-base">download</span>
                   <span>{{ skill()?.downloads }}</span>
                </div>
                <div class="flex items-center gap-1.5 text-brand-mutedLight dark:text-brand-mutedDark">
                   <span class="text-xs px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">当前 18</span>
                   <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-brand-mutedLight dark:text-brand-mutedDark">总 18</span>
                </div>
              </div>

              <div class="mt-4 flex items-center gap-2 text-sm text-brand-mutedLight dark:text-brand-mutedDark">
                <span>经过</span>
                <span class="font-medium text-brand-textLight dark:text-brand-textDark hover:text-brand-primary cursor-pointer">&#64; {{ skill()?.author || 'Asleep123' }}</span>
              </div>

              <!-- Tags -->
               <div class="flex gap-2 mt-4">
                 <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                    突出显示
                 </span>
                 @if(skill()?.version) {
                   <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-brand-primary/10 text-brand-primary">
                      最新约 v{{skill()?.version}}
                   </span>
                 }
               </div>

            </div>

            <!-- Action Box -->
            <div class="flex flex-col items-end gap-3 min-w-[180px]">
               <div class="bg-brand-light dark:bg-[#1E1E1E] px-4 py-2 rounded-lg border border-brand-borderLight dark:border-brand-borderDark w-full text-center">
                 <span class="text-xs text-brand-mutedLight dark:text-brand-mutedDark block uppercase tracking-wider mb-1">当前版本</span>
                 <span class="font-bold text-xl text-brand-textLight dark:text-brand-textDark">v {{ skill()?.version }}</span>
               </div>
               
               <button class="w-full py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-full shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2">
                 <span>下载压缩包</span>
               </button>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="bg-brand-cardLight dark:bg-brand-cardDark rounded-2xl border border-brand-borderLight dark:border-brand-borderDark shadow-sm overflow-hidden min-h-[500px]">
          
          <!-- Tabs Navigation (Pill Style) -->
          <div class="px-6 py-5 border-b border-brand-borderLight dark:border-brand-borderDark">
             <div class="inline-flex items-center p-1.5 rounded-full bg-[#F3F4F6] dark:bg-[#1C1614] border border-gray-200 dark:border-gray-800">
                <button 
                  (click)="setTab('files')" 
                  class="px-6 py-1.5 rounded-full text-sm font-bold transition-all duration-200"
                  [ngClass]="activeTab() === 'files' 
                     ? 'bg-white dark:bg-brand-cardDark text-brand-textLight dark:text-brand-textDark shadow-sm ring-1 ring-black/5' 
                     : 'text-brand-mutedLight dark:text-brand-mutedDark hover:text-brand-textLight dark:hover:text-brand-textDark font-medium'"
                >文件</button>
                <button 
                  (click)="setTab('compare')" 
                  class="px-6 py-1.5 rounded-full text-sm font-bold transition-all duration-200"
                  [ngClass]="activeTab() === 'compare' 
                     ? 'bg-white dark:bg-brand-cardDark text-brand-textLight dark:text-brand-textDark shadow-sm ring-1 ring-black/5' 
                     : 'text-brand-mutedLight dark:text-brand-mutedDark hover:text-brand-textLight dark:hover:text-brand-textDark font-medium'"
                >比较</button>
                <button 
                  (click)="setTab('versions')" 
                  class="px-6 py-1.5 rounded-full text-sm font-bold transition-all duration-200"
                  [ngClass]="activeTab() === 'versions' 
                     ? 'bg-white dark:bg-brand-cardDark text-brand-textLight dark:text-brand-textDark shadow-sm ring-1 ring-black/5' 
                     : 'text-brand-mutedLight dark:text-brand-mutedDark hover:text-brand-textLight dark:hover:text-brand-textDark font-medium'"
                >版本</button>
             </div>
          </div>

          <!-- Tab Content -->
          <div class="p-6 md:p-8">
            
            <!-- FILES TAB -->
            @if (activeTab() === 'files') {
              <div class="animate-fadeIn">
                 <h3 class="font-bold text-lg text-brand-textLight dark:text-brand-textDark mb-4">技能.md</h3>
                 <!-- Simulated Markdown Content -->
                 <div class="prose dark:prose-invert max-w-none text-brand-textLight dark:text-brand-textDark leading-7">
                    <div [innerHTML]="markdownContent()"></div>
                 </div>
                 
                 <!-- Footer Info -->
                 <div class="mt-12 pt-4 border-t border-brand-borderLight dark:border-brand-borderDark flex justify-between text-xs text-brand-mutedLight dark:text-brand-mutedDark">
                    <span class="font-bold">文件</span>
                    <span>共 1 人</span>
                 </div>
                 <div class="mt-3 bg-brand-light dark:bg-[#1E1E1E] px-4 py-3 rounded-xl border border-brand-borderLight dark:border-brand-borderDark flex justify-between items-center">
                    <span class="font-mono text-sm font-medium">技能.md</span>
                    <span class="text-xs text-brand-mutedLight">3.4 KB</span>
                 </div>
              </div>
            }

            <!-- COMPARE TAB -->
            @if (activeTab() === 'compare') {
              <div class="animate-fadeIn">
                <h2 class="text-xl font-bold mb-2 text-brand-textLight dark:text-brand-textDark">比较版本</h2>
                <p class="text-brand-mutedLight dark:text-brand-mutedDark mb-6 text-sm">对任何文件进行内联或并排差异比较。</p>
                
                <!-- Diff Controls -->
                <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                   <div class="flex items-center gap-4 w-full md:w-auto">
                      <div class="flex-1">
                        <label class="block text-xs text-brand-mutedLight dark:text-brand-mutedDark mb-1">左边</label>
                        <div class="text-sm font-medium text-brand-textLight dark:text-brand-textDark">上一版本 (v1.0.0)</div>
                        <div class="text-xs text-brand-mutedLight">左侧 v1.0.0 · 右侧 v1.0.1</div>
                      </div>
                      
                      <button class="w-10 h-10 rounded-full border border-brand-borderLight dark:border-brand-borderDark flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800">
                         <span class="material-icons text-brand-mutedLight">swap_horiz</span>
                      </button>

                      <div class="flex-1 text-right md:text-left">
                        <label class="block text-xs text-brand-mutedLight dark:text-brand-mutedDark mb-1">正确/的</label>
                        <div class="text-sm font-medium text-brand-textLight dark:text-brand-textDark">最新版本 (v1.0.1)</div>
                      </div>
                   </div>

                   <div class="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                      <button class="px-4 py-1 rounded-full text-xs font-bold bg-white dark:bg-brand-cardDark shadow-sm text-brand-textLight dark:text-brand-textDark">并排</button>
                      <button class="px-4 py-1 rounded-full text-xs font-medium text-brand-mutedLight hover:text-brand-textLight">排队</button>
                   </div>
                </div>

                <!-- Diff Viewer -->
                <div class="flex border border-brand-borderLight dark:border-brand-borderDark rounded-xl overflow-hidden min-h-[400px]">
                   <!-- Sidebar -->
                   <div class="w-64 bg-gray-50 dark:bg-[#1C1614] border-r border-brand-borderLight dark:border-brand-borderDark p-4 hidden md:block">
                      <div class="bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1 rounded mb-4 inline-block">已更改</div>
                      <div class="text-sm font-medium text-brand-textLight dark:text-brand-textDark pl-2 border-l-2 border-brand-primary">
                        技能.md
                      </div>
                   </div>
                   
                   <!-- Code Area -->
                   <div class="flex-grow bg-white dark:bg-[#1E1E1E] font-mono text-xs md:text-sm overflow-x-auto">
                      <!-- Mock Diff Lines -->
                      <div class="flex">
                         <div class="w-10 text-right pr-2 text-brand-mutedLight select-none bg-gray-50 dark:bg-[#252525] py-1">1</div>
                         <div class="flex-grow py-1 px-4 text-brand-textLight dark:text-brand-textDark">---</div>
                      </div>
                      <div class="flex">
                         <div class="w-10 text-right pr-2 text-brand-mutedLight select-none bg-gray-50 dark:bg-[#252525] py-1">2</div>
                         <div class="flex-grow py-1 px-4 text-brand-textLight dark:text-brand-textDark">名称: caldav-calendar</div>
                      </div>
                      <div class="flex">
                         <div class="w-10 text-right pr-2 text-brand-mutedLight select-none bg-gray-50 dark:bg-[#252525] py-1">3</div>
                         <div class="flex-grow py-1 px-4 text-brand-textLight dark:text-brand-textDark">描述: 同步和查询 CalDAV 日历 (iCloud、Google、Fastmail、Nextcloud 等)</div>
                      </div>
                      <div class="flex">
                         <div class="w-10 text-right pr-2 text-brand-mutedLight select-none bg-gray-50 dark:bg-[#252525] py-1">4</div>
                         <div class="flex-grow py-1 px-4 text-brand-textLight dark:text-brand-textDark">使用 vdirsyncer + khal, 可在 Linux 系统上运行。</div>
                      </div>
                      <div class="flex">
                         <div class="w-10 text-right pr-2 text-brand-mutedLight select-none bg-gray-50 dark:bg-[#252525] py-1">5</div>
                         <div class="flex-grow py-1 px-4 text-brand-textLight dark:text-brand-textDark">...</div>
                      </div>
                      
                      <!-- Removed Block -->
                      <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 my-4">
                         <div class="flex">
                           <div class="w-10 text-right pr-2 text-red-400 select-none py-1">-</div>
                           <div class="flex-grow py-1 px-3 text-red-800 dark:text-red-200">跨平台 CalDAV 同步和 CLI 日历查看器可与 iCloud, Google 日历配合使用</div>
                         </div>
                         <div class="flex">
                           <div class="w-10 text-right pr-2 text-red-400 select-none py-1">-</div>
                           <div class="flex-grow py-1 px-3 text-red-800 dark:text-red-200">Fastmail、Nextcloud 和任何 CalDAV 提供商。</div>
                         </div>
                      </div>

                       <!-- Added Block -->
                      <div class="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 my-4">
                         <div class="flex">
                           <div class="w-10 text-right pr-2 text-green-400 select-none py-1">+</div>
                           <div class="flex-grow py-1 px-3 text-green-800 dark:text-green-200">## 安装</div>
                         </div>
                         <div class="flex">
                           <div class="w-10 text-right pr-2 text-green-400 select-none py-1">+</div>
                           <div class="flex-grow py-1 px-3 text-green-800 dark:text-green-200">**vdirsyncer** 将 CalDAV 日历同步到本地 .ics 文件，**khal** 进行读写操作。</div>
                         </div>
                         <div class="flex">
                           <div class="w-10 text-right pr-2 text-green-400 select-none py-1">+</div>
                           <div class="flex-grow py-1 px-3 text-green-800 dark:text-green-200">先同步</div>
                         </div>
                      </div>

                      <div class="flex">
                         <div class="w-10 text-right pr-2 text-brand-mutedLight select-none bg-gray-50 dark:bg-[#252525] py-1">12</div>
                         <div class="flex-grow py-1 px-4 text-brand-textLight dark:text-brand-textDark">查询前或更改后务必进行同步:</div>
                      </div>
                   </div>
                </div>
              </div>
            }

            <!-- VERSIONS TAB -->
            @if (activeTab() === 'versions') {
              <div class="animate-fadeIn">
                 <h2 class="text-xl font-bold mb-2 text-brand-textLight dark:text-brand-textDark">版本</h2>
                 <p class="text-brand-mutedLight dark:text-brand-mutedDark mb-8 text-sm">下载旧版本或查看更新日志。</p>

                 <div class="space-y-6">
                    @for (v of skill()?.versions; track v.version) {
                       <div class="relative pl-6 border-l border-brand-borderLight dark:border-brand-borderDark pb-6 last:pb-0 last:border-0 group">
                          <!-- Dot -->
                          <div class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand-borderLight dark:bg-brand-borderDark border-2 border-white dark:border-brand-cardDark group-hover:bg-brand-primary transition-colors"></div>
                          
                          <div class="flex justify-between items-start">
                             <div>
                                <div class="text-sm font-medium text-brand-mutedLight dark:text-brand-mutedDark mb-1">
                                  v {{ v.version }} · {{ v.date }}
                                </div>
                                <p class="text-brand-textLight dark:text-brand-textDark">
                                  {{ v.changelog }}
                                </p>
                             </div>
                             
                             <button class="px-5 py-1.5 rounded-full border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-brand-cardDark text-sm font-bold text-brand-textLight dark:text-brand-textDark hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-brand-primary/30 transition-all shadow-sm">
                                拉链
                             </button>
                          </div>
                       </div>
                    }
                 </div>
              </div>
            }

          </div>
        </div>

      } @else {
        <div class="text-center py-20">
          <div class="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-brand-mutedLight">Loading skill details...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `]
})
export class SkillDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  skillService = inject(SkillService);
  sanitizer = inject(DomSanitizer);

  skill = signal<Skill | null>(null);
  activeTab = signal<Tab>('files');
  
  // Custom markdown parser result
  markdownContent = signal<SafeHtml>('');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadSkill(slug);
      }
    });
  }

  loadSkill(slug: string) {
    this.skillService.getSkill(slug).subscribe(data => {
      this.skill.set(data);
      if (data.readme) {
        this.parseMarkdown(data.readme);
      }
    });
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
  }

  // Simple custom markdown parser to avoid external deps and allow full control
  parseMarkdown(md: string) {
    let html = md;

    // Escape HTML characters to prevent injection (basic)
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-brand-textLight dark:text-brand-textDark">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-brand-textLight dark:text-brand-textDark">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-brand-textLight dark:text-brand-textDark">$1</h3>');

    // Bold/Italic
    html = html.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');
    html = html.replace(/\*(.*)\*/gim, '<i>$1</i>');

    // Code Blocks (```language ... ```)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto text-brand-textLight dark:text-brand-textDark shadow-inner"><pre>${code.trim()}</pre></div>`;
    });

    // Inline Code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-brand-primary">$1</code>');

    // Paragraphs (double newline)
    html = html.replace(/\n\n/g, '<p class="mb-4"></p>');

    this.markdownContent.set(this.sanitizer.bypassSecurityTrustHtml(html));
  }
}
