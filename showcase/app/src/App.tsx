import { useEffect } from 'react'
import { CompareTray } from './components/CompareTray'
import { Header } from './components/Header'
import { useCompareIds } from './hooks/useCompareIds'
import { useHashRoute } from './hooks/useHashRoute'
import { setCompareIds } from './lib/compare-store'
import { HREF_MATRIX } from './lib/router'
import { ComparePage } from './pages/ComparePage'
import { DetailPage } from './pages/DetailPage'
import { HomePage } from './pages/HomePage'
import { MatrixPage } from './pages/MatrixPage'
import { REPOS } from './data'

function NotFoundPage({ path }: { path: string }): JSX.Element {
  return (
    <section className="shell page">
      <div className="empty-state panel">
        <strong>没有这个页面</strong>
        <p>
          路径 <code>{path || '/unknown'}</code> 不在路由表里，可能是链接写错了。
        </p>
        <div className="empty-actions">
          <a className="btn btn-primary" href="#/">
            回选型首页
          </a>
          <a className="btn" href={HREF_MATRIX}>
            去插件矩阵
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer(): JSX.Element {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>Godot 插件图鉴</strong>
          <p>当前收录 {REPOS.length} 条真实仓库，全部配有中文档案：一句话定位、适用场景、优缺点、常见坑与证据链接。</p>
        </div>
        <div className="footer-links">
          <a href={HREF_MATRIX}>全部插件</a>
          <a href="#/compare">对比清单</a>
        </div>
      </div>
    </footer>
  )
}

export default function App(): JSX.Element {
  const route = useHashRoute()
  const compareIds = useCompareIds()
  const compareKey = route.name === 'compare' ? route.ids.join(',') : ''
  const trayIds = compareIds.join(',')

  useEffect(() => {
    if (compareKey) setCompareIds(compareKey.split(','))
  }, [compareKey])

  let page: JSX.Element
  switch (route.name) {
    case 'home':
      page = <HomePage />
      break
    case 'matrix':
      page = <MatrixPage />
      break
    case 'detail':
      page = <DetailPage id={route.id} />
      break
    case 'compare':
      page = <ComparePage ids={route.ids} />
      break
    default:
      page = <NotFoundPage path={route.path} />
  }

  // 对比页不显示底部托盘，避免遮挡表格
  const showTray = route.name !== 'compare' && trayIds.length > 0

  return (
    <div className="app-shell">
      <Header route={route} />
      <main className="app-main">{page}</main>
      {showTray && <CompareTray />}
      <Footer />
    </div>
  )
}
