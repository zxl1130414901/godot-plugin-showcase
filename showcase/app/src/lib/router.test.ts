import { describe, expect, it } from 'vitest'
import { MAX_COMPARE, hrefCompare, parseHash } from './router'

describe('hash 路由', () => {
  it('首页与全部插件', () => {
    expect(parseHash('')).toEqual({ name: 'home' })
    expect(parseHash('#/')).toEqual({ name: 'home' })
    expect(parseHash('#/all')).toEqual({ name: 'matrix' })
  })

  it('详情路由并解码 id', () => {
    expect(parseHash('#/repo/dialogic')).toEqual({ name: 'detail', id: 'dialogic' })
    expect(parseHash('#/repo/a%20b')).toEqual({ name: 'detail', id: 'a b' })
    expect(parseHash('#/repo/')).toEqual({ name: 'notFound', path: '/repo/' })
  })

  it('对比路由去重并限制 4 个', () => {
    const route = parseHash('#/compare?ids=a,b,a,c,d,e')
    expect(route.name).toBe('compare')
    if (route.name === 'compare') {
      expect(route.ids).toEqual(['a', 'b', 'c', 'd'])
    }
    expect(parseHash('#/compare')).toEqual({ name: 'compare', ids: [] })
  })

  it('未知路径回退到 notFound', () => {
    expect(parseHash('#/oops')).toEqual({ name: 'notFound', path: '/oops' })
  })

  it('生成对比链接时同样去重并截断', () => {
    expect(hrefCompare(['a', 'b'])).toBe('#/compare?ids=a,b')
    expect(hrefCompare([])).toBe('#/compare')
    expect(MAX_COMPARE).toBe(4)
  })
})
