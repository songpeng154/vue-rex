import type { ApiResponse, UserItem } from './helpers.ts'
import { describe, expect, it } from 'vitest'
import { usePagination } from '../../src/hooks'
import { asyncAwait, withSetup } from '../utils.ts'
import { dataSerializer, mockService } from './helpers.ts'

describe('usePagination 基础分页', () => {
  it('正确返回 list / total / page / pageSize', async () => {
    const [{ list, page, pageSize, total, totalPage, isLastPage, run }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        initialPage: 1,
        initialPageSize: 10,
      }),
    )

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(list.value).toHaveLength(10)
    expect(list.value[0]).toEqual({ id: 1, name: 'User 1' })
    expect(page.value).toBe(1)
    expect(pageSize.value).toBe(10)
    expect(total.value).toBe(25)
    expect(totalPage.value).toBe(3)
    expect(isLastPage.value).toBe(false)
  })

  it('默认兼容 { list, total } 结构', async () => {
    interface DefaultResponse { list: UserItem[], total: number }
    const defaultService = async (params: { page: number, pageSize: number }): Promise<DefaultResponse> => {
      const start = (params.page - 1) * params.pageSize
      return {
        list: [{ id: start + 1, name: `User ${start + 1}` }],
        total: 5,
      }
    }

    const [{ list, total, run }] = withSetup(() => usePagination(defaultService, {
      dataSerializer: data => ({ list: data.list, total: data.total }),
    }))
    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(list.value).toHaveLength(1)
    expect(total.value).toBe(5)
  })

  it('请求失败时 error 被正确设置', async () => {
    const failService = async (params: { page: number, pageSize: number }): Promise<ApiResponse> => {
      await asyncAwait(20)
      if (params.page > 1) throw new Error('Page not found')
      return { records: [{ id: 1, name: 'User 1' }], totalCount: 1 }
    }

    const [{ error, page, run }] = withSetup(() =>
      usePagination(failService, {
        dataSerializer,
        onError: () => {},
      }),
    )

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(error.value).toBeUndefined()

    page.value = 2
    await asyncAwait(100)
    expect(error.value).toBeInstanceOf(Error)
    expect((error.value as Error).message).toBe('Page not found')
  })
})

describe('usePagination params 类型', () => {
  it('run 参数是对象形式', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
      }),
    )

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })
  })

  it('defaultParams 直接传对象', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        defaultParams: { page: 1, pageSize: 10 },
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    run({ page: 2, pageSize: 20 })
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })
  })

  it('params 返回值是对象形式', async () => {
    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ params, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
      }),
    )

    await asyncAwait(200)
    expect(params.value).toEqual({ page: 1, pageSize: 10 })

    run({ page: 2, pageSize: 20 })
    await asyncAwait(200)
    expect(params.value).toEqual({ page: 2, pageSize: 20 })
  })

  it('onSuccess 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        onSuccess: (_data, _rawData, params) => {
          capturedParams = params
        },
      }),
    )

    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    run({ page: 2, pageSize: 20 })
    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 2, pageSize: 20 })
  })

  it('onError 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      throw new Error('request failed')
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        onError: (_error, params) => {
          capturedParams = params
        },
      }),
    )

    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    run({ page: 2, pageSize: 20 })
    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 2, pageSize: 20 })
  })

  it('onBefore 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        onBefore: (params) => {
          capturedParams = params
        },
      }),
    )

    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    run({ page: 2, pageSize: 20 })
    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 2, pageSize: 20 })
  })

  it('onFinally 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        onFinally: (params) => {
          capturedParams = params
        },
      }),
    )

    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    run({ page: 2, pageSize: 20 })
    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 2, pageSize: 20 })
  })

  it('formatList 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [{ id: 1, name: 'Alice' }] as UserItem[], total: 1 }
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: data => ({ list: data.list, total: data.total }),
        formatList: (list, _rawData, params) => {
          capturedParams = params
          return list
        },
      }),
    )

    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    run({ page: 2, pageSize: 20 })
    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 2, pageSize: 20 })
  })

  it('defaultParams 与 paginationFields 同时使用', async () => {
    let capturedParams: any = {}

    const service = async (params: { current: number, size: number }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        paginationFields: { page: 'current', pageSize: 'size' },
        defaultParams: { current: 1, size: 10 },
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ current: 1, size: 10 })

    run({ current: 2, size: 20 })
    await asyncAwait(100)
    expect(capturedParams).toEqual({ current: 1, size: 10 })
  })

  it('params 与非分页参数合并', async () => {
    let capturedParams: any = {}

    const service = async (_params: { page: number, pageSize: number, keyword: string }) => {
      capturedParams = _params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
      }),
    )

    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    run({ page: 2, pageSize: 20, keyword: 'test' })
    await asyncAwait(200)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10, keyword: 'test' })
  })

  it('翻页时 paginationFields 自动注入分页参数', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword: string }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 100 }
    }

    const [{ run, page }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 100 }),
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    run({ page: 1, pageSize: 10, keyword: 'test' })
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10, keyword: 'test' })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 2, pageSize: 10, keyword: 'test' })
  })

  it('manual: true 时不自动触发请求', async () => {
    let callCount = 0

    const service = async (_params: { page: number, pageSize: number }) => {
      callCount++
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        manual: true,
      }),
    )

    await asyncAwait(100)
    expect(callCount).toBe(0)

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(callCount).toBe(1)
  })
})
