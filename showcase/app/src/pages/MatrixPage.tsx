import { useMemo, useState } from 'react'
import { EmptyState, InstallMeter, ScoreBadge, SectionHeading } from '../components/Bits'
import { CompareButton } from '../components/CompareButton'
import { Icon } from '../components/Icon'
import { DETAILS, REPOS, TOTAL, WITH_ROWS } from '../data'
import {
  countActiveFilters,
  createDefaultFilters,
  filterRepos,
  type FilterOptions,
} from '../lib/filter'
import { aggregateScore } from '../lib/scores'
import { HREF_HOME, hrefRepo } from '../lib/router'
import { formatCompact, formatDate } from '../lib/format'
import { DEFAULT_SORT, SORT_OPTIONS, sortRepos, type SortKey } from '../lib/sort'
import { CATEGORY_LABELS, CATEGORY_LIST, GODOT_VERSION_LIST, type Category, type GodotVersion } from '../types'

const LICENSE_OPTIONS = Array.from(new Set(REPOS.map((repo) => repo.license))).sort()

function SortHead({
  label,
  sortKey,
  current,
  onSort,
  className = '',
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  onSort: (key: SortKey) => void
  className?: string
}): JSX.Element {
  const active = current === sortKey
  return (
    <th className={className} aria-sort={active ? (sortKey === 'install' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className={`sort-head${active ? ' is-active' : ''}`} onClick={() => onSort(sortKey)}>
        {label}
        <span className="sort-mark">{active ? (sortKey === 'install' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  )
}

export function MatrixPage(): JSX.Element {
  const [filters, setFilters] = useState<FilterOptions>(createDefaultFilters)
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT)

  const results = useMemo(
    () => sortRepos(filterRepos(REPOS, filters, DETAILS), sortKey),
    [filters, sortKey],
  )
  const activeCount = countActiveFilters(filters)

  const patch = (part: Partial<FilterOptions>): void => {
    setFilters((current) => ({ ...current, ...part }))
  }

  return (
    <div className="shell page">
      <SectionHeading
        eyebrow="全部插件"
        title="插件矩阵"
        level={1}
        desc={`${TOTAL} 条收录，${WITH_ROWS} 条已有中文档案；按综合评分、星标、更新时间或安装复杂度排序，筛选与首页共用同一套规则。`}
        actions={
          <a className="btn btn-compact" href={HREF_HOME}>
            <Icon name="search" size={13} />
            回选型首页
          </a>
        }
      />

      <div className="matrix-toolbar panel">
        <div className="matrix-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            aria-label="关键词过滤"
            placeholder="关键词过滤：名称、标签、描述、坑"
            value={filters.query}
            onChange={(event) => patch({ query: event.target.value })}
          />
        </div>

        <label className="select-label">
          类别
          <select
            value={filters.category}
            onChange={(event) => patch({ category: event.target.value as Category | 'all' })}
          >
            <option value="all">全部</option>
            {CATEGORY_LIST.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>

        <label className="select-label">
          版本
          <select
            value={filters.godotVersion}
            onChange={(event) =>
              patch({ godotVersion: event.target.value as GodotVersion | 'all' })
            }
          >
            <option value="all">全部</option>
            {GODOT_VERSION_LIST.map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </select>
        </label>

        <label className="select-label">
          编译
          <select
            value={filters.needCompile}
            onChange={(event) =>
              patch({ needCompile: event.target.value as FilterOptions['needCompile'] })
            }
          >
            <option value="all">全部</option>
            <option value="no">无需编译</option>
            <option value="yes">需要编译</option>
          </select>
        </label>

        <label className="select-label">
          许可证
          <select
            value={filters.license}
            onChange={(event) => patch({ license: event.target.value })}
          >
            <option value="all">全部</option>
            {LICENSE_OPTIONS.map((license) => (
              <option key={license} value={license}>
                {license}
              </option>
            ))}
          </select>
        </label>

        <label className="select-label">
          排序
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {activeCount > 0 && (
          <button
            type="button"
            className="btn btn-compact btn-ghost"
            onClick={() => setFilters(createDefaultFilters())}
          >
            <Icon name="reset" size={13} />
            清空 {activeCount} 项
          </button>
        )}
      </div>

      <div className="matrix-meta">
        <span>
          命中 <strong>{results.length}</strong> / {REPOS.length}
        </span>
        <a className="text-link" href={HREF_HOME}>
          按场景筛选
          <Icon name="arrow" size={13} />
        </a>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="当前条件下没有条目"
          desc="放宽关键词或清除部分筛选条件后再看。"
          action={
            <button type="button" className="btn btn-primary" onClick={() => setFilters(createDefaultFilters())}>
              清空筛选
            </button>
          }
        />
      ) : (
        <div className="matrix-scroll panel">
          <table className="matrix-table">
            <thead>
              <tr>
                <th scope="col">插件</th>
                <th scope="col" className="hide-md">
                  类别
                </th>
                <th scope="col" className="hide-sm">
                  版本
                </th>
                <SortHead label="星标" sortKey="stars" current={sortKey} onSort={setSortKey} />
                <SortHead
                  label="更新"
                  sortKey="updated"
                  current={sortKey}
                  onSort={setSortKey}
                  className="hide-md"
                />
                <SortHead
                  label="安装"
                  sortKey="install"
                  current={sortKey}
                  onSort={setSortKey}
                  className="hide-sm"
                />
                <SortHead label="综合" sortKey="overall" current={sortKey} onSort={setSortKey} />
                <th scope="col">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((repo) => (
                <tr key={repo.id}>
                  <td>
                    <a className="matrix-name" href={hrefRepo(repo.id)}>
                      {repo.name}
                    </a>
                    <span className="matrix-owner">
                      {repo.owner}
                      {!repo.hasDetail && ' · 档案撰写中'}
                    </span>
                  </td>
                  <td className="hide-md">
                    <span className="matrix-category">
                      <i
                        className={`cat-dot ${
                          CATEGORY_LIST.indexOf(repo.category) >= 12
                            ? 'cat-muted'
                            : `cat-${Math.max(0, CATEGORY_LIST.indexOf(repo.category))}`
                        }`}
                        aria-hidden="true"
                      />
                      {CATEGORY_LABELS[repo.category]}
                    </span>
                    <span className="matrix-sub">{repo.tags.slice(0, 2).join(' · ')}</span>
                  </td>
                  <td className="hide-sm mono">{repo.godotVersion}</td>
                  <td className="mono">
                    <span title={String(repo.stars)}>{formatCompact(repo.stars)}</span>
                  </td>
                  <td className="hide-md mono">{formatDate(repo.pushedAt)}</td>
                  <td className="hide-sm">
                    <InstallMeter level={repo.installComplexity} />
                  </td>
                  <td>
                    {repo.hasRow ? (
                      <ScoreBadge score={aggregateScore(repo.scores)} />
                    ) : (
                      <span className="score-badge is-empty" title="评分待撰写">
                        —
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="matrix-actions">
                      <CompareButton id={repo.id} compact />
                      <a className="icon-link" href={hrefRepo(repo.id)} aria-label={`查看 ${repo.name} 档案`}>
                        <Icon name="arrow" size={15} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="matrix-note">
        数据来自 manifest.json 与并行撰写的中文档案：星标、Fork、更新时间是 GitHub 真实值；未完成档案的条目用仓库英文描述兜底，评分列显示「—」。重跑 <code>npm run data</code> 即可刷新。
      </p>
    </div>
  )
}
