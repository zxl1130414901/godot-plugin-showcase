import { SCORE_KEYS, type ScoreKey, type Scores } from '../types'

export const SCORE_WEIGHTS: Record<ScoreKey, number> = {
  coverage: 0.22,
  usability: 0.18,
  docs: 0.16,
  maintenance: 0.16,
  performance: 0.14,
  stability: 0.14,
}

/**
 * 六维加权综合分（0–5，保留一位小数）。
 * 单个维度会先夹到 0–5，避免异常数据把总分带偏。
 */
export function aggregateScore(scores: Scores): number {
  let weighted = 0
  let weightSum = 0
  for (const key of SCORE_KEYS) {
    const value = Math.min(5, Math.max(0, scores[key]))
    weighted += value * SCORE_WEIGHTS[key]
    weightSum += SCORE_WEIGHTS[key]
  }
  if (weightSum === 0) return 0
  return Math.round((weighted / weightSum) * 10) / 10
}
