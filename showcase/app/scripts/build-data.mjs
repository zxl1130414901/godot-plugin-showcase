// 构建期数据合并：manifest.json（300 条元数据）+ rows/*.json（中文短档案）+ details/*.json（详情）
// 产出 src/data/catalog.json，供前端直接消费。缺失行/档案不会导致失败，会在条目上标记。
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const projectRoot = resolve(appRoot, '..', '..')
const manifestPath = join(projectRoot, 'manifest.json')
const rowsDir = join(appRoot, '..', 'data', 'rows')
const detailsDir = join(appRoot, '..', 'data', 'details')
const outPath = join(appRoot, 'src', 'data', 'catalog.json')

const CATEGORIES = new Set([
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
])
const GODOT_VERSIONS = new Set(['4.x', '3.x', 'unknown'])
const SCORE_KEYS = ['coverage', 'usability', 'docs', 'maintenance', 'performance', 'stability']

const warnings = []

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    warnings.push(`${label} 读取失败：${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

function collect(folder, prefix) {
  if (!existsSync(folder)) {
    warnings.push(`目录不存在：${folder}`)
    return new Map()
  }
  const out = new Map()
  for (const name of readdirSync(folder)) {
    if (!name.endsWith('.json')) continue
    const id = name.slice(0, -'.json'.length).replace(prefix, '')
    const data = readJson(join(folder, name), name)
    if (data && typeof data === 'object') out.set(id, data)
  }
  return out
}

const normalizeDate = (value) => (typeof value === 'string' ? value.slice(0, 10) : '')

const normalizeScores = (scores) => {
  const result = {}
  for (const key of SCORE_KEYS) {
    const raw = scores && typeof scores === 'object' ? scores[key] : undefined
    const value = typeof raw === 'number' && Number.isFinite(raw) ? Math.min(5, Math.max(0, raw)) : 0
    result[key] = value
  }
  return result
}

const normalizeCategory = (value) => (typeof value === 'string' && CATEGORIES.has(value) ? value : 'uncategorized')

const normalizeVersion = (value) => (GODOT_VERSIONS.has(value) ? value : 'unknown')

const normalizeInstall = (value, needCompile) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(5, Math.max(1, Math.round(value)))
  }
  return needCompile ? 4 : 2
}

const normalizeList = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()) : []

const normalizeStringList = (value) => {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : []
  return normalizeList(value)
}

const normalizeCaseList = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (typeof item === 'string') return { titleZh: item, descZh: '' }
          if (item && typeof item === 'object') {
            return {
              titleZh: String(item.titleZh ?? item.title ?? ''),
              descZh: String(item.descZh ?? item.desc ?? ''),
            }
          }
          return null
        })
        .filter((item) => item && item.titleZh)
    : []

const normalizeDetail = (raw) => {
  if (!raw) return null
  const tipsRaw = raw.compareTips && typeof raw.compareTips === 'object' ? raw.compareTips : {}
  return {
    taglineZh: String(raw.taglineZh ?? ''),
    summaryZh: String(raw.summaryZh ?? ''),
    whatItDoes: typeof raw.whatItDoes === 'string' ? raw.whatItDoes : '',
    useCases: normalizeCaseList(raw.useCases),
    whatItMakes: normalizeCaseList(raw.whatItMakes),
    featureCallouts: Array.isArray(raw.featureCallouts)
      ? raw.featureCallouts
          .filter((item) => item && typeof item === 'object')
          .map((item) => ({ name: String(item.name ?? ''), descZh: String(item.descZh ?? '') }))
      : [],
    limitsZh: typeof raw.limitsZh === 'string' ? raw.limitsZh : '',
    workflowZh: Array.isArray(raw.workflowZh)
      ? raw.workflowZh
          .map((item) => {
            if (typeof item === 'string') return { stepZh: item }
            if (item && typeof item === 'object') return { stepZh: String(item.stepZh ?? item.step ?? '') }
            return null
          })
          .filter((item) => item && item.stepZh)
      : [],
    pros: normalizeList(raw.pros),
    cons: normalizeList(raw.cons),
    pitfalls: normalizeList(raw.pitfalls),
    bestFor: String(raw.bestFor ?? ''),
    avoidWhenZh: String(raw.avoidWhenZh ?? ''),
    compareTips: {
      vs: normalizeStringList(tipsRaw.vs),
      whenZh: String(tipsRaw.whenZh ?? ''),
    },
    evidence: Array.isArray(raw.evidence)
      ? raw.evidence
          .filter((item) => item && typeof item === 'object')
          .map((item) => ({
            claim: String(item.claim ?? ''),
            source: String(item.source ?? ''),
            quote: String(item.quote ?? ''),
          }))
      : [],
    category: normalizeCategory(raw.category),
    tags: normalizeList(raw.tags),
    scores: normalizeScores(raw.scores),
    godotVersion: normalizeVersion(raw.godotVersion),
    needCompile: Boolean(raw.needCompile),
    installComplexity: normalizeInstall(raw.installComplexity, Boolean(raw.needCompile)),
    depth: String(raw.depth ?? 'standard'),
  }
}

if (!existsSync(manifestPath)) {
  console.error(`[data] 找不到 manifest.json：${manifestPath}`)
  process.exit(1)
}

const manifest = readJson(manifestPath, 'manifest.json')
if (!Array.isArray(manifest)) {
  console.error('[data] manifest.json 顶层必须是数组')
  process.exit(1)
}

const rows = collect(rowsDir, 'row_')
const details = collect(detailsDir, '')

const manifestIds = new Set(manifest.map((item) => String(item.id)))
for (const id of rows.keys()) if (!manifestIds.has(id)) warnings.push(`row 不在 manifest：${id}`)
for (const id of details.keys()) if (!manifestIds.has(id)) warnings.push(`detail 不在 manifest：${id}`)

const repos = manifest
  .map((item, index) => {
    const id = String(item.id ?? '')
    const row = rows.get(id)
    const detail = normalizeDetail(details.get(id))
    const needCompile =
      typeof row?.needCompile === 'boolean'
        ? row.needCompile
        : detail
          ? detail.needCompile
          : item.needsBuild !== '无'
    const scores = row?.scores ?? detail?.scores ?? null
    const category = normalizeCategory(row?.category ?? detail?.category)
    const tags = normalizeList(row?.tags ?? detail?.tags)
    return {
      id,
      owner: String(item.owner ?? ''),
      name: String(item.repo ?? item.name ?? ''),
      url: String(item.url ?? ''),
      stars: Number(item.stars ?? 0),
      forks: Number(item.forks ?? 0),
      license: typeof item.license === 'string' && item.license ? item.license : '未声明',
      language: typeof item.language === 'string' && item.language ? item.language : '未知',
      createdAt: normalizeDate(item.created_at),
      pushedAt: normalizeDate(item.pushed_at),
      updatedAt: normalizeDate(item.updated_at),
      descriptionEn: String(item.description ?? ''),
      descriptionZh: String(row?.descriptionZh ?? detail?.taglineZh ?? ''),
      category,
      tags: tags.length > 0 ? tags : normalizeList(item.topics),
      godotVersion: normalizeVersion(
        row?.godotVersion ?? detail?.godotVersion ?? item.godotVersion,
      ),
      isGDExtension: Boolean(item.isGDExtension),
      needCompile,
      installComplexity: normalizeInstall(row?.installComplexity ?? detail?.installComplexity, needCompile),
      scores: normalizeScores(scores),
      prosShort: normalizeList(row?.prosShort ?? detail?.pros),
      consShort: normalizeList(row?.consShort ?? detail?.cons),
      hasRow: Boolean(row),
      hasDetail: Boolean(detail),
      sampleStatus: String(row?.sampleStatus ?? 'none'),
      rank: Number.isFinite(item.rank) ? item.rank : index + 1,
      sizeKb: Number.isFinite(item.size_kb) ? item.size_kb : 0,
      downloadMode: String(item.downloadMode ?? ''),
    }
  })
  .filter((repo) => repo.id)

const detailMap = {}
for (const [id, detail] of details.entries()) {
  const normalized = normalizeDetail(detail)
  if (normalized) detailMap[id] = normalized
}

const categoryCounts = {}
for (const repo of repos) categoryCounts[repo.category] = (categoryCounts[repo.category] ?? 0) + 1

const catalog = {
  total: repos.length,
  withRows: repos.filter((repo) => repo.hasRow).length,
  withDetails: repos.filter((repo) => repo.hasDetail).length,
  categoryCounts,
  repos,
  details: detailMap,
}

writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')

console.log(
  `[data] 合并完成：manifest ${repos.length} 条 · 中文短档案 ${catalog.withRows} · 详情 ${catalog.withDetails} · 未分类 ${categoryCounts.uncategorized ?? 0}`,
)
const categoryLine = Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([key, value]) => `${key}:${value}`)
  .join(' ')
console.log(`[data] 分类分布：${categoryLine}`)
if (warnings.length > 0) {
  console.warn(`[data] 警告 ${warnings.length} 条（不阻断构建）：`)
  for (const warning of warnings.slice(0, 20)) console.warn(`  - ${warning}`)
  if (warnings.length > 20) console.warn(`  - 其余 ${warnings.length - 20} 条省略`)
}
console.log(`[data] 输出：${outPath}`)
