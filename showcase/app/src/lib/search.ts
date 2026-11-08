import { CATEGORY_LABELS, type Repo, type RepoDetail } from '../types'

/** 统一小写、全角空格与首尾空白，保证中英文关键词都能命中 */
export function normalizeQuery(input: string): string {
  return input.replace(/\u3000/g, ' ').toLowerCase().trim()
}

/** 空格分词；中文不做分词，按用户输入的原词做子串匹配 */
export function tokenizeQuery(input: string): string[] {
  return normalizeQuery(input)
    .split(/\s+/)
    .filter((token) => token.length > 0)
}

/** 把可搜索字段拼成一段文本，详情存在时一并纳入 */
export function buildSearchText(repo: Repo, detail?: RepoDetail): string {
  const parts: string[] = [
    repo.name,
    repo.owner,
    repo.descriptionZh,
    repo.descriptionEn,
    repo.category,
    CATEGORY_LABELS[repo.category],
    repo.godotVersion,
    repo.license,
    repo.language,
    ...repo.tags,
    ...repo.prosShort,
    ...repo.consShort,
  ]
  if (detail) {
    parts.push(
      detail.taglineZh,
      detail.summaryZh,
      detail.whatItDoes,
      detail.limitsZh,
      detail.bestFor,
      detail.avoidWhenZh,
      detail.compareTips.whenZh,
      ...detail.useCases.map((item) => `${item.titleZh} ${item.descZh}`),
      ...detail.whatItMakes.map((item) => `${item.titleZh} ${item.descZh}`),
      ...detail.featureCallouts.map((item) => `${item.name} ${item.descZh}`),
      ...detail.workflowZh.map((item) => item.stepZh),
      ...detail.pros,
      ...detail.cons,
      ...detail.pitfalls,
      ...detail.evidence.map((item) => `${item.claim} ${item.quote}`),
    )
  }
  return normalizeQuery(parts.join(' '))
}

/** 多关键词为 AND 语义：每个词都要在文本中出现 */
export function matchesQuery(repo: Repo, query: string, detail?: RepoDetail): boolean {
  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) return true
  const text = buildSearchText(repo, detail)
  return tokens.every((token) => text.includes(token))
}
