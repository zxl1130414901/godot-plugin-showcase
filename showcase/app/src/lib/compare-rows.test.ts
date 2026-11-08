import { describe, expect, it } from 'vitest'
import { buildCompareRows } from './compare-rows'
import { DETAILS_FIXTURE, makeRepo, REPOS_FIXTURE } from '../test/fixtures'

const rows = buildCompareRows(REPOS_FIXTURE, DETAILS_FIXTURE)
const find = (key: string) => rows.find((row) => row.key === key)

describe('对比行', () => {
  it('共 25 行', () => {
    expect(rows).toHaveLength(25)
  })

  it('分组数量：事实 10 / 评分 7 / 判断 8', () => {
    expect(rows.filter((row) => row.group === 'fact')).toHaveLength(10)
    expect(rows.filter((row) => row.group === 'score')).toHaveLength(7)
    expect(rows.filter((row) => row.group === 'judgement')).toHaveLength(8)
  })

  it('许可证不同会被标为差异行', () => {
    const license = find('license')
    expect(license?.differ).toBe(true)
    expect(license?.bestIndex).toBeNull()
  })

  it('星标最高且唯一时给最优列', () => {
    expect(find('stars')?.bestIndex).toBe(0)
  })

  it('安装复杂度越低越优', () => {
    expect(find('install')?.bestIndex).toBe(0)
  })

  it('并列最优时不高亮', () => {
    const tie = [makeRepo({ id: 'a', stars: 500 }), makeRepo({ id: 'b', stars: 500 })]
    const tieRows = buildCompareRows(tie, {})
    expect(tieRows.find((row) => row.key === 'stars')?.bestIndex).toBeNull()
  })

  it('缺少详情时回退到中文描述', () => {
    const tagline = find('tagline')
    expect(tagline?.values[2]).toBe(REPOS_FIXTURE[2]?.descriptionZh)
  })
})
