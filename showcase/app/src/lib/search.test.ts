import { describe, expect, it } from 'vitest'
import { buildSearchText, matchesQuery, normalizeQuery, tokenizeQuery } from './search'
import { REPOS_FIXTURE } from '../test/fixtures'
import { makeDetail } from '../test/fixtures'

describe('搜索', () => {
  it('归一化大小写与全角空格', () => {
    expect(normalizeQuery('  Godot\u3000UI  ')).toBe('godot ui')
  })

  it('空格分词', () => {
    expect(tokenizeQuery('对话  存档 ')).toEqual(['对话', '存档'])
    expect(tokenizeQuery('   ')).toEqual([])
  })

  it('名称与标签可命中', () => {
    const alpha = REPOS_FIXTURE[0]!
    expect(matchesQuery(alpha, 'alpha')).toBe(true)
    expect(matchesQuery(alpha, '对话')).toBe(true)
  })

  it('多关键词是 AND 语义', () => {
    const alpha = REPOS_FIXTURE[0]!
    expect(matchesQuery(alpha, '对话 编辑器')).toBe(true)
    expect(matchesQuery(alpha, '对话 存档')).toBe(false)
  })

  it('详情文本参与搜索', () => {
    const alpha = REPOS_FIXTURE[0]!
    const detail = makeDetail({ summaryZh: '重型叙事引擎，适合长篇视觉小说。' })
    expect(matchesQuery(alpha, '重型叙事引擎', detail)).toBe(true)
    expect(buildSearchText(alpha, detail)).toContain('重型叙事引擎')
  })
})
