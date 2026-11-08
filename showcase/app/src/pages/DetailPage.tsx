import { CompareButton } from '../components/CompareButton'
import { Badge, EmptyState, InstallMeter, SectionHeading } from '../components/Bits'
import { Icon } from '../components/Icon'
import { ScoreRadar } from '../components/ScoreRadar'
import { getDetail, getRepo, getRepoName } from '../data'
import { formatCompact, formatDate, installLabel, scoreText } from '../lib/format'
import { aggregateScore } from '../lib/scores'
import { HREF_MATRIX, hrefRepo, hrefCompare } from '../lib/router'
import { CATEGORY_LABELS, SCORE_KEYS, SCORE_LABELS, type Repo, type RepoDetail } from '../types'

function DetailBody({ repo, detail }: { repo: Repo; detail?: RepoDetail }): JSX.Element {
  const score = aggregateScore(repo.scores)
  const alternatives = detail
    ? detail.compareTips.vs.filter((id) => getRepo(id)).map((id) => ({ id, name: getRepoName(id) }))
    : []
  const fallbackDesc = repo.descriptionZh || repo.descriptionEn
  const tagline = detail?.taglineZh || fallbackDesc
  const summary = detail?.summaryZh || ''
  const pros = detail?.pros.length ? detail.pros : repo.prosShort
  const cons = detail?.cons.length ? detail.cons : repo.consShort
  const workflow =
    detail?.workflowZh.length
      ? detail.workflowZh
      : [
          { stepZh: '从 GitHub 下载仓库，把插件目录放进项目的 addons/。' },
          {
            stepZh: repo.needCompile
              ? '按 README 编译原生库或构建 GDExtension，注意匹配 Godot 版本。'
              : '在项目设置里启用插件，按 README 完成最小配置。',
          },
          { stepZh: '新建最小场景验证核心功能，再接入正式项目。' },
        ]

  return (
    <>
      <section className="detail-hero">
        <div className="shell">
          <a className="back-link" href={HREF_MATRIX}>
            <Icon name="arrow" size={14} />
            返回插件矩阵
          </a>

          <div className="detail-hero-top">
            <span className="cat-label">{CATEGORY_LABELS[repo.category]}</span>
            <span className="repo-badges">
              {repo.isGDExtension && <Badge tone="brand">GDExtension</Badge>}
              <Badge tone={repo.needCompile ? 'warn' : 'good'}>
                {repo.needCompile ? '需编译' : '无需编译'}
              </Badge>
              {repo.hasDetail ? <Badge tone="good">中文档案</Badge> : <Badge tone="warn">档案撰写中</Badge>}
            </span>
          </div>

          <h1>{repo.name}</h1>
          <p className="detail-owner">
            {repo.owner} · {repo.language} · {repo.license}
          </p>
          <p className="detail-tagline">{tagline}</p>
          {summary && <p className="detail-summary">{summary}</p>}

          <div className="detail-actions">
            <a className="btn btn-primary" href={repo.url} target="_blank" rel="noreferrer">
              <Icon name="github" size={15} />
              GitHub 仓库
              <Icon name="external" size={13} />
            </a>
            <CompareButton id={repo.id} />
            <a className="btn" href={hrefRepo(repo.id)} aria-current="page">
              当前档案
            </a>
          </div>

          <dl className="fact-strip">
            <div>
              <dt>星标</dt>
              <dd>{formatCompact(repo.stars)}</dd>
            </div>
            <div>
              <dt>Fork</dt>
              <dd>{repo.forks}</dd>
            </div>
            <div>
              <dt>Godot</dt>
              <dd className="mono">{repo.godotVersion}</dd>
            </div>
            <div>
              <dt>最近更新</dt>
              <dd className="mono">{formatDate(repo.pushedAt)}</dd>
            </div>
            <div>
              <dt>安装复杂度</dt>
              <dd>
                <InstallMeter level={repo.installComplexity} showText />
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="shell detail-layout">
        <div className="detail-main">
          {!repo.hasDetail && (
            <div className="notice" role="status">
              <Icon name="alert" size={15} />
              <span>
                这个仓库的中文档案还在撰写中。下面先用 manifest 的真实元数据做降级展示，
                GitHub 仓库里的 README 仍是第一手资料。
              </span>
            </div>
          )}

          <section className="detail-section">
            <div className="section-num">01</div>
            <div className="section-body">
              <h2>能做什么</h2>
              {detail?.whatItDoes ? (
                <p className="detail-prose">{detail.whatItDoes}</p>
              ) : (
                <p className="detail-prose">{fallbackDesc || '暂无描述，请查看 GitHub 仓库。'}</p>
              )}
              {detail && detail.whatItMakes.length > 0 && (
                <div className="use-case-grid">
                  {detail.whatItMakes.map((item, index) => (
                    <div className="use-case" key={item.titleZh}>
                      <span className="use-case-index">{String(index + 1).padStart(2, '0')}</span>
                      <strong>{item.titleZh}</strong>
                      {item.descZh && <p>{item.descZh}</p>}
                    </div>
                  ))}
                </div>
              )}
              {detail && detail.featureCallouts.length > 0 && (
                <div className="feature-chips">
                  {detail.featureCallouts.map((item) => (
                    <span className="feature-chip" key={item.name} title={item.descZh}>
                      {item.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-num">02</div>
            <div className="section-body">
              <h2>适用场景</h2>
              {detail && detail.useCases.length > 0 ? (
                <div className="use-case-grid">
                  {detail.useCases.map((item, index) => (
                    <div className="use-case" key={item.titleZh}>
                      <span className="use-case-index">{String(index + 1).padStart(2, '0')}</span>
                      <strong>{item.titleZh}</strong>
                      {item.descZh && <p>{item.descZh}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="detail-prose">
                  档案撰写中。可以先看标签与描述判断方向：{repo.tags.length > 0 ? repo.tags.join('、') : '暂无标签'}。
                </p>
              )}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-num">03</div>
            <div className="section-body">
              <h2>能力边界</h2>
              {detail?.limitsZh ? (
                <p className="detail-prose">{detail.limitsZh}</p>
              ) : (
                <p className="detail-prose">档案撰写中，尚未整理明确的能力边界。</p>
              )}
              {detail?.avoidWhenZh && (
                <ul className="alert-list">
                  <li>
                    <Icon name="alert" size={14} />
                    <span>{detail.avoidWhenZh}</span>
                  </li>
                </ul>
              )}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-num">04</div>
            <div className="section-body">
              <h2>安装与使用流程</h2>
              <ol className="workflow">
                {workflow.map((step, index) => (
                  <li key={step.stepZh}>
                    <span className="workflow-num">{index + 1}</span>
                    <div>
                      <p>{step.stepZh}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-num">05</div>
            <div className="section-body">
              <h2>优缺点</h2>
              <div className="pros-cons">
                <div className="pros">
                  <h3>
                    <Icon name="check" size={15} />
                    优点
                  </h3>
                  {pros.length > 0 ? (
                    <ul>
                      {pros.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="detail-prose">待补充。</p>
                  )}
                </div>
                <div className="cons">
                  <h3>
                    <Icon name="close" size={15} />
                    缺点
                  </h3>
                  {cons.length > 0 ? (
                    <ul>
                      {cons.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="detail-prose">待补充。</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-num">06</div>
            <div className="section-body">
              <h2>常见坑</h2>
              {detail && detail.pitfalls.length > 0 ? (
                <ul className="alert-list">
                  {detail.pitfalls.map((item) => (
                    <li key={item}>
                      <Icon name="alert" size={14} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="detail-prose">
                  档案撰写中，尚未整理常见坑。建议先翻 GitHub Issues 里带 bug / crash 的条目。
                </p>
              )}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-num">07</div>
            <div className="section-body">
              <h2>与谁比，怎么选</h2>
              <p className="compare-tip">
                {detail?.compareTips.whenZh || detail?.bestFor || '档案撰写中，暂无对比建议；可先看 GitHub README 或仓库 Issues。'}
              </p>
              {alternatives.length > 0 && (
                <div className="alt-links">
                  <span>备选：</span>
                  {alternatives.map((alt) => (
                    <a key={alt.id} href={hrefRepo(alt.id)}>
                      {alt.name}
                      <Icon name="chevron" size={12} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-num">08</div>
            <div className="section-body">
              <h2>证据与链接</h2>
              {detail && detail.evidence.length > 0 ? (
                <ul className="evidence-list">
                  {detail.evidence.map((item) => (
                    <li key={`${item.source}-${item.claim}`}>
                      <Icon name="book" size={15} />
                      <div>
                        <strong>{item.claim}</strong>
                        <span className="evidence-url">
                          {item.source}
                          {item.quote ? ` · ${item.quote}` : ''}
                        </span>
                      </div>
                    </li>
                  ))}
                  <li>
                    <Icon name="github" size={15} />
                    <div>
                      <a href={repo.url} target="_blank" rel="noreferrer">
                        GitHub 仓库
                      </a>
                      <span className="evidence-url">{repo.url}</span>
                    </div>
                  </li>
                </ul>
              ) : (
                <ul className="evidence-list">
                  <li>
                    <Icon name="github" size={15} />
                    <div>
                      <a href={repo.url} target="_blank" rel="noreferrer">
                        GitHub 仓库
                      </a>
                      <span className="evidence-url">{repo.url}</span>
                    </div>
                  </li>
                  {repo.descriptionEn && (
                    <li>
                      <Icon name="book" size={15} />
                      <div>
                        <strong>仓库原始描述</strong>
                        <span className="evidence-url">{repo.descriptionEn}</span>
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </section>
        </div>

        <aside className="detail-aside">
          <div className="aside-card score-card">
            <div className="aside-head">
              <span>六维评分</span>
              {repo.hasRow ? <strong className="score-overall">{scoreText(score)}</strong> : <span className="muted-chip">待评</span>}
            </div>
            {repo.hasRow ? (
              <>
                <ScoreRadar scores={repo.scores} />
                <div className="score-bars">
                  {SCORE_KEYS.map((key) => (
                    <div className="score-bar" key={key}>
                      <span className="score-key">{SCORE_LABELS[key]}</span>
                      <span className="score-track">
                        <i style={{ width: `${Math.min(5, Math.max(0, repo.scores[key])) * 20}%` }} />
                      </span>
                      <span className="score-value mono">{scoreText(repo.scores[key])}</span>
                    </div>
                  ))}
                </div>
                <p className="aside-note">
                  综合分按功能 0.22、易用 0.18、文档 0.16、维护 0.16、性能 0.14、稳定 0.14 加权，满分 5 分。
                </p>
              </>
            ) : (
              <p className="aside-note">六维评分将在中文档案完成后补齐；当前只展示 manifest 中的客观元数据。</p>
            )}
          </div>

          <div className="aside-card">
            <h3>安装速览</h3>
            <dl className="aside-facts">
              <div>
                <dt>安装方式</dt>
                <dd>{installLabel(repo.installComplexity)}</dd>
              </div>
              <div>
                <dt>编译</dt>
                <dd>{repo.needCompile ? '需要构建或匹配原生库' : '复制插件目录即可'}</dd>
              </div>
              <div>
                <dt>版本</dt>
                <dd className="mono">{repo.godotVersion}</dd>
              </div>
              <div>
                <dt>最近更新</dt>
                <dd className="mono">{formatDate(repo.pushedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="aside-card compare-cta">
            <h3>把它放进对比</h3>
            <p>最多 4 个候选并排，逐行标记差异与唯一最优项。</p>
            <div className="aside-actions">
              <CompareButton id={repo.id} />
              {alternatives.length > 0 && alternatives[0] && (
                <a className="btn btn-compact" href={hrefCompare([repo.id, alternatives[0].id])}>
                  <Icon name="compare" size={13} />
                  与 {alternatives[0].name} 对比
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

export function DetailPage({ id }: { id: string }): JSX.Element {
  const repo = getRepo(id)

  if (!repo) {
    return (
      <div className="shell page">
        <SectionHeading eyebrow="未找到" title="没有这个插件档案" />
        <EmptyState
          title="仓库 id 不存在"
          desc={`没有找到 id 为「${id}」的条目，可能是链接拼写有误，或该条目尚未接入。`}
          action={
            <a className="btn btn-primary" href={HREF_MATRIX}>
              回插件矩阵
            </a>
          }
        />
      </div>
    )
  }

  return <DetailBody repo={repo} detail={getDetail(id)} />
}
