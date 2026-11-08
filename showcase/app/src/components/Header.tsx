import { REPOS } from '../data'
import { useCompareIds } from '../hooks/useCompareIds'
import { HREF_HOME, HREF_MATRIX, hrefCompare, type Route } from '../lib/router'
import { Icon } from './Icon'

export function Header({ route }: { route: Route }): JSX.Element {
  const ids = useCompareIds()
  const compareHref = ids.length > 0 ? hrefCompare(ids) : '#/compare'

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href={HREF_HOME}>
          <span className="brand-mark" aria-hidden="true">
            <Icon name="cube" size={20} />
          </span>
          <span className="brand-text">
            <strong>Godot 插件图鉴</strong>
            <small>选型工作台</small>
          </span>
        </a>

        <nav className="nav" aria-label="主导航">
          <a
            href={HREF_HOME}
            className={route.name === 'home' ? 'is-active' : ''}
            aria-current={route.name === 'home' ? 'page' : undefined}
          >
            首页
          </a>
          <a
            href={HREF_MATRIX}
            className={route.name === 'matrix' || route.name === 'detail' ? 'is-active' : ''}
            aria-current={route.name === 'matrix' ? 'page' : undefined}
          >
            <span className="nav-wide">插件矩阵</span>
            <span className="nav-narrow">矩阵</span>
          </a>
          <a
            href={compareHref}
            className={route.name === 'compare' ? 'is-active' : ''}
            aria-current={route.name === 'compare' ? 'page' : undefined}
          >
            对比
            {ids.length > 0 && <span className="nav-count">{ids.length}</span>}
          </a>
        </nav>

        <span className="header-note">{REPOS.length} 条收录</span>
      </div>
    </header>
  )
}
