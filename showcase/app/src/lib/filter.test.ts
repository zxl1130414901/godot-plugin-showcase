import { describe, expect, it } from 'vitest'
import {
  countActiveFilters,
  createDefaultFilters,
  filterRepos,
  passesConstraint,
  toggleConstraint,
} from './filter'
import { DETAILS_FIXTURE, REPOS_FIXTURE } from '../test/fixtures'

const ids = (repos: readonly { id: string }[]): string[] => repos.map((repo) => repo.id)

describe('筛选', () => {
  it('默认筛选保留全部条目', () => {
    expect(filterRepos(REPOS_FIXTURE, createDefaultFilters())).toHaveLength(3)
  })

  it('按类别筛选', () => {
    const result = filterRepos(REPOS_FIXTURE, {
      ...createDefaultFilters(),
      category: 'save-data',
    })
    expect(ids(result)).toEqual(['beta', 'gamma'])
  })

  it('按 Godot 版本与许可证筛选', () => {
    const result = filterRepos(REPOS_FIXTURE, {
      ...createDefaultFilters(),
      godotVersion: '3.x',
      license: 'GPL-3.0',
    })
    expect(ids(result)).toEqual(['gamma'])
  })

  it('按是否需要编译筛选', () => {
    expect(
      ids(filterRepos(REPOS_FIXTURE, { ...createDefaultFilters(), needCompile: 'no' })),
    ).toEqual(['alpha', 'gamma'])
    expect(
      ids(filterRepos(REPOS_FIXTURE, { ...createDefaultFilters(), needCompile: 'yes' })),
    ).toEqual(['beta'])
  })

  it('约束：无需编译与 10 分钟装完', () => {
    const base = createDefaultFilters()
    expect(passesConstraint(REPOS_FIXTURE[0]!, 'noCompile')).toBe(true)
    expect(passesConstraint(REPOS_FIXTURE[1]!, 'noCompile')).toBe(false)
    expect(ids(filterRepos(REPOS_FIXTURE, { ...base, constraints: ['fastInstall'] }))).toEqual([
      'alpha',
      'gamma',
    ])
  })

  it('约束：已有中文档案与 Godot 4', () => {
    const base = createDefaultFilters()
    expect(passesConstraint(REPOS_FIXTURE[0]!, 'hasZh')).toBe(true)
    expect(ids(filterRepos(REPOS_FIXTURE, { ...base, constraints: ['godot4'] }))).toEqual(['alpha'])
  })

  it('关键词与详情一起参与筛选', () => {
    const result = filterRepos(
      REPOS_FIXTURE,
      { ...createDefaultFilters(), query: '重型叙事引擎' },
      {
        ...DETAILS_FIXTURE,
        alpha: { ...DETAILS_FIXTURE.alpha!, summaryZh: '重型叙事引擎，适合长篇视觉小说。' },
      },
    )
    expect(ids(result)).toEqual(['alpha'])
  })

  it('统计与切换约束', () => {
    const filters = {
      ...createDefaultFilters(),
      query: '对话',
      category: 'ui' as const,
      constraints: ['godot4' as const],
    }
    expect(countActiveFilters(filters)).toBe(3)
    const toggled = toggleConstraint(filters, 'godot4')
    expect(toggled.constraints).toEqual([])
    expect(toggleConstraint(toggled, 'noCompile').constraints).toEqual(['noCompile'])
  })
})
