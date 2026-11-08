import { SCORE_KEYS, SCORE_LABELS, type Scores } from '../types'
import { scoreText } from '../lib/format'

const SIZE = 240
const CENTER = SIZE / 2
const RADIUS = 82
const LABEL_RADIUS = 104
const MAX_SCORE = 5

const point = (index: number, value: number): [number, number] => {
  const angle = -Math.PI / 2 + (index * Math.PI) / 3
  const radius = RADIUS * value
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)]
}

const ringPoints = (ratio: number): string =>
  SCORE_KEYS.map((_, index) => point(index, ratio).join(',')).join(' ')

const labelAnchor = (index: number): 'start' | 'middle' | 'end' => {
  const x = Math.cos(-Math.PI / 2 + (index * Math.PI) / 3)
  if (Math.abs(x) < 0.01) return 'middle'
  return x > 0 ? 'start' : 'end'
}

export function ScoreRadar({ scores }: { scores: Scores }): JSX.Element {
  const values = SCORE_KEYS.map((key) => Math.min(MAX_SCORE, Math.max(0, scores[key])) / MAX_SCORE)
  const polygon = SCORE_KEYS.map((_, index) => point(index, values[index] ?? 0).join(',')).join(' ')

  return (
    <svg
      className="radar"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`六维评分（满分 5）：${SCORE_KEYS.map((key) => `${SCORE_LABELS[key]} ${scoreText(scores[key])}`).join('，')}`}
    >
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon key={ratio} className="radar-ring" points={ringPoints(ratio)} />
      ))}
      {SCORE_KEYS.map((key, index) => {
        const [x, y] = point(index, 1)
        return <line key={key} className="radar-axis" x1={CENTER} y1={CENTER} x2={x} y2={y} />
      })}
      <polygon className="radar-area" points={polygon} />
      {SCORE_KEYS.map((key, index) => {
        const [x, y] = point(index, values[index] ?? 0)
        return <circle key={key} className="radar-dot" cx={x} cy={y} r={3.2} />
      })}
      {SCORE_KEYS.map((key, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI) / 3
        const x = CENTER + LABEL_RADIUS * Math.cos(angle)
        const y = CENTER + LABEL_RADIUS * Math.sin(angle)
        return (
          <text
            key={key}
            className="radar-label"
            x={x}
            y={y}
            textAnchor={labelAnchor(index)}
            dominantBaseline="middle"
          >
            {SCORE_LABELS[key]}
          </text>
        )
      })}
    </svg>
  )
}
