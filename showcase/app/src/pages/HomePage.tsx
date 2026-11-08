import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { EmptyState, SectionHeading } from '../components/Bits'
import { Icon } from '../components/Icon'
import { RepoCard } from '../components/RepoCard'
import { countByCategory, DETAILS, REPOS, TOTAL, WITH_ROWS } from '../data'
import { SCENARIOS } from '../data/scenarios'
import {
  CONSTRAINT_DEFS,
  countActiveFilters,
  createDefaultFilters,
  filterRepos,
  toggleConstraint,
  type FilterOptions,
} from '../lib/filter'
import { HREF_MATRIX } from '../lib/router'
import { DEFAULT_SORT, SORT_OPTIONS, sortRepos, type SortKey } from '../lib/sort'
import type { Category } from '../types'

const QUICK_TERMS = ['对话', '回滚', '地形', '存档', 'Steam']

export function HomePage(): JSX.Element {
  const [filters, setFilters] = useState<FilterOptions>(createDefaultFilters)
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT)
  const searchRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const results = useMemo(
    () => sortRepos(filterRepos(REPOS, filters, DETAILS), sortKey),
    [filters, sortKey],
  )
  const categoryCounts = useMemo(() => countByCategory(), [])
  const detailCount = results.filter((repo) => repo.hasDetail).length
  const activeCount = countActiveFilters(filters)

  const patch = (part: Partial<FilterOptions>): void => {
    setFilters((current) => ({ ...current, ...part }))
  }

  const scrollToResults = (): void => {
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
  }

  const chooseScenario = (category: Category): void => {
    patch({ category: filters.category === category ? 'all' : category })
    scrollToResults()
  }

  const resetAll = (): void => {
    setFilters(createDefaultFilters())
    setSortKey(DEFAULT_SORT)
  }

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault()
    scrollToResults()
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      if (event.key === '/' && !typing) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <p className="eyebrow">Godot 插件开源项目对比站</p>
          <h1>
            别再从星标里猜插件，<span className="accent">按用途做排除法</span>
          </h1>
          <p className="hero-lede">
            收录 2025 年后仍在更新的 Godot 插件，用中文档案写清「做什么、优点、缺点、适用场景、坑」。
            先选用途，再加约束，最后把候选并排比较。
          </p>

          <form className="search-card" role="search" onSubmit={onSubmit}>
            <Icon name="search" size={20} className="search-icon" />
            <input
              ref={searchRef}
              type="search"
              aria-label="搜索插件"
              placeholder="你想做什么？试试「对话」「回滚」「地形」"
              value={filters.query}
              onChange={(event) => patch({ query: event.target.value })}
            />
            <kbd className="search-kbd">/</kbd>
            <button type="submit" className="btn btn-primary search-submit">
              筛选
            </button>
          </form>

          <div className="quick-row" aria-label="常用搜索词">
            <span>常用：</span>
            {QUICK_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                className="quick-term"
                onClick={() => {
                  patch({ query: term })
                  scrollToResults()
                }}
              >
                {term}
              </button>
            ))}
          </div>

          <div className="hero-stats">
            <div>
              <strong>{TOTAL}</strong>
              <span>个仓库收录</span>
            </div>
            <div>
              <strong>{WITH_ROWS}</strong>
              <span>条中文档案</span>
            </div>
            <div>
              <strong>{SCENARIOS.length}</strong>
              <span>个真实分类</span>
            </div>
            <div>
              <strong>{REPOS.filter((repo) => !repo.needCompile).length}</strong>
              <span>个无需编译</span>
            </div>
          </div>
        </div>
      </section>

      <div className="shell page">
        <section className="block" id="scenarios">
          <SectionHeading
            eyebrow="01 · 场景"
            title="你想做什么？"
            desc="按真实用途分类，点一张卡就把结果收窄到对应类别。"
            actions={
              <a className="text-link" href={HREF_MATRIX}>
                查看全部矩阵
                <Icon name="arrow" size={14} />
              </a>
            }
          />
          <div className="scenario-grid">
            {SCENARIOS.map((scenario, index) => {
              const count = categoryCounts.get(scenario.category) ?? 0
              const active = filters.category === scenario.category
              return (
                <button
                  key={scenario.category}
                  type="button"
                  className={`scenario-card${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  disabled={count === 0}
                  onClick={() => chooseScenario(scenario.category)}
                >
                  <span className={`scenario-icon cat-${index}`}>
                    <Icon name={scenario.icon} size={18} />
                  </span>
                  <span className="scenario-name">{scenario.label}</span>
                  <span className="scenario-blurb">{scenario.blurb}</span>
                  <span className="scenario-meta">
                    <span className="scenario-count">{count} 个插件</span>
                    <span className="scenario-keywords">{scenario.keywords.slice(0, 2).join(' · ')}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="block" id="constraints">
          <SectionHeading
            eyebrow="02 · 约束"
            title="把不能接受的先排除"
            desc="约束是硬过滤：不满足的条目直接从结果里消失，不做模糊加权。"
            actions={
              activeCount > 0 ? (
                <button type="button" className="btn btn-compact btn-ghost" onClick={resetAll}>
                  <Icon name="reset" size={13} />
                  清空 {activeCount} 项条件
                </button>
              ) : undefined
            }
          />
          <div className="constraint-row">
            {CONSTRAINT_DEFS.map((def) => {
              const active = filters.constraints.includes(def.id)
              return (
                <button
                  key={def.id}
                  type="button"
                  className={`chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  title={def.hint}
                  onClick={() => setFilters(toggleConstraint(filters, def.id))}
                >
                  <Icon name={active ? 'check' : 'plus'} size={13} />
                  {def.label}
                </button>
              )
            })}
          </div>
        </section>

        <section className="block results-block" ref={resultsRef} id="results">
          <div className="results-bar">
            <div className="results-summary">
              <strong>命中 {results.length}</strong> 个插件
              <span>·</span>
              <span>{detailCount} 条详情档案</span>
            </div>
            <div className="results-controls">
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
              <a className="text-link" href={HREF_MATRIX}>
                矩阵视图
                <Icon name="arrow" size={14} />
              </a>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="repo-grid">
              {results.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="没有符合全部条件的插件"
              desc="试试少选一个约束、清空关键词，或把星标门槛放宽到 500 以下。也可以只保留「已有中文档案」再逐步放开。"
              action={
                <button type="button" className="btn btn-primary" onClick={resetAll}>
                  清空全部条件
                </button>
              }
            />
          )}
        </section>

        <section className="cta-band">
          <div>
            <h2>已经有候选了？直接并排看差异</h2>
            <p>最多 4 个插件，逐行标出不同的地方，数值行只高亮唯一最优。</p>
          </div>
          <a className="btn btn-primary" href="#/compare">
            打开对比页
            <Icon name="arrow" size={14} />
          </a>
        </section>
      </div>
    </>
  )
}
