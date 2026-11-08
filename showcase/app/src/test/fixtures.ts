import type { Repo, RepoDetail } from '../types'

const DEFAULT_SCORES = {
  coverage: 4,
  usability: 4,
  docs: 4,
  maintenance: 4,
  performance: 4,
  stability: 4,
}

export function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    id: 'alpha',
    owner: 'demo',
    name: 'alpha',
    url: 'https://github.com/demo/alpha',
    stars: 1200,
    forks: 90,
    license: 'MIT',
    language: 'GDScript',
    createdAt: '2025-01-01',
    pushedAt: '2026-10-01',
    updatedAt: '2026-10-01',
    descriptionEn: 'Dialogue editor and timeline',
    descriptionZh: '对话编辑器与时间轴',
    category: 'ui',
    tags: ['对话', '叙事'],
    godotVersion: '4.x',
    isGDExtension: false,
    needCompile: false,
    installComplexity: 1,
    scores: { ...DEFAULT_SCORES },
    prosShort: ['编辑器可视化'],
    consShort: ['事件图复杂后难维护'],
    hasRow: true,
    hasDetail: true,
    sampleStatus: 'none',
    rank: 1,
    sizeKb: 1200,
    downloadMode: 'zip',
    ...overrides,
  }
}

export function makeDetail(overrides: Partial<RepoDetail> = {}): RepoDetail {
  return {
    taglineZh: '把对话变成可拖拽的时间轴',
    summaryZh: '面向叙事量大的项目，提供可视化时间轴与事件钩子。',
    whatItDoes: '在一个编辑器里编排对白、立绘与演出时间轴，并通过事件钩子接回游戏逻辑。',
    useCases: [{ titleZh: '视觉小说', descZh: '大量分支对白与演出调度' }],
    whatItMakes: [{ titleZh: '时间轴资源', descZh: '可复用的对白与演出数据' }],
    featureCallouts: [{ name: '时间轴', descZh: '在一个界面里编排对白与演出' }],
    limitsZh: '不适合纯数据驱动的对话，复杂事件图需要拆分。',
    workflowZh: [{ stepZh: '复制 addons 目录并在项目设置里启用插件。' }],
    pros: ['编辑器可视化'],
    cons: ['事件图复杂后难维护'],
    pitfalls: ['事件图过大时需要拆分'],
    bestFor: '叙事量大的视觉小说',
    avoidWhenZh: '纯运行时生成对白、不需要人工编排时不必引入。',
    compareTips: { vs: ['beta'], whenZh: '偏演出选 alpha，偏脚本自由度选 beta。' },
    evidence: [{ claim: '支持可视化时间轴', source: 'README.md', quote: 'Timeline editor' }],
    category: 'ui',
    tags: ['对话', '叙事'],
    scores: { ...DEFAULT_SCORES },
    godotVersion: '4.x',
    needCompile: false,
    installComplexity: 1,
    depth: 'standard',
    ...overrides,
  }
}

export const REPOS_FIXTURE: Repo[] = [
  makeRepo(),
  makeRepo({
    id: 'beta',
    name: 'beta',
    stars: 400,
    forks: 40,
    license: 'MIT',
    category: 'save-data',
    tags: ['存档'],
    godotVersion: '3.x',
    needCompile: true,
    installComplexity: 4,
    pushedAt: '2026-09-01',
    scores: { ...DEFAULT_SCORES },
    hasDetail: false,
  }),
  makeRepo({
    id: 'gamma',
    name: 'gamma',
    stars: 600,
    forks: 60,
    license: 'GPL-3.0',
    category: 'save-data',
    tags: ['数据'],
    godotVersion: '3.x',
    needCompile: false,
    installComplexity: 2,
    pushedAt: '2026-11-01',
    scores: {
      coverage: 3,
      usability: 3,
      docs: 3,
      maintenance: 3,
      performance: 4,
      stability: 3,
    },
    hasDetail: false,
  }),
]

export const DETAILS_FIXTURE: Record<string, RepoDetail> = {
  alpha: makeDetail(),
  beta: makeDetail({
    taglineZh: '存档版本与迁移',
    summaryZh: '为存档提供版本号、迁移与校验。',
    useCases: [{ titleZh: '长线运营', descZh: '存档需要持续迁移' }],
    compareTips: { vs: ['alpha'], whenZh: '需要迁移链选 beta。' },
  }),
}
