import { describe, expect, it } from 'vitest'
import { aggregateScore, SCORE_WEIGHTS } from './scores'
import { SCORE_KEYS, type Scores } from '../types'

const makeScores = (value: number): Scores => ({
  coverage: value,
  usability: value,
  docs: value,
  maintenance: value,
  performance: value,
  stability: value,
})

describe('评分聚合', () => {
  it('六维权重之和为 1', () => {
    const sum = SCORE_KEYS.reduce((acc, key) => acc + SCORE_WEIGHTS[key], 0)
    expect(sum).toBeCloseTo(1, 10)
  })

  it('满分 5 返回 5', () => {
    expect(aggregateScore(makeScores(5))).toBe(5)
  })

  it('零分返回 0', () => {
    expect(aggregateScore(makeScores(0))).toBe(0)
  })

  it('越界值先夹取再加权', () => {
    expect(aggregateScore(makeScores(20))).toBe(5)
    expect(aggregateScore(makeScores(-5))).toBe(0)
    expect(aggregateScore(makeScores(4))).toBe(4)
  })

  it('加权结果保留一位小数', () => {
    expect(
      aggregateScore({
        coverage: 4,
        usability: 4,
        docs: 4,
        maintenance: 4,
        performance: 3,
        stability: 4,
      }),
    ).toBe(3.9)
  })
})
