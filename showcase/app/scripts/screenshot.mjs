import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const appRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const entry = join(appRoot, 'dist', 'index.html')
const outDir = join(appRoot, 'screenshots')
const catalogPath = join(appRoot, 'src', 'data', 'catalog.json')

if (!existsSync(entry)) throw new Error('未找到 dist/index.html，请先执行 npm run build')
if (!existsSync(catalogPath)) throw new Error('未找到 catalog.json，请先执行 npm run data')
mkdirSync(outDir, { recursive: true })

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))
const withDetail = catalog.repos.filter((repo) => repo.hasDetail)
const withoutDetail = catalog.repos.filter((repo) => !repo.hasDetail)
const detailId = withDetail[0]?.id
const noDetailId = withoutDetail[0]?.id
const compareIds = withDetail.slice(0, 4).map((repo) => repo.id)
if (!detailId || compareIds.length < 4) {
  throw new Error('catalog 数据不足：需要至少 4 条含详情的仓库')
}

const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]
const executablePath = EDGE_PATHS.find((path) => existsSync(path))
if (!executablePath) throw new Error('未找到 Microsoft Edge，无法截图')

const base = pathToFileURL(entry).href
const shots = [
  { name: 'home-desktop', hash: '#/', width: 1440, height: 980 },
  { name: 'matrix-desktop', hash: '#/all', width: 1440, height: 980 },
  { name: 'detail-desktop', hash: `#/repo/${detailId}`, width: 1440, height: 980 },
  { name: 'compare-desktop', hash: `#/compare?ids=${compareIds.join(',')}`, width: 1440, height: 980 },
  { name: 'home-mobile', hash: '#/', width: 375, height: 812 },
  { name: 'matrix-mobile', hash: '#/all', width: 375, height: 812 },
  { name: 'detail-mobile', hash: `#/repo/${detailId}`, width: 375, height: 812 },
  { name: 'compare-mobile', hash: `#/compare?ids=${compareIds.slice(0, 3).join(',')}`, width: 375, height: 812 },
]
// 数据未齐时（仍有 hasDetail=false 的仓库）额外出一组降级态截图
if (noDetailId) {
  shots.splice(3, 0, { name: 'detail-nodata-desktop', hash: `#/repo/${noDetailId}`, width: 1440, height: 980 })
  shots.splice(8, 0, { name: 'detail-nodata-mobile', hash: `#/repo/${noDetailId}`, width: 375, height: 812 })
}

const failures = []
const browser = await chromium.launch({ executablePath, headless: true })

for (const shot of shots) {
  const page = await browser.newPage({
    viewport: { width: shot.width, height: shot.height },
    deviceScaleFactor: 1,
  })
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${String(error)}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })

  await page.goto(`${base}${shot.hash}`, { waitUntil: 'load' })
  await page.waitForSelector('.app-shell', { timeout: 15000 })
  await page.waitForTimeout(350)

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      heading: document.querySelector('h1')?.textContent?.trim() ?? '',
    }
  })
  const overflow = metrics.scrollWidth > metrics.clientWidth + 1

  await page.screenshot({
    path: join(outDir, `${shot.name}.png`),
    fullPage: shot.width >= 700 && !['home-desktop', 'matrix-desktop'].includes(shot.name),
  })

  if (errors.length > 0 || overflow) {
    failures.push(
      `${shot.name}: ${overflow ? `横向溢出 ${metrics.scrollWidth}>${metrics.clientWidth} ` : ''}${
        errors.length > 0 ? errors.join(' | ') : ''
      }`,
    )
  }
  console.log(
    `[shot] ${shot.name} ${shot.width}x${shot.height} · 标题「${metrics.heading || '无'}」· ${
      overflow ? '溢出' : '无横向溢出'
    }· 报错 ${errors.length}`,
  )
  await page.close()
}

// ---- 真实数据行为验证：300 行、搜索、排序、有无档案详情页 ----
const verify = await browser.newPage({ viewport: { width: 1440, height: 980 } })
const verifyErrors = []
verify.on('pageerror', (error) => verifyErrors.push(`pageerror: ${String(error)}`))
verify.on('console', (message) => {
  if (message.type() === 'error') verifyErrors.push(`console: ${message.text()}`)
})

await verify.goto(`${base}#/all`, { waitUntil: 'load' })
await verify.waitForSelector('.matrix-table tbody tr', { timeout: 15000 })
const totalRows = await verify.locator('.matrix-table tbody tr').count()
console.log(`[verify] 矩阵行数：${totalRows}（期望 ${catalog.total}）`)
if (totalRows !== catalog.total) failures.push(`矩阵行数 ${totalRows} ≠ ${catalog.total}`)
if (withoutDetail.length === 0) {
  const matrixText = await verify.locator('.matrix-scroll').innerText()
  if (matrixText.includes('档案撰写中')) failures.push('数据齐全但矩阵仍显示「档案撰写中」')
}

const starOf = async (index) => {
  const cell = verify.locator('.matrix-table tbody tr').nth(index).locator('td:nth-child(4) span[title]')
  return Number(await cell.getAttribute('title'))
}
const beforeSort = [await starOf(0), await starOf(1)]
await verify.locator('.matrix-table thead button', { hasText: '星标' }).click()
await verify.waitForTimeout(200)
const afterSort = [await starOf(0), await starOf(1)]
const sortWorks = afterSort[0] >= afterSort[1] && beforeSort[0] !== afterSort[0]
console.log(`[verify] 星标排序：${beforeSort.join(' > ')} → ${afterSort.join(' > ')}`)
if (!sortWorks) failures.push(`星标排序未生效：${afterSort.join(',')}`)

const searchInput = verify.locator('input[aria-label="关键词过滤"]')
await searchInput.fill('存档')
await verify.waitForTimeout(250)
const filteredRows = await verify.locator('.matrix-table tbody tr').count()
console.log(`[verify] 搜索「存档」：${filteredRows} / ${catalog.total}`)
if (filteredRows === 0 || filteredRows >= catalog.total) failures.push(`搜索未生效：${filteredRows}`)

const sectionCount = async (hash) => {
  await verify.goto(`${base}${hash}`, { waitUntil: 'load' })
  await verify.waitForSelector('.app-shell', { timeout: 15000 })
  await verify.waitForTimeout(200)
  return verify.locator('.detail-section').count()
}
const withCount = await sectionCount(`#/repo/${detailId}`)
console.log(`[verify] 有档案详情页分区：${withCount}（期望 8）`)
if (withCount !== 8) failures.push(`有档案详情页分区 ${withCount} ≠ 8`)

if (!noDetailId) {
  const chips = await verify.locator('.feature-chip').count()
  const badLinks = await verify.evaluate(
    (ids) => {
      const set = new Set(ids)
      return Array.from(document.querySelectorAll('a[href^="#/repo/"]'))
        .map((link) => link.getAttribute('href') || '')
        .filter((href) => !set.has(href.replace('#/repo/', '')))
    },
    catalog.repos.map((repo) => repo.id),
  )
  console.log(`[verify] 详情页特性 chips：${chips} · 坏链：${badLinks.length}`)
  if (chips < 3) failures.push(`详情页特性 chips ${chips} < 3`)
  if (badLinks.length) failures.push(`详情页坏链：${badLinks.join(',')}`)
}

if (noDetailId) {
  const noCount = await sectionCount(`#/repo/${noDetailId}`)
  const fallbackNotice = await verify.locator('.notice').count()
  console.log(`[verify] 无档案详情页分区：${noCount} · 降级提示：${fallbackNotice}`)
  if (noCount !== 8) failures.push(`无档案详情页分区 ${noCount} ≠ 8`)
  if (fallbackNotice === 0) failures.push('无档案详情页缺少「档案撰写中」提示')
} else {
  const pendingNotice = await verify.locator('.notice').count()
  const pendingText = await verify.locator('body').innerText()
  const pendingVisible = pendingText.includes('档案撰写中')
  console.log(`[verify] 数据齐全：详情页降级提示 ${pendingNotice} · 页面出现「档案撰写中」${pendingVisible ? '是' : '否'}`)
  if (pendingNotice !== 0 || pendingVisible) failures.push('数据齐全但详情页仍显示降级提示')
}

await verify.goto(`${base}#/`, { waitUntil: 'load' })
await verify.waitForSelector('.scenario-card', { timeout: 15000 })
const scenario = await verify.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.scenario-card'))
  return {
    count: cards.length,
    disabled: cards.filter((card) => card.disabled).length,
    counts: cards.map((card) => Number((card.querySelector('.scenario-count')?.textContent ?? '').match(/\d+/)?.[0] ?? 0)),
  }
})
const scenarioSum = scenario.counts.reduce((a, b) => a + b, 0)
const expectedSum = catalog.total - (catalog.categoryCounts.uncategorized ?? 0)
console.log(
  `[verify] 场景卡：${scenario.count} 张 · 计数 ${scenario.counts.join('/')} · 合计 ${scenarioSum}/${expectedSum} · 置灰 ${scenario.disabled}`,
)
if (scenario.count !== 12 || scenarioSum !== expectedSum || scenario.disabled > 0) {
  failures.push(`场景卡异常：${scenario.count} 张 / 合计 ${scenarioSum} / 置灰 ${scenario.disabled}`)
}

if (verifyErrors.length > 0) failures.push(`验证过程控制台报错：${verifyErrors.join(' | ')}`)
await verify.close()
await browser.close()

if (failures.length > 0) {
  console.error(`[shot] 失败 ${failures.length} 项：\n${failures.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`[shot] 全部截图与验证完成：${outDir}`)
}
