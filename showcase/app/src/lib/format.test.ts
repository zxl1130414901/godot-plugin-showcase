import { describe, expect, it } from 'vitest'
import { formatCompact, formatDate, installLabel, scoreText } from './format'

describe('格式化', () => {
  it('星标紧凑写法', () => {
    expect(formatCompact(999)).toBe('999')
    expect(formatCompact(4800)).toBe('4.8k')
    expect(formatCompact(12000)).toBe('1.2w')
  })

  it('安装复杂度文案夹取到 1–5', () => {
    expect(installLabel(1)).toBe('复制即用')
    expect(installLabel(3)).toBe('几分钟接入')
    expect(installLabel(5)).toBe('需编译改源码')
    expect(installLabel(9)).toBe('需编译改源码')
  })

  it('日期与评分', () => {
    expect(formatDate('2026-10-28T12:00:00Z')).toBe('2026-10-28')
    expect(scoreText(8.04)).toBe('8.0')
  })
})
