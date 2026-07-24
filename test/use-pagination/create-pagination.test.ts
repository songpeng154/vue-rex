import { describe, expect, it } from 'vitest'
import { createPagination } from '../../src'
import { asyncAwait, withSetup } from '../utils.ts'

interface UserItem { id: number, name: string }

const TOTAL = 12

function generateUsers(start: number, count: number): UserItem[] {
  const items: UserItem[] = []
  for (let i = start; i < Math.min(start + count, TOTAL); i++)
    items.push({ id: i + 1, name: `User ${i + 1}` })
  return items
}

describe('createPagination', () => {
  describe('基础用法', () => {
    it('提取 list 和 total 字段', async () => {
      const usePage = createPagination({ listKey: 'list', totalKey: 'total' })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { list: generateUsers(start, params.pageSize), total: TOTAL }
      }

      const [{ list, total }] = withSetup(() => usePage(service))
      await asyncAwait(100)

      expect(list.value).toHaveLength(10)
      expect(list.value[0]).toEqual({ id: 1, name: 'User 1' })
      expect(total.value).toBe(12)
    })

    it('空列表返回空数组和 0', async () => {
      const usePage = createPagination({ listKey: 'list', totalKey: 'total' })

      const service = async () => {
        return { list: [] as UserItem[], total: 0 }
      }

      const [{ list, total }] = withSetup(() => usePage(service))
      await asyncAwait(100)

      expect(list.value).toHaveLength(0)
      expect(total.value).toBe(0)
    })
  })

  describe('自定义 listKey / totalKey', () => {
    it('提取 records 和 totalCount', async () => {
      const usePage = createPagination({ listKey: 'records', totalKey: 'totalCount' })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { records: generateUsers(start, params.pageSize), totalCount: TOTAL }
      }

      const [{ list, total }] = withSetup(() => usePage(service, { initialPageSize: 5 }))
      await asyncAwait(100)

      expect(list.value).toHaveLength(5)
      expect(list.value[0]).toEqual({ id: 1, name: 'User 1' })
      expect(total.value).toBe(12)
    })

    it('提取 rows 和 count', async () => {
      const usePage = createPagination({ listKey: 'rows', totalKey: 'count' })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { rows: generateUsers(start, params.pageSize), count: TOTAL }
      }

      const [{ list, total }] = withSetup(() => usePage(service, { initialPageSize: 5 }))
      await asyncAwait(100)

      expect(list.value).toHaveLength(5)
      expect(total.value).toBe(12)
    })
  })

  describe('嵌套路径', () => {
    it('提取 data.records 和 data.total', async () => {
      const usePage = createPagination({ listKey: 'data.records', totalKey: 'data.total' })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { code: 0, data: { records: generateUsers(start, params.pageSize), total: TOTAL } }
      }

      const [{ list, total }] = withSetup(() => usePage(service, { initialPageSize: 5 }))
      await asyncAwait(100)

      expect(list.value).toHaveLength(5)
      expect(list.value[0]).toEqual({ id: 1, name: 'User 1' })
      expect(total.value).toBe(12)
    })

    it('路径不存在时返回空数组和 0', async () => {
      const usePage = createPagination({ listKey: 'data.items', totalKey: 'data.count' })

      const service = async () => {
        return { code: 0, data: null as any }
      }

      const [{ list, total }] = withSetup(() => usePage(service))
      await asyncAwait(100)

      expect(list.value).toHaveLength(0)
      expect(total.value).toBe(0)
    })
  })

  describe('paginationFields', () => {
    it('在 create 时配置，自动注入分页参数', async () => {
      let capturedParams: any = null

      const usePage = createPagination({
        listKey: 'list',
        totalKey: 'total',
        paginationFields: { page: 'current', pageSize: 'size' },
      })

      const service = async (params: { current: number, size: number }) => {
        capturedParams = params
        return { list: [] as UserItem[], total: 0 }
      }

      const [{ page }] = withSetup(() => usePage(service))
      await asyncAwait(100)
      expect(capturedParams).toEqual({ current: 1, size: 10 })

      page.value = 2
      await asyncAwait(100)
      expect(capturedParams).toEqual({ current: 2, size: 10 })
    })
  })

  describe('config.options 全局默认配置', () => {
    it('config.options 生效', async () => {
      const usePage = createPagination({
        listKey: 'list',
        totalKey: 'total',
        options: { initialPageSize: 5 },
      })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { list: generateUsers(start, params.pageSize), total: TOTAL }
      }

      const [{ list, pageSize }] = withSetup(() => usePage(service))
      await asyncAwait(100)

      expect(list.value).toHaveLength(5)
      expect(pageSize.value).toBe(5)
    })

    it('局部 options 覆盖 config.options', async () => {
      const usePage = createPagination({
        listKey: 'list',
        totalKey: 'total',
        options: { initialPageSize: 5 },
      })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { list: generateUsers(start, params.pageSize), total: TOTAL }
      }

      const [{ list, pageSize }] = withSetup(() =>
        usePage(service, { initialPageSize: 10 }),
      )

      await asyncAwait(100)

      expect(list.value).toHaveLength(10)
      expect(pageSize.value).toBe(10)
    })

    it('config.options 的 onSuccess 回调', async () => {
      let configSuccess = false

      const usePage = createPagination({
        listKey: 'list',
        totalKey: 'total',
        options: {
          onSuccess: () => { configSuccess = true },
        },
      })

      const service = async (_params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        return { list: [] as UserItem[], total: 0 }
      }

      withSetup(() => usePage(service))
      await asyncAwait(100)

      expect(configSuccess).toBe(true)
    })

    it('局部 onSuccess 覆盖 config.options 的 onSuccess', async () => {
      let configCalled = false
      let localCalled = false

      const usePage = createPagination({
        listKey: 'list',
        totalKey: 'total',
        options: {
          onSuccess: () => { configCalled = true },
        },
      })

      const service = async (_params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        return { list: [] as UserItem[], total: 0 }
      }

      withSetup(() =>
        usePage(service, {
          onSuccess: () => { localCalled = true },
        }),
      )
      await asyncAwait(100)

      expect(configCalled).toBe(false)
      expect(localCalled).toBe(true)
    })
  })

  describe('formatList 配合', () => {
    it('formatList 格式化列表项', async () => {
      const usePage = createPagination({ listKey: 'list', totalKey: 'total' })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { list: generateUsers(start, params.pageSize), total: TOTAL }
      }

      const [{ list, total }] = withSetup(() =>
        usePage(service, {
          initialPageSize: 5,
          formatList: items => items.map(item => ({ ...item, name: item.name.toUpperCase() })),
        }),
      )

      await asyncAwait(100)

      expect(list.value).toHaveLength(5)
      expect(list.value[0]).toEqual({ id: 1, name: 'USER 1' })
      expect(total.value).toBe(12)
    })

    it('formatList 转换类型', async () => {
      const usePage = createPagination({ listKey: 'list', totalKey: 'total' })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { list: generateUsers(start, params.pageSize), total: TOTAL }
      }

      const [{ list }] = withSetup(() =>
        usePage(service, {
          initialPageSize: 3,
          formatList: items => items.map(item => ({ label: `${item.id}-${item.name}` })),
        }),
      )

      await asyncAwait(100)

      expect(list.value).toHaveLength(3)
      expect(list.value[0]).toEqual({ label: '1-User 1' })
    })
  })

  describe('翻页交互', () => {
    it('翻页后数据更新', async () => {
      const usePage = createPagination({ listKey: 'list', totalKey: 'total' })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { list: generateUsers(start, params.pageSize), total: TOTAL }
      }

      const [{ list, page }] = withSetup(() =>
        usePage(service, { initialPageSize: 5 }),
      )

      await asyncAwait(100)
      expect(list.value[0]).toEqual({ id: 1, name: 'User 1' })

      page.value = 2
      await asyncAwait(100)
      expect(list.value[0]).toEqual({ id: 6, name: 'User 6' })
    })

    it('pageSize 变化后重置到第一页', async () => {
      const usePage = createPagination({ listKey: 'list', totalKey: 'total' })

      const service = async (params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        const start = (params.page - 1) * params.pageSize
        return { list: generateUsers(start, params.pageSize), total: TOTAL }
      }

      const [{ list, page, pageSize }] = withSetup(() =>
        usePage(service, { initialPageSize: 5 }),
      )

      await asyncAwait(100)
      page.value = 3
      await asyncAwait(100)
      expect(page.value).toBe(3)

      pageSize.value = 10
      await asyncAwait(100)
      expect(page.value).toBe(1)
      expect(list.value).toHaveLength(10)
    })
  })

  describe('不同 service 复用同一 usePage', () => {
    it('不同 service 返回不同类型，各自正确提取', async () => {
      const usePage = createPagination({ listKey: 'list', totalKey: 'total' })

      const getUserList = async (_params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        return {
          list: [{ id: 1, name: 'Alice' }] as UserItem[],
          total: 1,
        }
      }

      interface PostItem { postId: string, title: string }

      const getPostList = async (_params: { page: number, pageSize: number }) => {
        await asyncAwait(30)
        return {
          list: [{ postId: 'p1', title: 'Hello' }] as PostItem[],
          total: 1,
        }
      }

      const [{ list: userList }] = withSetup(() => usePage(getUserList))
      await asyncAwait(100)
      expect(userList.value[0]).toEqual({ id: 1, name: 'Alice' })

      const [{ list: postList }] = withSetup(() => usePage(getPostList))
      await asyncAwait(100)
      expect(postList.value[0]).toEqual({ postId: 'p1', title: 'Hello' })
    })
  })

  describe('组合配置', () => {
    it('listKey + totalKey + paginationFields 同时生效', async () => {
      let capturedParams: any = null

      const usePage = createPagination({
        listKey: 'data.records',
        totalKey: 'data.count',
        paginationFields: { page: 'current', pageSize: 'size' },
      })

      const service = async (params: { current: number, size: number }) => {
        capturedParams = params
        await asyncAwait(30)
        const start = (params.current - 1) * params.size
        return { code: 0, data: { records: generateUsers(start, params.size), count: TOTAL } }
      }

      const [{ list, total, page }] = withSetup(() => usePage(service, { initialPageSize: 5 }))
      await asyncAwait(100)

      expect(capturedParams).toEqual({ current: 1, size: 5 })
      expect(list.value).toHaveLength(5)
      expect(list.value[0]).toEqual({ id: 1, name: 'User 1' })
      expect(total.value).toBe(12)

      page.value = 2
      await asyncAwait(100)
      expect(capturedParams).toEqual({ current: 2, size: 5 })
      expect(list.value[0]).toEqual({ id: 6, name: 'User 6' })
    })
  })
})
