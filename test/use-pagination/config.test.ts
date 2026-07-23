import { describe, expect, it } from 'vitest'
import { usePagination } from '../../src/hooks'
import { asyncAwait, withSetup } from '../utils.ts'
import { UserItem, ApiResponse, mockService, dataSerializer } from './helpers.ts'

const TOTAL = 25

describe('usePagination dataSerializer', () => {
  it('自定义 dataSerializer 提取非标准字段', async () => {
    interface ApiResp { items: string[], count: number }
    const service = async (_params: { page: number, pageSize: number }): Promise<ApiResp> => ({
      items: ['a', 'b', 'c'],
      count: 3,
    })

    const [{ list, total, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: data => ({ list: data.items, total: data.count }),
      }),
    )

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(list.value).toEqual(['a', 'b', 'c'])
    expect(total.value).toBe(3)
  })

  it('dataSerializer 可以对列表项做转换', async () => {
    interface Raw { ids: number[], total: number }
    const service = async (_params: { page: number, pageSize: number }): Promise<Raw> => ({ ids: [1, 2, 3], total: 3 })

    const [{ list, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: data => ({
          list: data.ids.map(id => ({ id, label: `Item ${id}` })),
          total: data.total,
        }),
      }),
    )

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(list.value).toEqual([
      { id: 1, label: 'Item 1' },
      { id: 2, label: 'Item 2' },
      { id: 3, label: 'Item 3' },
    ])
  })
})

describe('usePagination formatList', () => {
  it('对列表项做格式化，total 保持不变', async () => {
    const [{ list, total, run }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        formatList: list => list.map(item => ({ ...item, name: item.name.toUpperCase() })),
      }),
    )

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(list.value).toHaveLength(10)
    expect(list.value[0]).toEqual({ id: 1, name: 'USER 1' })
    expect(list.value[9]).toEqual({ id: 10, name: 'USER 10' })
    expect(total.value).toBe(TOTAL)
  })

  it('转换列表项类型', async () => {
    const [{ list, total, run }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        initialPageSize: 5,
        formatList: list => list.map(item => ({ label: `${item.id}-${item.name}` })),
      }),
    )

    run({ page: 1, pageSize: 5 })
    await asyncAwait(100)
    expect(list.value).toHaveLength(5)
    expect(list.value[0]).toEqual({ label: '1-User 1' })
    expect(total.value).toBe(TOTAL)
  })

  it('过滤列表项', async () => {
    const [{ list, total, run }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        formatList: list => list.filter(item => item.id > 5),
      }),
    )

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(list.value).toHaveLength(5)
    expect(list.value[0].id).toBe(6)
    expect(total.value).toBe(TOTAL) // total 不受过滤影响
  })

  it('翻页后 formatList 仍然生效', async () => {
    const [{ list, page, run }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        initialPageSize: 5,
        formatList: list => list.map(item => ({ ...item, name: item.name.toUpperCase() })),
      }),
    )

    run({ page: 1, pageSize: 5 })
    await asyncAwait(100)
    expect(list.value[0]).toEqual({ id: 1, name: 'USER 1' })

    page.value = 2
    await asyncAwait(100)
    expect(list.value[0]).toEqual({ id: 6, name: 'USER 6' })
  })

  it('不传 formatList 时列表保持原样', async () => {
    const [{ list, total, run }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        initialPageSize: 5,
      }),
    )

    run({ page: 1, pageSize: 5 })
    await asyncAwait(100)
    expect(list.value).toHaveLength(5)
    expect(list.value[0]).toEqual({ id: 1, name: 'User 1' })
    expect(total.value).toBe(TOTAL)
  })

  it('formatList 抛错时 error 被正确设置', async () => {
    const [{ error, list, run }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        formatList: (list) => {
          return list.map((item) => {
            if (item.id > 8) throw new Error('id too large')
            return item
          })
        },
        onError: () => {},
      }),
    )

    run({ page: 1, pageSize: 10 }).catch(() => {})
    await asyncAwait(100)
    expect(error.value).toBeInstanceOf(Error)
    expect((error.value as Error).message).toBe('id too large')
    expect(list.value).toHaveLength(0)
  })

  it('formatList 可以添加额外字段', async () => {
    const [{ list, run }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        formatList: list => list.map(item => ({
          ...item,
          displayName: `[${item.id}] ${item.name}`,
        })),
      }),
    )

    run({ page: 1, pageSize: 3 })
    await asyncAwait(100)
    expect(list.value[0].displayName).toBe('[1] User 1')
    expect(list.value[2].displayName).toBe('[3] User 3')
  })

  it('formatList 接收到正确的 rawData 和 params', async () => {
    let capturedRawData: any = null
    let capturedParams: any = null

    const [{ run }] = withSetup(() =>
      usePagination(mockService, {
        dataSerializer,
        initialPageSize: 5,
        formatList: (list, rawData, params) => {
          capturedRawData = rawData
          capturedParams = params
          return list
        },
      }),
    )

    run({ page: 2, pageSize: 5 })
    await asyncAwait(100)
    expect(capturedRawData).toEqual({
      records: expect.any(Array),
      totalCount: TOTAL,
    })
    // params 是对象形式
    expect(capturedParams).toEqual({ page: 2, pageSize: 5 })
  })

  it('空列表时 formatList 仍被调用', async () => {
    const emptyService = async (): Promise<ApiResponse> => ({
      records: [],
      totalCount: 0,
    })

    let formatCalled = false
    const [{ list, total, run }] = withSetup(() =>
      usePagination(emptyService, {
        dataSerializer,
        formatList: (list) => {
          formatCalled = true
          return list.map(item => ({ ...item, name: item.name.toUpperCase() }))
        },
      }),
    )

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(formatCalled).toBe(true)
    expect(list.value).toHaveLength(0)
    expect(total.value).toBe(0)
  })

  it('formatList 与 paginationFields 配合', async () => {
    let capturedParams: any = null

    const service = async (params: { current: number, size: number }) => {
      capturedParams = params
      const start = (params.current - 1) * params.size
      const records: UserItem[] = []
      for (let i = start; i < Math.min(start + params.size, TOTAL); i++)
        records.push({ id: i + 1, name: `User ${i + 1}` })
      return { records, totalCount: TOTAL }
    }

    const [{ list, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: (data: any) => ({ list: data.records, total: data.totalCount }),
        paginationFields: { page: 'current', pageSize: 'size' },
        initialPageSize: 5,
        formatList: list => list.map(item => ({ ...item, name: item.name.toUpperCase() })),
      }),
    )

    run({ current: 1, size: 5 })
    await asyncAwait(100)
    expect(list.value).toHaveLength(5)
    expect(list.value[0]).toEqual({ id: 1, name: 'USER 1' })
    expect(capturedParams).toEqual({ current: 1, size: 5 })
  })
})

describe('usePagination paginationFields', () => {
  it('自定义分页参数序列化 (current/size)', async () => {
    let capturedParams: any = {}

    const service = async (params: { current: number, size: number }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page, pageSize, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        paginationFields: { page: 'current', pageSize: 'size' },
      }),
    )

    run({ current: 1, size: 10 })
    await asyncAwait(100)
    expect(capturedParams).toEqual({ current: 1, size: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ current: 2, size: 10 })

    pageSize.value = 15
    await asyncAwait(100)
    expect(capturedParams).toEqual({ current: 1, size: 15 })
  })

  it('默认 paginationFields 使用 page/pageSize', async () => {
    let capturedParams: any = {}

    const service = async (params: { page: number, pageSize: number }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
      }),
    )

    run({ page: 1, pageSize: 10 })
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 1, pageSize: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ page: 2, pageSize: 10 })
  })

  it('paginationFields 与查询参数合并', async () => {
    let capturedParams: any = {}

    const service = async (params: { name: string, status: string, current: number, size: number }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        paginationFields: { page: 'current', pageSize: 'size' },
        defaultParams: { name: 'test', status: 'active', current: 1, size: 10 },
      }),
    )

    run({ name: 'test', status: 'active', current: 1, size: 10 })
    await asyncAwait(100)
    expect(capturedParams).toEqual({ name: 'test', status: 'active', current: 1, size: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ name: 'test', status: 'active', current: 2, size: 10 })
  })

  it('paginationFields 覆盖查询参数中的分页字段', async () => {
    let capturedParams: any = {}

    const service = async (params: { name: string, current: number, size: number }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        paginationFields: { page: 'current', pageSize: 'size' },
        defaultParams: { name: 'test', current: 99, size: 99 },
      }),
    )

    run({ name: 'test', current: 1, size: 10 })
    await asyncAwait(100)
    expect(capturedParams).toEqual({ name: 'test', current: 1, size: 10 })

    page.value = 3
    await asyncAwait(100)
    expect(capturedParams).toEqual({ name: 'test', current: 3, size: 10 })
  })

  it('paginationFields 只映射分页字段', async () => {
    let capturedParams: any = {}

    const service = async (params: { name: string, page: number, pageSize: number, sort?: string }) => {
      capturedParams = params
      return { list: [] as UserItem[], total: 0 }
    }

    const [{ page, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 0 }),
        paginationFields: { page: 'page', pageSize: 'pageSize' },
        defaultParams: { name: 'test', page: 1, pageSize: 10, sort: 'name' },
      }),
    )

    run({ name: 'test', page: 1, pageSize: 10, sort: 'name' })
    await asyncAwait(100)
    expect(capturedParams).toEqual({ name: 'test', page: 1, pageSize: 10, sort: 'name' })

    page.value = 2
    await asyncAwait(100)
    expect(capturedParams).toEqual({ name: 'test', page: 2, pageSize: 10, sort: 'name' })
  })

  it('翻页时自动注入分页参数', async () => {
    const paramsList: any[] = []

    const service = async (params: { current: number, size: number }) => {
      paramsList.push(params)
      return { list: [] as UserItem[], total: 100 }
    }

    const [{ page, pageSize, run }] = withSetup(() =>
      usePagination(service, {
        dataSerializer: () => ({ list: [], total: 100 }),
        paginationFields: { page: 'current', pageSize: 'size' },
      }),
    )

    // usePagination auto-triggers first request on init (manual: false by default)
    run({ current: 1, size: 10 })
    await asyncAwait(100)
    expect(paramsList).toHaveLength(2)
    expect(paramsList[0]).toEqual({ current: 1, size: 10 })
    expect(paramsList[1]).toEqual({ current: 1, size: 10 })

    page.value = 2
    await asyncAwait(100)
    expect(paramsList).toHaveLength(3)
    expect(paramsList[2]).toEqual({ current: 2, size: 10 })

    pageSize.value = 20
    await asyncAwait(100)
    expect(paramsList).toHaveLength(4)
    expect(paramsList[3]).toEqual({ current: 1, size: 20 })
  })
})
