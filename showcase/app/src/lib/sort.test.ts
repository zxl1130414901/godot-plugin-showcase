import { describe, expect, it } from 'vitest'
import { sortRepos } from './sort'
import { makeRepo, REPOS_FIXTURE } from '../test/fixtures'

const ids = (repos: readonly { id: string }[]): string[] => repos.map((repo) => repo.id)

describe('排序', () => {
  it('默认按综合评分降序', () => {
    expect(ids(sortRepos(REPOS_FIXTURE, 'overall'))).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('按星标降序', () => {
    expect(ids(sortRepos(REPOS_FIXTURE, 'stars'))).toEqual(['alpha', 'gamma', 'beta'])
  })

  it('按更新时间降序', () => {
    expect(ids(sortRepos(REPOS_FIXTURE, 'updated'))).toEqual(['gamma', 'alpha', 'beta'])
  })

  it('按安装复杂度升序', () => {
    expect(ids(sortRepos(REPOS_FIXTURE, 'install'))).toEqual(['alpha', 'gamma', 'beta'])
  })

  it('不修改原数组', () => {
    const original = [...REPOS_FIXTURE]
    sortRepos(REPOS_FIXTURE, 'stars')
    expect(REPOS_FIXTURE).toEqual(original)
  })

  it('同值时按 id 稳定兜底', () => {
    const tie = [makeRepo({ id: 'zeta', stars: 100 }), makeRepo({ id: 'eta', stars: 100 })]
    expect(ids(sortRepos(tie, 'stars'))).toEqual(['eta', 'zeta'])
  })
})
