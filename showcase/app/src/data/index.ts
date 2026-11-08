import catalogJson from './catalog.json'
import type { Catalog, Category, Repo, RepoDetail } from '../types'

const catalog = catalogJson as unknown as Catalog

export const CATALOG = catalog
export const REPOS: Repo[] = catalog.repos
export const DETAILS: Record<string, RepoDetail> = catalog.details
export const TOTAL = catalog.total
export const WITH_ROWS = catalog.withRows
export const WITH_DETAILS = catalog.withDetails

export function getRepo(id: string): Repo | undefined {
  return REPOS.find((repo) => repo.id === id)
}

export function getDetail(id: string): RepoDetail | undefined {
  return DETAILS[id]
}

export function getRepoName(id: string): string {
  return getRepo(id)?.name ?? id
}

/** 真实分类分布：首页场景卡计数以此为准，避免写死 */
export function countByCategory(): Map<Category, number> {
  const counts = new Map<Category, number>()
  for (const repo of REPOS) {
    counts.set(repo.category, (counts.get(repo.category) ?? 0) + 1)
  }
  return counts
}
