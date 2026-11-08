import type { Repo } from '../types'
import { aggregateScore } from './scores'

export type SortKey = 'overall' | 'stars' | 'updated' | 'install'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'overall', label: '综合评分' },
  { key: 'stars', label: '星标数' },
  { key: 'updated', label: '最近更新' },
  { key: 'install', label: '安装复杂度' },
]

export const DEFAULT_SORT: SortKey = 'overall'

const byId = (a: Repo, b: Repo): number => a.id.localeCompare(b.id)

/** 排序返回新数组，不改入参；同值时用 id 兜底，保证结果稳定 */
export function sortRepos(repos: readonly Repo[], key: SortKey): Repo[] {
  const copy = [...repos]
  copy.sort((a, b) => {
    switch (key) {
      case 'stars':
        return b.stars - a.stars || byId(a, b)
      case 'updated':
        return b.pushedAt.localeCompare(a.pushedAt) || byId(a, b)
      case 'install':
        return a.installComplexity - b.installComplexity || byId(a, b)
      case 'overall':
      default:
        return aggregateScore(b.scores) - aggregateScore(a.scores) || byId(a, b)
    }
  })
  return copy
}
