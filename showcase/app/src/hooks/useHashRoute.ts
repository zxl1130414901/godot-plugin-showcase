import { useEffect, useState } from 'react'
import { parseHash, type Route } from '../lib/router'

/** 监听 hashchange，所有跳转都通过修改 location.hash 完成 */
export function useHashRoute(): Route {
  const [hash, setHash] = useState(() => (typeof location === 'undefined' ? '' : location.hash))

  useEffect(() => {
    const onChange = (): void => setHash(location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return parseHash(hash)
}

export function navigate(hash: string): void {
  if (window.location.hash === hash) return
  window.location.hash = hash
}
