import type { ScenarioMeta } from '../types'

/**
 * 首页场景卡：12 个真实分类的中文展示信息。
 * 名称、图标与文案是本地化配置，计数由 catalog 的真实分类分布动态计算。
 */
export const SCENARIOS: ScenarioMeta[] = [
  {
    category: 'ui',
    label: 'UI 与界面',
    icon: 'window',
    blurb: '对话框、菜单、HUD 与整套界面库',
    keywords: ['对话框', 'UI', '菜单', 'HUD'],
  },
  {
    category: 'state-logic',
    label: '状态机与逻辑',
    icon: 'flow',
    blurb: '把角色状态、关卡流程从 if/else 里拆出来',
    keywords: ['状态机', '流程', '行为'],
  },
  {
    category: 'network',
    label: '网络与联机',
    icon: 'globe',
    blurb: '回滚同步、房间、断线重连与 Steam 联机',
    keywords: ['联机', '网络', 'Steam', '回滚'],
  },
  {
    category: 'save-data',
    label: '存档与数据',
    icon: 'database',
    blurb: '存档版本、配置表、数据驱动与迁移',
    keywords: ['存档', '数据', '配置', '迁移'],
  },
  {
    category: 'ai-gen',
    label: 'AI 与生成',
    icon: 'spark',
    blurb: '行为树、GOAP、寻路与程序化生成',
    keywords: ['AI', '行为树', '寻路', '生成'],
  },
  {
    category: 'editor-tool',
    label: '编辑器效率',
    icon: 'wrench',
    blurb: '测试、调试、批量编辑与工具链',
    keywords: ['测试', '调试', '工具', '批处理'],
  },
  {
    category: '3d-shader',
    label: '3D 与着色器',
    icon: 'cube',
    blurb: '地形、相机、材质、后处理与着色器',
    keywords: ['3D', '地形', '相机', '着色器'],
  },
  {
    category: 'audio',
    label: '音频',
    icon: 'wave',
    blurb: '音乐、音效、总线与动态混音',
    keywords: ['音频', '音乐', '音效', '总线'],
  },
  {
    category: 'visual-script',
    label: '可视化脚本',
    icon: 'nodes',
    blurb: '节点式逻辑、事件图与低代码工作流',
    keywords: ['可视化', '节点', '事件图'],
  },
  {
    category: 'platform-export',
    label: '平台与导出',
    icon: 'rocket',
    blurb: 'Steam、主机平台、成就与云存档',
    keywords: ['Steam', '平台', '成就', '云存档'],
  },
  {
    category: 'debug-perf',
    label: '调试与性能',
    icon: 'gauge',
    blurb: '性能面板、崩溃定位与运行时诊断',
    keywords: ['性能', '调试', '分析', '监控'],
  },
  {
    category: 'asset-pipeline',
    label: '资源与管线',
    icon: 'layers',
    blurb: '导入器、资源处理与批量生产管线',
    keywords: ['资源', '导入', '管线', '批量'],
  },
]
