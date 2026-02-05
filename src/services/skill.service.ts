
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  downloads: number;
  stars: number;
  tags: string[];
  updatedAt: string;
  isHighlighted: boolean;
  trending?: number;
  // Detail specific fields (optional in list view)
  readme?: string;
  versions?: SkillVersion[];
  author?: string;
}

export interface SkillVersion {
  version: string;
  date: string;
  changelog: string;
}

// Rich mock data
const MOCK_SKILLS: Skill[] = [
  {
    id: 'caldav',
    slug: 'caldav-calendar',
    name: '卡尔达夫日历',
    description: '使用 vdirsyncer + khal 同步和查询 CalDAV 日历 (iCloud、Google、Fastmail、Nextcloud 等)。可在 Linux 系统上运行。',
    version: '1.0.1',
    downloads: 3587,
    stars: 42,
    trending: 18,
    tags: ['日历', '同步', 'CLI'],
    updatedAt: '2023-11-05',
    isHighlighted: true,
    author: 'Asleep123',
    readme: `
# CalDAV 日历 (vdirsyncer + khal)

**vdirsyncer** 将 CalDAV 日历同步到本地 \`.ics\` 文件，khal 读取和写入这些文件。

先同步
查询前或更改后务必进行同步：

\`\`\`bash
vdirsyncer sync
\`\`\`

查看活动

\`\`\`bash
khal list             # Today
khal list today 7d    # Next 7 days
khal list tomorrow    # Tomorrow
khal list 2026-01-15 2026-01-20 # Date range
khal list -a Work today # Specific calendar
\`\`\`

搜索

\`\`\`bash
khal search "meeting"
khal search "dentist" --format "{start-date} {title}"
\`\`\`

创建事件

\`\`\`bash
khal new 2026-01-15 10:00 11:00 "Meeting title"
khal new 2026-01-15 "All day event"
khal new tomorrow 14:00 15:30 "Call" -a Work
khal new 2026-01-15 10:00 11:00 "With notes" :: Description goes here
\`\`\`

创建完成后，同步以推送更改：

\`\`\`bash
vdirsyncer sync
\`\`\`

初始设置

1. 配置 vdirsyncer (\`~/.config/vdirsyncer/config\`)
ICloud示例:

\`\`\`ini
[general]
status_path = "~/.local/share/vdirsyncer/status/"

[pair icloud_calendar]
a = "icloud_remote"
b = "icloud_local"
collections = ["from a", "from b"]
conflict_resolution = "a wins"
\`\`\`
`,
    versions: [
      { version: '1.0.1', date: '2026/1/6', changelog: '增加了关于如何更新事件的更多说明。' },
      { version: '1.0.0', date: '2026/1/5', changelog: '初始发布。基本同步功能。' }
    ]
  },
  {
    id: '1',
    slug: 'remarkable-cloud',
    name: 'Remarkable 云端',
    description: '通过云 API (rmapi) 从 reMarkable 平板电脑获取笔记、草图和绘图。利用 AI 图像生成优化工作流程。',
    version: '1.0.0',
    downloads: 1250,
    stars: 124,
    trending: 5,
    tags: ['云端', '笔记', '生产力'],
    updatedAt: '2023-11-01',
    isHighlighted: false
  },
  {
    id: '2',
    slug: 'groupon-skill',
    name: 'Groupon 优惠',
    description: '适用于 Agent 的技能包，用于查找 Groupon 上的最佳购物优惠、优惠券和折扣。',
    version: '2.1.0',
    downloads: 850,
    stars: 45,
    trending: 12,
    tags: ['购物', '优惠', '金融'],
    updatedAt: '2023-11-02',
    isHighlighted: false
  },
  {
    id: '3',
    slug: 'browser-automation',
    name: '浏览器自动化',
    description: '基于 Rust 的快速无头浏览器自动化 CLI，带有 Node.js 回退功能，使 AI 代理能够通过结构化命令控制浏览器。',
    version: '3.1.0',
    downloads: 5420,
    stars: 890,
    trending: 1,
    tags: ['自动化', '浏览器', '开发工具'],
    updatedAt: '2023-10-28',
    isHighlighted: true
  },
  {
    id: '4',
    slug: 'google-play',
    name: 'Google Play 管理器',
    description: '通过托管 OAuth 集成 Google Play Developer API。管理应用、订阅、应用内购买和评论。',
    version: '1.0.0',
    downloads: 163,
    stars: 12,
    trending: 0,
    tags: ['google', '安卓', 'api'],
    updatedAt: '2023-11-01',
    isHighlighted: false
  },
  {
    id: '5',
    slug: 'google-slides',
    name: 'Google 幻灯片 AI',
    description: '使用 GenAI 自动创建演示文稿、添加幻灯片、插入内容和管理幻灯片组。',
    version: '1.0.1',
    downloads: 3200,
    stars: 210,
    trending: 3,
    tags: ['google', '幻灯片', '办公'],
    updatedAt: '2023-10-30',
    isHighlighted: false
  },
  {
    id: '6',
    slug: 'klaviyo-connect',
    name: 'Klaviyo 连接',
    description: '带有托管 OAuth 的 Klaviyo API 集成。访问用户配置文件、列表、细分、活动、流程、事件和指标。',
    version: '1.2.0',
    downloads: 89,
    stars: 5,
    trending: 0,
    tags: ['营销', '邮件', 'crm'],
    updatedAt: '2023-10-29',
    isHighlighted: false
  },
  {
    id: '7',
    slug: 'mailchimp-sync',
    name: 'Mailchimp 同步',
    description: '通过托管 OAuth 集成 Mailchimp Marketing API。访问受众、活动、模板、自动化和报告。',
    version: '1.1.0',
    downloads: 168,
    stars: 18,
    trending: 0,
    tags: ['营销', '邮件'],
    updatedAt: '2023-10-29',
    isHighlighted: false
  },
  {
    id: '8',
    slug: 'outlook-email',
    name: 'Outlook 代理',
    description: '通过 Microsoft Graph API 使用 Microsoft Outlook/Live.com 电子邮件客户端。列出、搜索、阅读、发送和组织电子邮件。',
    version: '1.0.2',
    downloads: 410,
    stars: 32,
    trending: 0,
    tags: ['邮件', '微软', '办公'],
    updatedAt: '2023-11-01',
    isHighlighted: false
  },
  {
    id: '9',
    slug: 'walkie-talkie',
    name: '安全对讲机',
    description: '自主代理技能。安全私密 P2P 消息传递（侧信道），稀疏状态/数据 + 合约。',
    version: '0.9.0',
    downloads: 12,
    stars: 2,
    trending: 0,
    tags: ['p2p', '消息', '安全'],
    updatedAt: '2023-10-28',
    isHighlighted: false
  },
  {
    id: '10',
    slug: 'smart-agent-ai',
    name: '智能代理核心',
    description: 'Agent AI 的黄金标准。唯一能在您睡觉时自我改进的框架。具有 17 个安全门。',
    version: '2.0.0',
    downloads: 15043,
    stars: 2400,
    trending: 1,
    tags: ['ai', '框架', '核心'],
    updatedAt: '2023-11-01',
    isHighlighted: true
  },
  {
    id: '11',
    slug: 'security-audit',
    name: '安全审计工具',
    description: 'Clawdbot 部署的全面安全审计。扫描暴露的凭据、开放端口、弱配置。',
    version: '1.0.5',
    downloads: 1700,
    stars: 156,
    trending: 8,
    tags: ['安全', '审计', '运维'],
    updatedAt: '2023-10-30',
    isHighlighted: true
  },
  {
    id: '12',
    slug: 'active-agent',
    name: '主动代理专业版',
    description: '将 AI 代理从任务执行者转变为预测需求的积极合作伙伴。包括预压缩刷新。',
    version: '1.2.4',
    downloads: 154,
    stars: 23,
    trending: 0,
    tags: ['ai', '代理'],
    updatedAt: '2023-10-31',
    isHighlighted: false
  },
  {
    id: '13',
    slug: 'daily-brief',
    name: '每日简报',
    description: '生成简明的每日简报，包括天气、日历、提醒、生日和重要邮件。',
    version: '1.0.0',
    downloads: 730,
    stars: 88,
    trending: 1,
    tags: ['生产力', '新闻', '助手'],
    updatedAt: '2023-11-01',
    isHighlighted: false
  },
  {
    id: '14',
    slug: 'meta-search',
    name: '元搜索引擎',
    description: '集成 7 个主要搜索引擎（Google、Bing、DDG 等）进行网络搜索。聚合结果以提高准确性。',
    version: '1.3.0',
    downloads: 8900,
    stars: 670,
    trending: 1,
    tags: ['搜索', '网络', '数据'],
    updatedAt: '2023-10-28',
    isHighlighted: true
  },
  {
    id: '15',
    slug: 'aave-defi',
    name: 'Aave DeFi 连接器',
    description: 'Aave V3 借贷协议接口。用户可以通过 Agent 命令存入 WETH 作为抵押品并借入资产。',
    version: '0.0.1',
    downloads: 260,
    stars: 45,
    trending: 1,
    tags: ['加密货币', '金融', 'web3'],
    updatedAt: '2023-11-01',
    isHighlighted: false
  },
  {
    id: '16',
    slug: 'cli-search',
    name: 'CLI 隐私搜索',
    description: '使用 ddgr（终端中的 DuckDuckGo）直接从命令行界面执行注重隐私的网络搜索。',
    version: '1.0.0',
    downloads: 600,
    stars: 90,
    trending: 0,
    tags: ['搜索', '隐私', 'cli'],
    updatedAt: '2023-10-28',
    isHighlighted: false
  },
  {
    id: '17',
    slug: 'discord-bot-pro',
    name: 'Discord 社区机器人',
    description: '高级 Discord 机器人，支持自动审核、欢迎消息、角色管理和音乐播放功能。',
    version: '2.5.0',
    downloads: 3200,
    stars: 450,
    trending: 4,
    tags: ['discord', '机器人', '社区'],
    updatedAt: '2023-11-03',
    isHighlighted: true
  },
  {
    id: '18',
    slug: 'slack-assistant',
    name: 'Slack 办公助手',
    description: '集成 Slack Web API，支持自动回复、会议安排、投票创建和日常任务提醒。',
    version: '1.1.2',
    downloads: 1800,
    stars: 120,
    trending: 2,
    tags: ['slack', '办公', '助手'],
    updatedAt: '2023-11-03',
    isHighlighted: false
  },
  {
    id: '19',
    slug: 'notion-sync',
    name: 'Notion 双向同步',
    description: '实现 Notion 数据库与其他工具（如 Jira, Trello）之间的双向即时数据同步。',
    version: '1.4.0',
    downloads: 2500,
    stars: 340,
    trending: 7,
    tags: ['notion', '同步', '生产力'],
    updatedAt: '2023-11-04',
    isHighlighted: true
  },
  {
    id: '20',
    slug: 'weather-forecaster',
    name: '全球天气预报',
    description: '提供全球任意地点的实时天气、未来 7 天预报和恶劣天气预警。数据源自多气象台聚合。',
    version: '1.0.3',
    downloads: 980,
    stars: 65,
    trending: 1,
    tags: ['天气', 'API', '工具'],
    updatedAt: '2023-11-04',
    isHighlighted: false
  }
];

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // State
  skills = signal<Skill[]>([]);

  // Computed
  highlightedSkills = computed(() => this.skills().filter(s => s.isHighlighted));
  
  constructor() {
    // Load initial data
    this.loadSkills();
  }

  // Fetch skills from backend (supports search)
  loadSkills(query: string = '') {
    this.http.get<Skill[]>(`${this.apiUrl}/skills`, { params: { q: query } })
      .pipe(
        // Fallback to mock data if backend is unreachable
        catchError(err => {
          const q = query.toLowerCase();
          const filtered = MOCK_SKILLS.filter(s => 
            s.name.toLowerCase().includes(q) || 
            s.slug.toLowerCase().includes(q) || 
            s.description.toLowerCase().includes(q) ||
            (s.tags && s.tags.some(tag => tag.toLowerCase().includes(q)))
          );
          return of(filtered);
        })
      )
      .subscribe({
        next: (data) => this.skills.set(data),
        error: (err) => console.error('Failed to load skills', err)
      });
  }

  // Get single skill details
  getSkill(slug: string) {
    return this.http.get<Skill>(`${this.apiUrl}/skills/${slug}`)
      .pipe(
        catchError(err => {
          // Find locally
          const found = MOCK_SKILLS.find(s => s.slug === slug);
          if (found) return of(found);
          // Default to first one if not found for demo purposes
          return of(MOCK_SKILLS[0]);
        })
      );
  }

  addSkill(skill: Omit<Skill, 'id' | 'downloads' | 'stars' | 'updatedAt' | 'trending' | 'isHighlighted'>) {
    return this.http.post<Skill>(`${this.apiUrl}/skills`, skill).pipe(
      // Fallback: simulate successful add locally
      catchError(err => {
        console.warn('Backend unavailable, simulating skill add locally.');
        const newSkill: Skill = {
          ...skill,
          id: Math.random().toString(36).substr(2, 9),
          downloads: 0,
          stars: 0,
          trending: 0,
          updatedAt: new Date().toISOString().split('T')[0],
          isHighlighted: false
        };
        // Update local state
        this.skills.update(current => [newSkill, ...current]);
        return of(newSkill);
      })
    );
  }
}
