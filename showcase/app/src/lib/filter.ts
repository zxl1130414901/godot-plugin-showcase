import type { Category, GodotVersion, Repo, RepoDetail } from '../types'
import { matchesQuery } from './search'

export type ConstraintId = 'godot4' | 'noCompile' | 'hasZh' | 'fastInstall' | 'popular'

export const CONSTRAINT_DEFS: { id: ConstraintId; label: string; hint: string }[] = [
  { id: 'godot4', label: 'Godot 4 原生支持', hint: 'godotVersion = 4.x' },
  { id: 'noCompile', label: '无需编译', hint: '拉下来就能用' },
  { id: 'hasZh', label: '已有中文档案', hint: '至少完成中文短评与分类' },
  { id: 'fastInstall', label: '10 分钟装完', hint: '安装复杂度 ≤ 3' },
  { id: 'popular', label: '星标 > 500', hint: '有基本社区验证' },
]

export interface FilterOptions {
  query: string
  category: Category | 'all'
  godotVersion: GodotVersion | 'all'
  needCompile: 'all' | 'yes' | 'no'
  license: string | 'all'
  constraints: ConstraintId[]
}

export function createDefaultFilters(): FilterOptions {
  return {
    query: '',
    category: 'all',
    godotVersion: 'all',
    needCompile: 'all',
    license: 'all',
    constraints: [],
  }
}

export function passesConstraint(repo: Repo, id: ConstraintId): boolean {
  switch (id) {
    case 'godot4':
      return repo.godotVersion === '4.x'
    case 'noCompile':
      return !repo.needCompile
    case 'hasZh':
      return repo.hasRow
    case 'fastInstall':
      return repo.installComplexity <= 3
    case 'popular':
      return repo.stars > 500
  }
}

export function filterRepos(
  repos: readonly Repo[],
  filters: FilterOptions,
  details?: Record<string, RepoDetail>,
): Repo[] {
  return repos.filter((repo) => {
    if (filters.category !== 'all' && repo.category !== filters.category) return false
    if (filters.godotVersion !== 'all' && repo.godotVersion !== filters.godotVersion) return false
    if (filters.needCompile !== 'all') {
      const wanted = filters.needCompile === 'yes'
      if (repo.needCompile !== wanted) return false
    }
    if (filters.license !== 'all' && repo.license !== filters.license) return false
    if (!filters.constraints.every((id) => passesConstraint(repo, id))) return false
    return matchesQuery(repo, filters.query, details?.[repo.id])
  })
}

export function countActiveFilters(filters: FilterOptions): number {
  let count = filters.constraints.length
  if (filters.query.trim()) count += 1
  if (filters.category !== 'all') count += 1
  if (filters.godotVersion !== 'all') count += 1
  if (filters.needCompile !== 'all') count += 1
  if (filters.license !== 'all') count += 1
  return count
}

export function toggleConstraint(filters: FilterOptions, id: ConstraintId): FilterOptions {
  const has = filters.constraints.includes(id)
  return {
    ...filters,
    constraints: has
      ? filters.constraints.filter((item) => item !== id)
      : [...filters.constraints, id],
  }
}
