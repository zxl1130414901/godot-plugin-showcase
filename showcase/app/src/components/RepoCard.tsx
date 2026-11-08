import type { Repo } from '../types'
import { CATEGORY_LABELS, CATEGORY_LIST } from '../types'
import { getDetail } from '../data'
import { aggregateScore } from '../lib/scores'
import { hrefRepo } from '../lib/router'
import { formatCompact, formatDate, installLabel, scoreText } from '../lib/format'
import { Icon } from './Icon'
import { Badge, ScoreBadge } from './Bits'
import { CompareButton } from './CompareButton'

export function RepoCard({ repo }: { repo: Repo }): JSX.Element {
  const detail = getDetail(repo.id)
  const score = aggregateScore(repo.scores)
  const catIndex = CATEGORY_LIST.indexOf(repo.category)
  const pitfall = detail?.pitfalls[0]
  const description = detail?.taglineZh || repo.descriptionZh || repo.descriptionEn

  return (
    <article className="repo-card">
      <div className="repo-card-top">
        <span className="cat-label">
          <i
            className={`cat-dot ${catIndex >= 12 ? 'cat-muted' : `cat-${catIndex}`}`}
            aria-hidden="true"
          />
          {CATEGORY_LABELS[repo.category]}
        </span>
        <span className="repo-badges">
          {repo.isGDExtension && <Badge tone="brand">GDExtension</Badge>}
          <Badge tone={repo.needCompile ? 'warn' : 'good'}>
            {repo.needCompile ? '需编译' : '无需编译'}
          </Badge>
          {!repo.hasDetail && <Badge tone="warn">档案撰写中</Badge>}
        </span>
      </div>

      <h3 className="repo-title">
        <a href={hrefRepo(repo.id)}>{repo.name}</a>
      </h3>
      <p className="repo-owner">
        {repo.owner} · {repo.language} · {repo.license}
      </p>
      <p className={`repo-desc${repo.hasRow ? '' : ' is-en'}`}>{description}</p>

      <div className="repo-stats">
        <span>
          <Icon name="star" size={13} />
          {formatCompact(repo.stars)}
        </span>
        <span className="mono">{repo.godotVersion}</span>
        <span title={installLabel(repo.installComplexity)}>
          <Icon name="wrench" size={13} />
          {installLabel(repo.installComplexity)}
        </span>
        {repo.hasRow ? (
          <ScoreBadge score={score} />
        ) : (
          <span className="score-badge is-empty" title="评分待撰写">
            —
          </span>
        )}
      </div>

      {pitfall && (
        <p className="repo-pitfall">
          <Icon name="alert" size={13} />
          <span>{pitfall}</span>
        </p>
      )}

      <div className="repo-foot">
        <span className="repo-updated">
          {repo.hasDetail ? `评分 ${scoreText(score)} / 5` : `更新于 ${formatDate(repo.pushedAt)}`}
        </span>
        <div className="repo-actions">
          <a className="btn btn-compact" href={hrefRepo(repo.id)}>
            档案
            <Icon name="arrow" size={13} />
          </a>
          <CompareButton id={repo.id} compact />
        </div>
      </div>
    </article>
  )
}
