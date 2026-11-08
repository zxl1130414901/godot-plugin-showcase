import { getRepoName } from '../data'
import { useCompareIds } from '../hooks/useCompareIds'
import { clearCompare, toggleCompare } from '../lib/compare-store'
import { hrefCompare, hrefRepo, MAX_COMPARE } from '../lib/router'
import { Icon } from './Icon'

export function CompareTray(): JSX.Element | null {
  const ids = useCompareIds()
  if (ids.length === 0) return null

  return (
    <aside className="compare-tray" aria-label="对比清单">
      <div className="shell compare-tray-inner">
        <span className="tray-label">
          <Icon name="compare" size={15} />
          对比清单
          <span className="tray-count">
            {ids.length}/{MAX_COMPARE}
          </span>
        </span>

        <div className="tray-chips">
          {ids.map((id) => (
            <span className="tray-chip" key={id}>
              <a href={hrefRepo(id)}>{getRepoName(id)}</a>
              <button
                type="button"
                aria-label={`从对比清单移除 ${getRepoName(id)}`}
                onClick={() => toggleCompare(id)}
              >
                <Icon name="close" size={12} />
              </button>
            </span>
          ))}
        </div>

        <div className="tray-actions">
          <button type="button" className="btn btn-compact btn-ghost" onClick={clearCompare}>
            清空
          </button>
          <a
            className={`btn btn-primary btn-compact${ids.length < 2 ? ' is-disabled' : ''}`}
            href={ids.length >= 2 ? hrefCompare(ids) : '#/compare'}
            aria-disabled={ids.length < 2}
          >
            并排对比
            <Icon name="arrow" size={13} />
          </a>
        </div>
      </div>
    </aside>
  )
}
