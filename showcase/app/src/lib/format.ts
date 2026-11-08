const INSTALL_LABELS = ['复制即用', '按文档配置', '几分钟接入', '需要编译或构建', '需编译改源码']

const trimOne = (value: number): string => value.toFixed(1).replace(/\.0$/, '')

/** 星标/Fork 的紧凑写法：4800 → 4.8k，12000 → 1.2w */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value >= 10000) return `${trimOne(value / 10000)}w`
  if (value >= 1000) return `${trimOne(value / 1000)}k`
  return String(Math.round(value))
}

/** ISO 时间只展示日期部分，避免详情页出现时区噪声 */
export function formatDate(iso: string): string {
  return iso.length >= 10 ? iso.slice(0, 10) : iso
}

/** 安装复杂度 1–5 的中文档位，越界值做夹取 */
export function installLabel(level: number): string {
  const index = Math.min(5, Math.max(1, Math.round(level))) - 1
  return INSTALL_LABELS[index] ?? '未知'
}

/** 评分统一保留一位小数 */
export function scoreText(score: number): string {
  return score.toFixed(1)
}
