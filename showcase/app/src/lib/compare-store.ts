import { MAX_COMPARE } from './router'

const STORAGE_KEY = 'godot-atlas:compare'

const normalize = (ids: readonly string[]): string[] =>
  [...new Set(ids)].slice(0, MAX_COMPARE)

const readInitial = (): string[] => {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return normalize(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return []
  }
}

let current: string[] = readInitial()
const listeners = new Set<() => void>()

function persist(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    }
  } catch {
    // file:// 下可能禁用存储，退化为内存状态
  }
}

function emit(): void {
  for (const listener of listeners) listener()
}

/** 快照引用保持稳定，useSyncExternalStore 才能正确判断是否变化 */
export function getCompareIds(): readonly string[] {
  return current
}

export function subscribeCompare(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setCompareIds(ids: readonly string[]): void {
  const next = normalize(ids)
  if (next.length === current.length && next.every((id, index) => id === current[index])) return
  current = next
  persist()
  emit()
}

export type ToggleResult = 'added' | 'removed' | 'limit'

export function toggleCompare(id: string): ToggleResult {
  if (current.includes(id)) {
    setCompareIds(current.filter((item) => item !== id))
    return 'removed'
  }
  if (current.length >= MAX_COMPARE) return 'limit'
  setCompareIds([...current, id])
  return 'added'
}

export function clearCompare(): void {
  setCompareIds([])
}
