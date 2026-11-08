import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDir = join(appRoot, 'dist')
const entry = join(distDir, 'index.html')

if (!existsSync(entry)) throw new Error('未找到 dist/index.html，请先执行 vite build')

const startedAt = Date.now()
let html = readFileSync(entry, 'utf8')
const logs = []

const bytes = (value) =>
  `${((typeof value === 'number' ? value : Buffer.byteLength(value)) / 1024).toFixed(1)} KB`

const assetPath = (url) => {
  const clean = url.replace(/^\.?\//, '').replace(/^\/+/, '')
  return join(distDir, clean)
}

// 1. modulepreload 在 file:// 下没有意义，先删掉
const preloads = [...html.matchAll(/<link[^>]+rel="modulepreload"[^>]*>/g)]
html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '')
if (preloads.length > 0) logs.push(`移除 modulepreload ${preloads.length} 个`)

// 2. 内联 CSS
const cssLinks = [...html.matchAll(/<link([^>]*rel="stylesheet"[^>]*)>/g)]
let cssBytes = 0
for (const [tag, attrs = ''] of cssLinks) {
  const href = /href="([^"]+)"/.exec(attrs)?.[1]
  if (!href) continue
  const file = assetPath(href)
  if (!existsSync(file)) throw new Error(`样式文件不存在：${file}`)
  const css = readFileSync(file, 'utf8')
  cssBytes += Buffer.byteLength(css)
  html = html.replace(tag, () => `<style>\n${css}\n</style>`)
}
if (cssLinks.length > 0) logs.push(`内联 CSS ${bytes(cssBytes)}`)

// 3. 清理标签上的 crossorigin / type=module 残留（此时页面里还没有内联脚本正文）
html = html.replace(/\s+crossorigin(?:="[^"]*")?/g, '')
html = html.replace(/\s+type="module"/g, '')

// 4. 内联 JS，并转成经典 <script>（file:// 下 module 脚本会受 CORS 限制）
//    经典脚本没有 defer，必须挪到 </body> 前，否则执行时 #root 还不存在
const scriptTags = [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g)]
if (scriptTags.length === 0) throw new Error('index.html 中没有找到构建后的脚本引用')
const inlineBlocks = []
let jsBytes = 0

for (const [tag, src] of scriptTags) {
  if (!src) continue
  const file = assetPath(src)
  if (!existsSync(file)) throw new Error(`脚本文件不存在：${file}`)
  let code = readFileSync(file, 'utf8')
  jsBytes += Buffer.byteLength(code)

  if (/^\s*(?:import|export)\b/m.test(code)) {
    throw new Error('构建产物仍包含 ESM import/export，无法作为经典脚本内联')
  }
  if (/import\.meta/.test(code)) {
    throw new Error('构建产物包含 import.meta，file:// 下会失效')
  }
  code = code.replace(/<\/script/gi, '<\\/script')
  inlineBlocks.push(`<script>\n(function () {\n'use strict';\n${code}\n})();\n</script>`)
  html = html.replace(tag, '')
}

if (inlineBlocks.length > 0) {
  const block = inlineBlocks.join('\n')
  html = html.includes('</body>')
    ? html.replace('</body>', () => `${block}\n</body>`)
    : `${html}\n${block}`
}
logs.push(`内联 JS ${bytes(jsBytes)}`)

// 5. 强校验离线约束（先剥离内联脚本正文，避免把库代码里的标识符误判成标签）
const shell = html.replace(/<script>[\s\S]*?<\/script>/g, '<script></script>')
const problems = []
if (/<script[^>]*\ssrc=/i.test(shell)) problems.push('仍有外链脚本')
if (/<script[^>]*type="module"/i.test(shell)) problems.push('仍有 type="module"')
if (/<[a-z][^>]*\scrossorigin(?:[=\s>])/i.test(shell)) problems.push('仍有 crossorigin')
if (/<link[^>]+rel="stylesheet"/i.test(shell)) problems.push('仍有样式外链')
if (/https?:\/\/fonts\./i.test(shell)) problems.push('引用了外部字体服务')
if (/@import\s+url\(/i.test(shell)) problems.push('CSS 中存在外部 @import')
if (!/<div id="root"><\/div>/.test(shell)) problems.push('挂载节点缺失')
if (html.indexOf('<script>') < html.indexOf('id="root"')) {
  problems.push('内联脚本位于挂载节点之前，经典脚本会先于 #root 执行')
}
if (problems.length > 0) throw new Error(`离线校验失败：${problems.join('；')}`)

writeFileSync(entry, html, 'utf8')

// 6. 清理构建中间产物，只留一个 index.html
const assetsDir = join(distDir, 'assets')
if (existsSync(assetsDir)) rmSync(assetsDir, { recursive: true, force: true })

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
console.log(
  `[inline] 单文件离线产物就绪 · ${bytes(html)} · ${logs.join(' · ')} · ${elapsed}s\n[inline] ${entry}`,
)
