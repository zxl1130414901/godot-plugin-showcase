import { useCompareIds } from '../hooks/useCompareIds'
import { toggleCompare } from '../lib/compare-store'
import { MAX_COMPARE } from '../lib/router'
import { Icon } from './Icon'

export function CompareButton({
  id,
  compact = false,
}: {
  id: string
  compact?: boolean
}): JSX.Element {
  const ids = useCompareIds()
  const selected = ids.includes(id)
  const full = ids.length >= MAX_COMPARE && !selected
  const label = selected ? '已选对比' : full ? '对比已满' : '加入对比'

  return (
    <button
      type="button"
      className={`btn compare-btn${selected ? ' is-selected' : ''}${compact ? ' btn-compact' : ''}`}
      aria-pressed={selected}
      disabled={full}
      title={full ? `最多同时对比 ${MAX_COMPARE} 个` : label}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleCompare(id)
      }}
    >
      <Icon name={selected ? 'check' : 'plus'} size={13} />
      <span className="compare-btn-label">{label}</span>
    </button>
  )
}
