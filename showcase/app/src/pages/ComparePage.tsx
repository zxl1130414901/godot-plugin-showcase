import { Fragment, type CSSProperties } from 'react'
import { EmptyState, SectionHeading } from '../components/Bits'
import { Icon } from '../components/Icon'
import { DETAILS, getRepo, getRepoName } from '../data'
import { clearCompare, setCompareIds } from '../lib/compare-store'
import { buildCompareRows } from '../lib/compare-rows'
import { HREF_HOME, HREF_MATRIX, hrefCompare, hrefRepo } from '../lib/router'
import { navigate } from '../hooks/useHashRoute'
import type { Repo } from '../types'

export function ComparePage({ ids }: { ids: string[] }): JSX.Element {
  const repos = ids
    .map((id) => getRepo(id))
    .filter((repo): repo is Repo => Boolean(repo))
  const missing = ids.filter((id) => !getRepo(id))
  const rows = buildCompareRows(repos, DETAILS, getRepoName)

  const remove = (id: string): void => {
    const next = ids.filter((item) => item !== id)
    setCompareIds(next)
    navigate(hrefCompare(next))
  }

  const clearAll = (): void => {
    clearCompare()
    navigate('#/compare')
  }

  const gridStyle = { '--cols': Math.max(repos.length, 1) } as unknown as CSSProperties

  return (
    <div className="shell page">
      <SectionHeading
        eyebrow="并排对比"
        title="逐行看差异，再做决定"
        level={1}
        desc="最多 4 个候选。事实与评分行只高亮唯一最优；并列或缺失时不高亮。"
        actions={
          <div className="compare-actions">
            <a className="btn btn-compact" href={HREF_MATRIX}>
              <Icon name="plus" size={13} />
              继续挑选
            </a>
            {repos.length > 0 && (
              <button type="button" className="btn btn-compact btn-ghost" onClick={clearAll}>
                <Icon name="reset" size={13} />
                清空对比
              </button>
            )}
          </div>
        }
      />

      {missing.length > 0 && (
        <div className="notice" role="status">
          <Icon name="alert" size={15} />
          <span>
            这些 id 没有对应条目，已略过：{missing.map((id) => getRepoName(id)).join('、')}
          </span>
        </div>
      )}

      {repos.length === 0 ? (
        <EmptyState
          title="对比清单还是空的"
          desc="从首页、矩阵或详情页把插件加入对比，再回到这里并排查看。"
          action={
            <div className="empty-actions">
              <a className="btn btn-primary" href={HREF_HOME}>
                回选型首页
              </a>
              <a className="btn" href={HREF_MATRIX}>
                去插件矩阵
              </a>
            </div>
          }
        />
      ) : (
        <>
          {repos.length === 1 && (
            <div className="notice" role="status">
              <Icon name="alert" size={15} />
              <span>只有 1 个条目，至少再加入 1 个才能看出差异。</span>
            </div>
          )}

          <div className="compare-scroll panel">
            <div className="compare-grid" style={gridStyle}>
              <div className="cell cell-label cell-head">
                <span>对比项</span>
                <small>{repos.length} / 4</small>
              </div>
              {repos.map((repo) => (
                <div className="cell cell-head compare-repo" key={repo.id}>
                  <a className="compare-name" href={hrefRepo(repo.id)}>
                    {repo.name}
                  </a>
                  <span className="compare-owner">{repo.owner}</span>
                  <div className="compare-repo-actions">
                    <a
                      className="icon-link"
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`打开 ${repo.name} 的 GitHub`}
                      title="GitHub"
                    >
                      <Icon name="github" size={14} />
                    </a>
                    <button type="button" className="icon-link" onClick={() => remove(repo.id)} aria-label={`移除 ${repo.name}`} title="移除">
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {rows.map((row) => (
                <Fragment key={row.key}>
                  <div className={`cell cell-label${row.differ ? ' is-diff' : ''}${row.group === 'score' ? ' is-score' : ''}`}>
                    {row.label}
                    {row.differ && <i className="diff-mark" aria-hidden="true" />}
                  </div>
                  {row.values.map((value, index) => (
                    <div
                      key={`${row.key}-${repos[index]?.id ?? index}`}
                      className={`cell${row.differ ? ' is-diff' : ''}${row.group === 'score' ? ' is-score' : ''}${
                        row.bestIndex === index ? ' is-best' : ''
                      }`}
                    >
                      {value.split('\n').map((line, lineIndex) => (
                        <span className="cell-line" key={lineIndex}>
                          {line}
                        </span>
                      ))}
                      {row.bestIndex === index && <span className="best-badge">更优</span>}
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
