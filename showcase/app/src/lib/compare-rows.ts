import { CATEGORY_LABELS, SCORE_KEYS, SCORE_LABELS, type Repo, type RepoDetail } from '../types'
import { aggregateScore } from './scores'
import { formatCompact, formatDate, installLabel, scoreText } from './format'

export type CompareGroup = 'fact' | 'score' | 'judgement'
export type CompareKind = 'text' | 'number' | 'score'

export interface CompareRow {
  key: string
  label: string
  group: CompareGroup
  kind: CompareKind
  values: string[]
  differ: boolean
  bestIndex: number | null
}

type Cell = { text: string; raw: number | null }

const lines = (items: readonly string[]): string => (items.length > 0 ? items.join('\n') : '—')

const textCell = (text: string): Cell => ({ text, raw: null })
const numberCell = (raw: number, text: string): Cell => ({ text, raw })

function buildRow(
  key: string,
  label: string,
  group: CompareGroup,
  kind: CompareKind,
  cells: Cell[],
  higherIsBetter = true,
): CompareRow {
  const values = cells.map((cell) => cell.text)
  const differ = new Set(values.map((value) => value.trim())).size > 1
  let bestIndex: number | null = null

  if (kind !== 'text' && differ) {
    const raws = cells.map((cell) => cell.raw)
    let best: number | null = null
    for (const raw of raws) {
      if (raw === null || raw === 0) continue
      if (best === null || (higherIsBetter ? raw > best : raw < best)) best = raw
    }
    if (best !== null && raws.filter((raw) => raw === best).length === 1) {
      bestIndex = raws.findIndex((raw) => raw === best)
    }
  }

  return { key, label, group, kind, values, differ, bestIndex }
}

const caseLines = (items: RepoDetail['useCases']): string =>
  lines(items.map((item) => (item.descZh ? `${item.titleZh}：${item.descZh}` : item.titleZh)))

/** 事实 10 行 + 评分 7 行（综合 + 六维）+ 判断 8 行 */
export function buildCompareRows(
  repos: readonly Repo[],
  details: Record<string, RepoDetail>,
  resolveName: (id: string) => string = (id) => id,
): CompareRow[] {
  const detailOf = (repo: Repo): RepoDetail | undefined => details[repo.id]

  const rows: CompareRow[] = [
    buildRow(
      'overall',
      '综合评分',
      'score',
      'score',
      repos.map((repo) => {
        const score = aggregateScore(repo.scores)
        return numberCell(score, scoreText(score))
      }),
    ),
    buildRow(
      'category',
      '类别',
      'fact',
      'text',
      repos.map((repo) => textCell(CATEGORY_LABELS[repo.category])),
    ),
    buildRow(
      'godot',
      'Godot 版本',
      'fact',
      'text',
      repos.map((repo) => textCell(repo.godotVersion)),
    ),
    buildRow(
      'stars',
      '星标',
      'fact',
      'number',
      repos.map((repo) => numberCell(repo.stars, `${formatCompact(repo.stars)}（${repo.stars}）`)),
    ),
    buildRow(
      'forks',
      'Fork',
      'fact',
      'number',
      repos.map((repo) => numberCell(repo.forks, String(repo.forks))),
    ),
    buildRow(
      'updated',
      '最近更新',
      'fact',
      'text',
      repos.map((repo) => textCell(formatDate(repo.pushedAt))),
    ),
    buildRow(
      'install',
      '安装复杂度',
      'fact',
      'number',
      repos.map((repo) =>
        numberCell(
          repo.installComplexity,
          `${repo.installComplexity} / 5 · ${installLabel(repo.installComplexity)}`,
        ),
      ),
      false,
    ),
    buildRow(
      'compile',
      '是否需要编译',
      'fact',
      'text',
      repos.map((repo) => textCell(repo.needCompile ? '需要编译' : '无需编译')),
    ),
    buildRow(
      'license',
      '许可证',
      'fact',
      'text',
      repos.map((repo) => textCell(repo.license)),
    ),
    buildRow(
      'language',
      '语言',
      'fact',
      'text',
      repos.map((repo) => textCell(repo.language)),
    ),
    buildRow(
      'detail',
      '中文档案',
      'fact',
      'text',
      repos.map((repo) => textCell(repo.hasDetail ? '完整档案' : '撰写中')),
    ),
  ]

  for (const key of SCORE_KEYS) {
    rows.push(
      buildRow(
        `score-${key}`,
        SCORE_LABELS[key],
        'score',
        'score',
        repos.map((repo) =>
          numberCell(repo.scores[key], repo.scores[key] > 0 ? scoreText(repo.scores[key]) : '—'),
        ),
      ),
    )
  }

  rows.push(
    buildRow(
      'tagline',
      '一句话定位',
      'judgement',
      'text',
      repos.map((repo) => textCell(detailOf(repo)?.taglineZh || repo.descriptionZh || '—')),
    ),
    buildRow(
      'useCases',
      '适用场景',
      'judgement',
      'text',
      repos.map((repo) => textCell(caseLines(detailOf(repo)?.useCases ?? []))),
    ),
    buildRow(
      'whatItDoes',
      '典型用法',
      'judgement',
      'text',
      repos.map((repo) => textCell(detailOf(repo)?.whatItDoes || repo.descriptionZh || '—')),
    ),
    buildRow(
      'pros',
      '优点',
      'judgement',
      'text',
      repos.map((repo) => textCell(lines(detailOf(repo)?.pros ?? repo.prosShort))),
    ),
    buildRow(
      'cons',
      '缺点',
      'judgement',
      'text',
      repos.map((repo) => textCell(lines(detailOf(repo)?.cons ?? repo.consShort))),
    ),
    buildRow(
      'pitfalls',
      '常见坑',
      'judgement',
      'text',
      repos.map((repo) => textCell(lines(detailOf(repo)?.pitfalls ?? []))),
    ),
    buildRow(
      'compareTips',
      '与谁比、怎么选',
      'judgement',
      'text',
      repos.map((repo) => {
        const tips = detailOf(repo)?.compareTips
        const vsText = tips && tips.vs.length > 0 ? `对比：${tips.vs.map(resolveName).join('、')}` : ''
        return textCell([tips?.whenZh ?? '', vsText].filter(Boolean).join('\n') || '—')
      }),
    ),
    buildRow(
      'avoidWhen',
      '什么情况下别选',
      'judgement',
      'text',
      repos.map((repo) => textCell(detailOf(repo)?.avoidWhenZh || '—')),
    ),
  )

  return rows
}
