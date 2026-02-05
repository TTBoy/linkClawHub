
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- 1. 自动创建数据 (内存数据库) ---
// 模拟丰富的技能库数据
const initialSkills = [
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

// 加载到状态中
let skills = [...initialSkills];

// --- 2. API 路由 ---

// 登录端点
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`登录尝试: ${username}`);
  
  if (username === 'admin' && password === '123456') {
    res.json({
      user: {
        username: 'admin',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        token: 'fake-jwt-token-12345'
      }
    });
  } else {
    res.status(401).json({ message: '用户名或密码无效 (尝试 admin/123456)' });
  }
});

// 列表/搜索技能端点
app.get('/api/skills', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  
  let results = skills;
  if (query) {
    results = skills.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.slug.toLowerCase().includes(query) || 
      s.description.toLowerCase().includes(query) ||
      (s.tags && s.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  // 模拟网络延迟以增加真实感
  setTimeout(() => {
    res.json(results);
  }, 200);
});

// 上传/创建技能端点
app.post('/api/skills', (req, res) => {
  console.log('正在接收新技能上传...', req.body);
  const newSkill = {
    ...req.body,
    id: Math.random().toString(36).substr(2, 9),
    downloads: 0,
    stars: 0,
    trending: 0,
    updatedAt: new Date().toISOString().split('T')[0],
    isHighlighted: false
  };
  
  skills.unshift(newSkill); // 添加到列表顶部
  res.status(201).json(newSkill);
});

// --- 3. 启动服务器 ---
app.listen(PORT, () => {
  console.log('-----------------------------------------------------');
  console.log(`ClawHub 后端服务器运行在端口 ${PORT}`);
  console.log(`自动加载了 ${skills.length} 个 AgentSkills。`);
  console.log('-----------------------------------------------------');
  console.log('可用端点:');
  console.log(`   POST http://localhost:${PORT}/api/login`);
  console.log(`   GET  http://localhost:${PORT}/api/skills`);
  console.log(`   POST http://localhost:${PORT}/api/skills`);
  console.log('-----------------------------------------------------');
});
