import type { ReactNode } from 'react'
import { installLabel, scoreText } from '../lib/format'

export function Badge({
  children,
  tone = 'muted',
  className = '',
}: {
  children: ReactNode
  tone?: 'muted' | 'brand' | 'good' | 'warn' | 'bad'
  className?: string
}): JSX.Element {
  return <span className={`badge badge-${tone} ${className}`.trim()}>{children}</span>
}

export function InstallMeter({
  level,
  showText = false,
}: {
  level: number
  showText?: boolean
}): JSX.Element {
  const filled = Math.min(5, Math.max(1, Math.round(level)))
  return (
    <span className="install-meter" title={`安装复杂度 ${filled}/5：${installLabel(level)}`}>
      <span className="install-dots" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <i key={index} className={index < filled ? 'is-on' : ''} />
        ))}
      </span>
      {showText && <span className="install-text">{installLabel(level)}</span>}
      <span className="sr-only">
        安装复杂度 {filled}/5：{installLabel(level)}
      </span>
    </span>
  )
}

export function ScoreBadge({ score }: { score: number }): JSX.Element {
  return <span className="score-badge">{scoreText(score)}</span>
}

export function SectionHeading({
  eyebrow,
  title,
  desc,
  actions,
  level = 2,
}: {
  eyebrow?: string
  title: string
  desc?: string
  actions?: ReactNode
  level?: 1 | 2
}): JSX.Element {
  const Heading = level === 1 ? 'h1' : 'h2'
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading>{title}</Heading>
        {desc && <p className="section-desc">{desc}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  )
}

export function EmptyState({
  title,
  desc,
  action,
}: {
  title: string
  desc: string
  action?: ReactNode
}): JSX.Element {
  return (
    <div className="empty-state panel">
      <strong>{title}</strong>
      <p>{desc}</p>
      {action}
    </div>
  )
}
