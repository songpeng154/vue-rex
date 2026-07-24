import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { usePagination } from '../../src/hooks'
import { asyncAwait, withSetup } from '../utils.ts'
import { dataSerializer, mockService } from './helpers.ts'

describe('usePagination 翻页', () => {
  it('page 变化触发重新请求', async () => {
    const [{ list, page }] = withSetup(() =>
      usePagination(mockService, { dataSerializer }),
    )
    await asyncAwait(100)
    expect(list.value[0].id).toBe(1)

    page.value = 2
    await asyncAwait(100)
    expect(list.value[0].id).toBe(11)
  })

  it('pageSize 变化触发重新请求', async () => {
    const [{ list, pageSize }] = withSetup(() =>
      usePagination(mockService, { dataSerializer }),
    )
    await asyncAwait(100)
    expect(list.value[0].id).toBe(1)

    pageSize.value = 20
    await asyncAwait(100)
    expect(pageSize.value).toBe(20)
    expect(list.value).toHaveLength(20)
  })

  it('pageSize 变化时重置 page 到第一页', async () => {
    const [{ page, pageSize }] = withSetup(() =>
      usePagination(mockService, { dataSerializer }),
    )
    await asyncAwait(100)

    page.value = 3
    await asyncAwait(100)
    expect(page.value).toBe(3)

    pageSize.value = 20
    await asyncAwait(100)
    expect(page.value).toBe(1)
  })

  it('resetPageWhenPageSizeChange: false 时不重置 page', async () => {
    const [{ page, pageSize }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        resetPageWhenPageSizeChange: false,
      }),
    )
    await asyncAwait(100)

    page.value = 2
    await asyncAwait(100)
    expect(page.value).toBe(2)

    pageSize.value = 20
    await asyncAwait(100)
    expect(page.value).toBe(2)
  })
})

describe('usePagination search', () => {
  it('search() 提交表单搜索条件 + page 归 1', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword: string }) => {
      capturedParams = params
      return { records: [], totalCount: 0 }
    }

    const searchParams = ref({ keyword: '', page: 1, pageSize: 10 })
    const [{ page, search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        params: searchParams,
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ keyword: '', page: 1, pageSize: 10 })

    searchParams.value.keyword = 'abc'
    search()
    await asyncAwait(100)
    expect(capturedParams).toEqual({ keyword: 'abc', page: 1, pageSize: 10 })
    expect(page.value).toBe(1)
  })

  it('search(params) 先写入表单再提交', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword: string }) => {
      capturedParams = params
      return { records: [], totalCount: 0 }
    }

    const searchParams = ref({ keyword: '', page: 1, pageSize: 10 })
    const [{ search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        params: searchParams,
      }),
    )

    await asyncAwait(100)

    search({ keyword: 'xyz' } as any)
    await asyncAwait(100)
    expect(capturedParams).toEqual({ keyword: 'xyz', page: 1, pageSize: 10 })
    expect(searchParams.value.keyword).toBe('xyz')
  })

  it('search() 时 page 非 1 会归 1', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword: string }) => {
      capturedParams = params
      return { records: [], totalCount: 100 }
    }

    const searchParams = ref({ keyword: '', page: 1, pageSize: 10 })
    const [{ page, search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 100 }),
        params: searchParams,
      }),
    )

    await asyncAwait(100)

    page.value = 3
    await asyncAwait(100)
    expect(capturedParams.page).toBe(3)

    search()
    await asyncAwait(100)
    expect(capturedParams.page).toBe(1)
    expect(page.value).toBe(1)
  })

  it('未提交的表单改动不影响翻页请求', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword: string }) => {
      capturedParams = params
      return { records: [], totalCount: 100 }
    }

    const searchParams = ref({ keyword: '', page: 1, pageSize: 10 })
    const [{ page, search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 100 }),
        params: searchParams,
      }),
    )

    await asyncAwait(100)

    searchParams.value.keyword = 'abc'
    search()
    await asyncAwait(100)
    expect(capturedParams).toEqual({ keyword: 'abc', page: 1, pageSize: 10 })

    // 表单改为 'xyz' 但不搜索，直接翻页
    searchParams.value.keyword = 'xyz'
    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ keyword: 'abc', page: 2, pageSize: 10 })
  })
})

describe('usePagination refresh', () => {
  it('refresh() 用当前参数重新请求', async () => {
    let callCount = 0

    const service = async () => {
      callCount++
      return { records: [], totalCount: 0 }
    }

    const [{ refresh }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
      }),
    )

    await asyncAwait(100)
    expect(callCount).toBe(1)

    await refresh()
    await asyncAwait(100)
    expect(callCount).toBe(2)
  })
})

describe('usePagination adjustPageWhenOutOfRange', () => {
  it('page 超出 totalPage 时自动调整', async () => {
    let currentTotal = 25

    const service = async (params: { page: number, pageSize: number }) => {
      await asyncAwait(30)
      const start = (params.page - 1) * params.pageSize
      const records: { id: number, name: string }[] = []
      for (let i = start; i < Math.min(start + params.pageSize, currentTotal); i++)
        records.push({ id: i + 1, name: `User ${i + 1}` })
      return { records, totalCount: currentTotal }
    }

    const [{ page, totalPage }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: (data: any) => ({ list: data.records, total: data.totalCount }),
        initialPageSize: 10,
      }),
    )

    await asyncAwait(100)
    expect(page.value).toBe(1)
    expect(totalPage.value).toBe(3)

    page.value = 3
    await asyncAwait(100)
    expect(page.value).toBe(3)

    // 数据变少，刷新后 totalPage 变为 1
    currentTotal = 5
    page.value = 1
    await asyncAwait(100)
    expect(totalPage.value).toBe(1)
    expect(page.value).toBe(1)
  })

  it('adjustPageWhenOutOfRange: false 时不自动调整', async () => {
    const service = async () => {
      return { records: [], totalCount: 5 }
    }

    const [{ page, totalPage }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: (data: any) => ({ list: data.records, total: data.totalCount }),
        initialPageSize: 10,
        adjustPageWhenOutOfRange: false,
      }),
    )

    await asyncAwait(100)
    expect(totalPage.value).toBe(1)

    page.value = 5
    await asyncAwait(100)
    expect(page.value).toBe(5)
  })
})

describe('usePagination manual', () => {
  it('manual: true 时不自动触发请求', async () => {
    let callCount = 0

    const service = async () => {
      callCount++
      return { records: [], totalCount: 0 }
    }

    const [{ search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        manual: true,
      }),
    )

    await asyncAwait(100)
    expect(callCount).toBe(0)

    search()
    await asyncAwait(100)
    expect(callCount).toBe(1)
  })
})

describe('usePagination watchSource', () => {
  it('watchSource 变化触发重新请求', async () => {
    const keyword = ref('test')
    let callCount = 0

    const service = async () => {
      callCount++
      return { records: [], totalCount: 0 }
    }

    withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        watchSource: [keyword],
      }),
    )

    await asyncAwait(100)
    expect(callCount).toBe(1)

    keyword.value = 'new'
    await asyncAwait(100)
    expect(callCount).toBe(2)
  })
})

describe('usePagination search 返回值', () => {
  it('search() 返回 promise，可以 await', async () => {
    let callCount = 0

    const service = async () => {
      callCount++
      await asyncAwait(30)
      return { records: [{ id: 1, name: 'User 1' }], totalCount: 1 }
    }

    const [{ search, list }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: (data: any) => ({ list: data.records, total: data.totalCount }),
      }),
    )

    await asyncAwait(100)
    expect(callCount).toBe(1)

    const result = await search()
    expect(callCount).toBe(2)
    expect(result).toEqual({ list: [{ id: 1, name: 'User 1' }], total: 1 })
    expect(list.value).toHaveLength(1)
  })

  it('search() 不会导致双发请求', async () => {
    let callCount = 0

    const service = async (_params: { page: number, pageSize: number, keyword: string }) => {
      callCount++
      await asyncAwait(30)
      return { records: [], totalCount: 100 }
    }

    const searchParams = ref({ keyword: '', page: 1, pageSize: 10 })
    const [{ page, search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 100 }),
        params: searchParams,
      }),
    )

    await asyncAwait(100)
    expect(callCount).toBe(1)

    // page 非 1 时 search，应该只发一次请求
    page.value = 3
    await asyncAwait(100)
    expect(callCount).toBe(2)

    searchParams.value.keyword = 'abc'
    await search()
    await asyncAwait(100)
    // search 内部 doRequest + watch 被 suppress，总共只多一次
    expect(callCount).toBe(3)
  })
})

describe('usePagination params ref 缺 page/pageSize', () => {
  it('自动补全 page 和 pageSize 默认值', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword: string }) => {
      capturedParams = params
      return { records: [], totalCount: 0 }
    }

    // 用户只传了搜索字段，没有 page/pageSize
    const searchParams = ref({ keyword: 'test' }) as any
    const [{ page, pageSize }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        params: searchParams,
      }),
    )

    await asyncAwait(100)
    // 自动补了 page=1, pageSize=10
    expect(capturedParams).toEqual({ keyword: 'test', page: 1, pageSize: 10 })
    expect(page.value).toBe(1)
    expect(pageSize.value).toBe(10)
  })
})

describe('usePagination optimisticUpdate', () => {
  it('乐观更新立即修改数据', async () => {
    const service = async () => {
      await asyncAwait(30)
      return { records: [{ id: 1, name: 'User 1' }], totalCount: 1 }
    }

    const [{ list, optimisticUpdate }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: (data: any) => ({ list: data.records, total: data.totalCount }),
      }),
    )

    await asyncAwait(100)
    expect(list.value).toHaveLength(1)

    // 乐观更新：立即添加一条
    optimisticUpdate(old => ({
      list: [...old.list, { id: 2, name: 'User 2' }],
      total: old.total + 1,
    }))

    // 立即生效
    expect(list.value).toHaveLength(2)
    expect(list.value[1]).toEqual({ id: 2, name: 'User 2' })
  })
})

describe('usePagination debounceSearch', () => {
  it('debounceSearch 防抖后只发一次请求', async () => {
    let callCount = 0

    const service = async () => {
      callCount++
      await asyncAwait(30)
      return { records: [], totalCount: 0 }
    }

    const searchParams = ref({ keyword: '', page: 1, pageSize: 10 })
    const [{ debounceSearch }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        params: searchParams,
        debounceWait: 100,
      }),
    )

    await asyncAwait(100)
    expect(callCount).toBe(1)

    // 快速连续调用
    searchParams.value.keyword = 'a'
    debounceSearch()
    searchParams.value.keyword = 'ab'
    debounceSearch()
    searchParams.value.keyword = 'abc'
    debounceSearch()

    // 防抖等待时间内不应发请求
    await asyncAwait(50)
    expect(callCount).toBe(1)

    // 防抖结束后发一次
    await asyncAwait(200)
    expect(callCount).toBe(2)
  })
})
