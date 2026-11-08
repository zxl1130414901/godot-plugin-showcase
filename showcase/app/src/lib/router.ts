export type Route =
  | { name: 'home' }
  | { name: 'matrix' }
  | { name: 'detail'; id: string }
  | { name: 'compare'; ids: string[] }
  | { name: 'notFound'; path: string }

export const MAX_COMPARE = 4

export const HREF_HOME = '#/'
export const HREF_MATRIX = '#/all'

export function hrefRepo(id: string): string {
  return `#/repo/${encodeURIComponent(id)}`
}

export function hrefCompare(ids: readonly string[]): string {
  const unique = [...new Set(ids)].slice(0, MAX_COMPARE)
  return unique.length === 0 ? '#/compare' : `#/compare?ids=${unique.map(encodeURIComponent).join(',')}`
}

export function parseHash(hash: string): Route {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (raw === '' || raw === '/') return { name: 'home' }
  const [path = '', query = ''] = raw.split('?')

  if (path === '/all') return { name: 'matrix' }

  if (path.startsWith('/repo/')) {
    const encoded = path.slice('/repo/'.length)
    if (!encoded) return { name: 'notFound', path }
    try {
      return { name: 'detail', id: decodeURIComponent(encoded) }
    } catch {
      return { name: 'notFound', path }
    }
  }

  if (path === '/compare') {
    const ids = (new URLSearchParams(query).get('ids') ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
    return { name: 'compare', ids: [...new Set(ids)].slice(0, MAX_COMPARE) }
  }

  return { name: 'notFound', path }
}
