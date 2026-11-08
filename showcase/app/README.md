# Godot 插件图鉴 · 选型工作台

面向「2025 年后仍在更新」的 Godot 开源插件，用中文档案把「做什么、优点、缺点、适用场景、坑」讲清楚，让选型从翻仓库 README 变成按用途、成本和约束做排除法。

当前为定版：300 条仓库元数据、300 份中文短档案、300 份详情档案全部就位，未分类 0 条，矩阵 300 行全部可读。

## 定版数据

| 指标 | 数值 |
| --- | --- |
| 收录仓库 | 300 |
| 中文短档案（rows） | 300 |
| 详情档案（details） | 300 |
| 未分类 | 0 |
| 单文件体积 | 约 2.5 MB（CSS 28.5 KB + JS 约 2.5 MB） |
| 矩阵行数 | 300 |

分类分布（真实 `category`，由 `npm run data` 统计）：

| 分类 | 数量 | 分类 | 数量 |
| --- | --- | --- | --- |
| `state-logic` 状态机与逻辑 | 54 | `platform-export` 平台与导出 | 21 |
| `editor-tool` 编辑器效率 | 46 | `ai-gen` AI 与生成 | 19 |
| `3d-shader` 3D 与着色器 | 34 | `debug-perf` 调试与性能 | 18 |
| `ui` UI 与界面 | 31 | `network` 网络与联机 | 17 |
| `asset-pipeline` 资源与管线 | 28 | `save-data` 存档与数据 | 6 |
| `visual-script` 可视化脚本 | 21 | `audio` 音频 | 5 |

## 快速开始

要求 Node.js 20+。

```bash
npm install
npm run dev          # 本地开发，默认 http://localhost:5173
npm run data         # 合并 manifest + rows + details → src/data/catalog.json
npm run lint         # ESLint，要求 0 error 0 warning
npm test             # Vitest，纯函数用例
npm run typecheck    # tsc --noEmit，strict + noUncheckedIndexedAccess
npm run build        # data + typecheck + vite build + 单文件内联
npm run screenshot   # 用本机 Edge 打开 dist/index.html 截图与行为断言（需先 build）
```

构建产物只有 `dist/index.html`。双击用 `file://` 打开即可，不需要起服务器。

数据补齐后只需重跑 `npm run build`（开头会自动执行 `npm run data`），一条命令即可复现。

## 目录结构

```
showcase/app
├─ index.html                 Vite 入口壳
├─ scripts/
│  ├─ build-data.mjs          构建期合并 manifest / rows / details
│  ├─ inline.mjs              构建后把 CSS/JS 内联成经典脚本，并校验离线约束
│  └─ screenshot.mjs          Edge + playwright-core 截图与 375 溢出检查
├─ screenshots/               首页 / 矩阵 / 详情 / 对比，桌面与 375 两套
├─ src/
│  ├─ data/
│  │  ├─ catalog.json         构建产物（勿手改）
│  │  ├─ index.ts             暴露 REPOS / DETAILS / 计数与查找函数
│  │  └─ scenarios.ts         12 个真实分类的场景卡元数据（计数动态计算）
│  ├─ types.ts                Repo、RepoDetail、Catalog 等契约类型
│  ├─ lib/                    纯函数：搜索、筛选、排序、评分、对比行、路由、格式化
│  ├─ hooks/                  useHashRoute、useCompareIds
│  ├─ components/             Header、RepoCard、ScoreRadar、CompareTray 等
│  ├─ pages/                  HomePage、MatrixPage、DetailPage、ComparePage
│  ├─ styles.css              设计令牌 + 全部页面样式
│  └─ test/fixtures.ts        纯函数测试夹具
├─ docs/DESIGN.md             信息架构与设计取舍
└─ dist/index.html            单文件离线产物
```

## 数据来源与合并

三个输入目录都在 `showcase/` 下：

| 文件 | 作用 | 关键字段 |
| --- | --- | --- |
| `../manifest.json` | 300 条仓库元数据（唯一 ID 来源） | `id` `owner` `repo` `url` `stars` `forks` `license` `language` `created_at` `pushed_at` `description` `topics` `size_kb` `downloadMode` `isGDExtension` `needsBuild` `godotVersion` |
| `../data/rows/row_<id>.json` | 中文短档案 | `descriptionZh` `category` `tags` `prosShort` `consShort` `scores` `installComplexity` `godotVersion` `needCompile` `sampleStatus` |
| `../data/details/<id>.json` | 详情页长篇档案 | `taglineZh` `summaryZh` `whatItDoes` `useCases` `whatItMakes` `featureCallouts` `limitsZh` `workflowZh` `pros` `cons` `pitfalls` `bestFor` `avoidWhenZh` `compareTips` `evidence` `scores` |

`scripts/build-data.mjs` 每次构建都会：

1. 读 manifest 作为 300 条主键；rows 文件名去掉 `row_` 前缀后按 `id` 关联；details 文件名即 `id`。
2. 归一化：评分裁到 0–5 的六个英文维度、分类做白名单校验、版本收敛到 `4.x` / `3.x` / `unknown`、安装复杂度裁到 1–5。
3. 输出 `src/data/catalog.json`：`total` / `withRows` / `withDetails` / `categoryCounts` / `repos` / `details`。
4. 坏 JSON 只记 warning 不中断；缺失 row 或 detail 的条目照常输出并标记 `hasRow` / `hasDetail`。

### 数据缺口兜底（定版未触发）

定版数据 300/300 齐全，`hasRow` / `hasDetail` 全为 `true`，以下降级分支只在未来数据缺失时生效：

| 缺失内容 | 前端表现 |
| --- | --- |
| 无 row | `hasRow: false`，中文描述回退 manifest 英文 `description` 并加 `.is-en`；评分为 0，卡片与详情侧栏显示「—」「待评」；分类归入 `uncategorized` |
| 无 detail | `hasDetail: false`，详情页 8 个分区全部保留，用短档案字段兜底并显示「档案撰写中」提示；不空白、不报错 |
| 无 `installComplexity` | 按 `needCompile` 推断：需编译 4，否则 2 |

### 分类

12 个真实分类 slug，另有 `uncategorized` 兜底：

`ui`、`state-logic`、`network`、`save-data`、`ai-gen`、`editor-tool`、`3d-shader`、`audio`、`visual-script`、`platform-export`、`debug-perf`、`asset-pipeline`

中文名集中在 `src/types.ts` 的 `CATEGORY_LABELS`；首页场景卡名称与计数均来自 `catalog.categoryCounts`，不写死。

### 评分

六维英文 key：`coverage` / `usability` / `docs` / `maintenance` / `performance` / `stability`，每项 0–5。综合分为加权平均，权重 0.22 / 0.18 / 0.16 / 0.16 / 0.14 / 0.14，见 `src/lib/scores.ts`。缺失评分记为 0，并在 UI 上以「—」区分「未评」与「真 0 分」。

## 路由

Hash 路由，无第三方路由库：

| 地址 | 页面 |
| --- | --- |
| `#/` | 首页 / 选型入口 |
| `#/all` | 全部插件矩阵（300 行） |
| `#/repo/<id>` | 仓库详情 |
| `#/compare?ids=a,b,c,d` | 并排对比（最多 4 个） |

## 单文件离线构建

`npm run build` 的顺序：

1. `node scripts/build-data.mjs` 合并真实数据。
2. `tsc --noEmit` 严格类型检查。
3. `vite build` 产出单入口 JS 与一份 CSS（关闭代码分割、modulepreload、CSS 拆分）。
4. `scripts/inline.mjs` 删除 modulepreload、内联 CSS、把 JS 包成 `(function(){'use strict';…})()` 并移到 `</body>` 前，最后删除 `dist/assets`。

`inline.mjs` 会强校验并在失败时中断：不允许外链脚本 / `type="module"` / `crossorigin` / `import.meta` / 样式外链 / 外部字体，且内联脚本必须位于 `#root` 之后（经典脚本没有 defer，放 head 会先于挂载节点执行）。产物在 `file://` 下直接可用。

## 截图与实测

`scripts/screenshot.mjs` 调用本机 Microsoft Edge（不下载 Chromium），以 `file://` 打开产物，定版输出 8 张图到 `screenshots/`：

- `home-desktop` / `matrix-desktop` / `detail-desktop` / `compare-desktop`（1440）
- `home-mobile` / `matrix-mobile` / `detail-mobile` / `compare-mobile`（375）

若未来出现无详情仓库，脚本会自动补出 `detail-nodata-desktop` / `detail-nodata-mobile` 两张降级态截图。

脚本从 `catalog.json` 动态挑选有档案的仓库，并断言：

- 矩阵行数等于 `catalog.total`（当前 300），且不出现「档案撰写中」。
- 首页 12 张场景卡计数之和等于已分类仓库数，且无置灰卡片。
- 点击「星标」后首行不小于原首行，再点反向。
- 搜索「存档」能收窄结果并显示命中数。
- 详情页 8 个分区均有内容，且无降级提示。
- 每页 `documentElement.scrollWidth <= clientWidth`，控制台 error 为 0。

任一断言失败都会非零退出。

## 当前边界

- 定版 300 条全部带中文档案；数据若再变动，重跑 `npm run build` 即可，前端不需要改动。
- 矩阵一次渲染全部行；300 行经实测可接受，若涨到 1000+ 再考虑分页或窗口化。
- 对比页最多 4 列；移动端通过容器内横向滚动查看，不压缩字号。
- 单文件约 2.5 MB，其中绝大部分是 300 条中文档案的正文；离线双击即可用。
- localStorage 在部分 `file://` 环境可能被禁用，已做内存回退。
