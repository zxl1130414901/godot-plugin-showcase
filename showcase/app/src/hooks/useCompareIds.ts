import { useSyncExternalStore } from 'react'
import { getCompareIds, subscribeCompare } from '../lib/compare-store'

export function useCompareIds(): readonly string[] {
  return useSyncExternalStore(subscribeCompare, getCompareIds, getCompareIds)
}
