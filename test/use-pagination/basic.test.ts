import type { ApiResponse, UserItem } from './helpers.ts'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { usePagination } from '../../src/hooks'
import { asyncAwait, withSetup } from '../utils.ts'
import { dataSerializer, mockService } from './helpers.ts'

describe('usePagination 基础分页', () => {
  it('初始化自动请求并返回 list / total / page / pageSize', async () => {
    const [{ list, page, pageSize, total, totalPage, isLastPage }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        initialPage: 1,
        initialPageSize: 10,
      }),
    )

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

    const [{ list, total }] = withSetup(() => usePagination(defaultService, {
      dataSerializer: data => ({ list: data.list, total: data.total }),
    }))
    await asyncAwait(100)
    expect(list.value).toHaveLength(1)
    expect(total.value).toBe(5)
  })

  it('修改 page 触发翻页请求', async () => {
    const [{ list, page }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        initialPageSize: 10,
      }),
    )

    await asyncAwait(100)
    expect(list.value[0]).toEqual({ id: 1, name: 'User 1' })

    page.value = 2
    await asyncAwait(100)
    expect(list.value).toHaveLength(10)
    expect(list.value[0]).toEqual({ id: 11, name: 'User 11' })
    expect(page.value).toBe(2)
  })

  it('修改 pageSize 触发请求且 page 重置为 1', async () => {
    const [{ list, page, pageSize }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        initialPageSize: 10,
      }),
    )

    await asyncAwait(100)
    page.value = 2
    await asyncAwait(100)
    expect(page.value).toBe(2)

    pageSize.value = 5
    await asyncAwait(100)
    expect(page.value).toBe(1)
    expect(pageSize.value).toBe(5)
    expect(list.value).toHaveLength(5)
    expect(list.value[0]).toEqual({ id: 1, name: 'User 1' })
  })

  it('请求失败时 error 被正确设置', async () => {
    const failService = async (params: { page: number, pageSize: number }): Promise<ApiResponse> => {
      await asyncAwait(20)
      if (params.page > 1) throw new Error('Page not found')
      return { records: [{ id: 1, name: 'User 1' }], totalCount: 1 }
    }

    const [{ error, page }] = withSetup(() =>
      usePagination(failService, {
        dataSerializer,
        onError: () => {},
      }),
    )

    await asyncAwait(100)
    expect(error.value).toBeUndefined()

    page.value = 2
    await asyncAwait(100)
    expect(error.value).toBeInstanceOf(Error)
    expect((error.value as Error).message).toBe('Page not found')
  })
})

describe('usePagination params 类型', () => {
  it('初始化自动请求时 service 收到对象形式参数', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })
  })

  it('params: ref({...}) 作为外部表单参数', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword?: string }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const formRef = ref({ page: 1, pageSize: 10, keyword: 'foo' })

    withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        params: formRef,
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10, keyword: 'foo' })
  })

  it('params 计算属性返回当前请求参数', async () => {
    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ params, page, pageSize }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
      }),
    )

    await asyncAwait(100)
    expect(params.value).toEqual({ page: 1, pageSize: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(params.value).toEqual({ page: 2, pageSize: 10 })

    pageSize.value = 20
    await asyncAwait(100)
    expect(params.value).toEqual({ page: 1, pageSize: 20 })
  })

  it('onSuccess 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        onSuccess: (_data, _rawData, params) => {
          capturedParams = params
        },
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 2, pageSize: 10 })
  })

  it('onError 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      throw new Error('request failed')
    }

    const [{ page }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        onError: (_error, params) => {
          capturedParams = params
        },
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 2, pageSize: 10 })
  })

  it('onBefore 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        onBefore: (params) => {
          capturedParams = params
        },
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 2, pageSize: 10 })
  })

  it('onFinally 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        onFinally: (params) => {
          capturedParams = params
        },
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 2, pageSize: 10 })
  })

  it('formatList 回调中 params 是对象形式', async () => {
    let capturedParams: any = null

    const service = async (_params: { page: number, pageSize: number }) => {
      return { list: [{ id: 1, name: 'Alice' }] as UserItem[], total: 1 }
    }

    const [{ page }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: data => ({ list: data.list, total: data.total }),
        formatList: (list, _rawData, params) => {
          capturedParams = params
          return list
        },
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 2, pageSize: 10 })
  })

  it('paginationFields 自定义字段名时 params 与请求参数一致', async () => {
    let capturedParams: any = {}

    const service = async (params: { current: number, size: number }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ params, page }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        paginationFields: { page: 'current', pageSize: 'size' },
        params: ref({ current: 1, size: 10 }),
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ current: 1, size: 10 })
    expect(params.value).toEqual({ current: 1, size: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ current: 2, size: 10 })
  })

  it('search 提交搜索字段并将 page 归 1', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword?: string }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page, search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 2, pageSize: 10 })

    search({ keyword: 'test' } as any)
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10, keyword: 'test' })
    expect(page.value).toBe(1)
  })

  it('search 无参时提交 params ref 当前表单值', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword?: string }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const formRef = ref({ page: 1, pageSize: 10, keyword: '' })

    const [{ search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        params: formRef,
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10, keyword: '' })

    formRef.value.keyword = 'hello'
    search()
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10, keyword: 'hello' })
  })

  it('翻页时保留已提交的搜索字段', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword?: string }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 100 }
    }

    const [{ page, search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 100 }),
      }),
    )

    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    search({ keyword: 'test' } as any)
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10, keyword: 'test' })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 2, pageSize: 10, keyword: 'test' })
  })

  it('refresh 使用当前参数重新请求', async () => {
    let callCount = 0
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number, keyword?: string }) => {
      callCount++
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page, refresh, search }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
      }),
    )

    await asyncAwait(100)
    expect(callCount).toBe(1)

    search({ keyword: 'foo' } as any)
    await asyncAwait(100)
    expect(callCount).toBe(2)

    await refresh()
    await asyncAwait(100)
    expect(callCount).toBe(3)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10, keyword: 'foo' })
    expect(page.value).toBe(1)
  })

  it('manual: true 时不自动触发请求', async () => {
    let callCount = 0

    const service = async (_params: { page: number, pageSize: number }) => {
      callCount++
      return { list: [] as UserItem[], total: 0 }
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
