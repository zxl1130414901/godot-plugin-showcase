export const CATEGORY_LIST = [
  'ui',
  'state-logic',
  'network',
  'save-data',
  'ai-gen',
  'editor-tool',
  '3d-shader',
  'audio',
  'visual-script',
  'platform-export',
  'debug-perf',
  'asset-pipeline',
  'uncategorized',
] as const

export type Category = (typeof CATEGORY_LIST)[number]

/** 真实数据里的英文分类 slug 到中文展示名 */
export const CATEGORY_LABELS: Record<Category, string> = {
  ui: 'UI 与界面',
  'state-logic': '状态机与逻辑',
  network: '网络与联机',
  'save-data': '存档与数据',
  'ai-gen': 'AI 与生成',
  'editor-tool': '编辑器效率',
  '3d-shader': '3D 与着色器',
  audio: '音频',
  'visual-script': '可视化脚本',
  'platform-export': '平台与导出',
  'debug-perf': '调试与性能',
  'asset-pipeline': '资源与管线',
  uncategorized: '未分类',
}

export const GODOT_VERSION_LIST = ['4.x', '3.x', 'unknown'] as const

export type GodotVersion = (typeof GODOT_VERSION_LIST)[number]

export const SCORE_KEYS = [
  'coverage',
  'usability',
  'docs',
  'maintenance',
  'performance',
  'stability',
] as const

export type ScoreKey = (typeof SCORE_KEYS)[number]

export const SCORE_LABELS: Record<ScoreKey, string> = {
  coverage: '功能覆盖',
  usability: '易用性',
  docs: '文档',
  maintenance: '维护活跃度',
  performance: '性能',
  stability: '稳定性',
}

/** 六维评分统一为 0–5 分 */
export type Scores = Record<ScoreKey, number>

export type InstallComplexity = 1 | 2 | 3 | 4 | 5

export type IconName =
  | 'window'
  | 'flow'
  | 'globe'
  | 'database'
  | 'spark'
  | 'wrench'
  | 'cube'
  | 'wave'
  | 'nodes'
  | 'rocket'
  | 'search'
  | 'star'
  | 'fork'
  | 'check'
  | 'arrow'
  | 'external'
  | 'plus'
  | 'close'
  | 'compare'
  | 'github'
  | 'alert'
  | 'book'
  | 'layers'
  | 'filter'
  | 'reset'
  | 'chevron'
  | 'gauge'

export interface Repo {
  id: string
  owner: string
  name: string
  url: string
  stars: number
  forks: number
  license: string
  language: string
  createdAt: string
  pushedAt: string
  updatedAt: string
  descriptionEn: string
  descriptionZh: string
  category: Category
  tags: string[]
  godotVersion: GodotVersion
  isGDExtension: boolean
  needCompile: boolean
  installComplexity: InstallComplexity
  scores: Scores
  prosShort: string[]
  consShort: string[]
  hasRow: boolean
  hasDetail: boolean
  sampleStatus: string
  rank: number
  sizeKb: number
  downloadMode: string
}

export interface CaseItem {
  titleZh: string
  descZh: string
}

export interface FeatureCallout {
  name: string
  descZh: string
}

export interface WorkflowStep {
  stepZh: string
}

export interface DetailEvidence {
  claim: string
  source: string
  quote: string
}

export interface CompareTips {
  vs: string[]
  whenZh: string
}

export interface RepoDetail {
  taglineZh: string
  summaryZh: string
  whatItDoes: string
  useCases: CaseItem[]
  whatItMakes: CaseItem[]
  featureCallouts: FeatureCallout[]
  limitsZh: string
  workflowZh: WorkflowStep[]
  pros: string[]
  cons: string[]
  pitfalls: string[]
  bestFor: string
  avoidWhenZh: string
  compareTips: CompareTips
  evidence: DetailEvidence[]
  category: Category
  tags: string[]
  scores: Scores
  godotVersion: GodotVersion
  needCompile: boolean
  installComplexity: InstallComplexity
  depth: string
}

export interface ScenarioMeta {
  category: Category
  label: string
  icon: IconName
  blurb: string
  keywords: string[]
}

export interface Catalog {
  total: number
  withRows: number
  withDetails: number
  categoryCounts: Partial<Record<Category, number>>
  repos: Repo[]
  details: Record<string, RepoDetail>
}
