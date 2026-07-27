import type { ApiResponse, UserInfo } from './helpers.ts'
import { describe, expect, it } from 'vitest'
import { useRequest } from '../../src/hooks'
import { asyncAwait, withSetup } from '../utils.ts'

describe('useRequest 数据突变', () => {
  it('mutate 直接修改 data', async () => {
    const service = async () => {
      await asyncAwait(20)
      return { name: 'Alice' }
    }

    const [{ data, mutate }] = withSetup(() => useRequest(service))
    await asyncAwait(100)
    expect(data.value).toEqual({ name: 'Alice' })

    mutate({ name: 'Bob' })
    expect(data.value).toEqual({ name: 'Bob' })
  })

  it('mutate 支持函数式更新', async () => {
    const service = async () => {
      await asyncAwait(20)
      return { count: 1 }
    }

    const [{ data, mutate }] = withSetup(() => useRequest(service))
    await asyncAwait(100)

    mutate(old => ({ count: old!.count + 1 }))
    expect(data.value).toEqual({ count: 2 })
  })
})

describe('useRequest 乐观更新', () => {
  it('optimisticUpdate 立即更新 data，请求失败后还原', async () => {
    let shouldFail = false
    const service = async (name: string) => {
      await asyncAwait(30)
      if (shouldFail) throw new Error('fail')
      return { name }
    }

    const [{ data, run, optimisticUpdate, error }] = withSetup(() =>
      useRequest(service, { manual: true }),
    )

    // 先成功一次，设置初始数据
    await run('Alice')
    await asyncAwait(50)
    expect(data.value).toEqual({ name: 'Alice' })

    // 乐观更新：立即生效
    shouldFail = true
    optimisticUpdate({ name: 'Bob' })
    expect(data.value).toEqual({ name: 'Bob' })

    // 请求失败后自动还原
    await asyncAwait(100)
    expect(error.value).toBeInstanceOf(Error)
    expect(data.value).toEqual({ name: 'Alice' })
  })
})

describe('useRequest rawData', () => {
  it('初始状态 rawData 为 undefined', async () => {
    const service = async () => {
      await asyncAwait(30)
      return { name: 'Alice' }
    }

    const [{ rawData, data }] = withSetup(() => useRequest(service))

    expect(rawData.value).toBeUndefined()
    expect(data.value).toBeUndefined()

    await asyncAwait(100)
  })

  it('无 dataSerializer 和 formatData 时，rawData 与 data 相同', async () => {
    const service = async () => {
      await asyncAwait(20)
      return { name: 'Alice', age: 25 }
    }

    const [{ rawData, data }] = withSetup(() => useRequest(service))

    await asyncAwait(100)
    expect(rawData.value).toEqual({ name: 'Alice', age: 25 })
    expect(data.value).toEqual({ name: 'Alice', age: 25 })
    expect(rawData.value).toBe(data.value)
  })

  it('仅使用 dataSerializer 时，rawData 是 service 返回的原始数据', async () => {
    const service = async (): Promise<ApiResponse<UserInfo>> => {
      await asyncAwait(20)
      return {
        code: 0,
        message: 'success',
        data: { id: 1, name: 'Alice', email: 'alice@example.com' },
      }
    }

    const [{ rawData, data }] = withSetup(() =>
      useRequest(service, {
        dataSerializer: res => res.data,
      }),
    )

    await asyncAwait(100)
    // rawData 是 service 返回的原始数据
    expect(rawData.value).toEqual({
      code: 0,
      message: 'success',
      data: { id: 1, name: 'Alice', email: 'alice@example.com' },
    })
    // data 是 dataSerializer 处理后的数据
    expect(data.value).toEqual({ id: 1, name: 'Alice', email: 'alice@example.com' })
  })

  it('仅使用 formatData 时，rawData 是原始数据', async () => {
    const service = async (): Promise<UserInfo> => {
      await asyncAwait(20)
      return { id: 1, name: 'Alice', email: 'alice@example.com' }
    }

    const [{ rawData, data }] = withSetup(() =>
      useRequest(service, {
        formatData: user => `Name: ${user.name}`,
      }),
    )

    await asyncAwait(100)
    // rawData 是 service 返回的原始数据
    expect(rawData.value).toEqual({ id: 1, name: 'Alice', email: 'alice@example.com' })
    // data 是 formatData 处理后的数据
    expect(data.value).toBe('Name: Alice')
  })

  it('同时使用 dataSerializer 和 formatData 时，rawData 是 service 返回的原始数据', async () => {
    const service = async (): Promise<ApiResponse<UserInfo>> => {
      await asyncAwait(20)
      return {
        code: 0,
        message: 'success',
        data: { id: 1, name: 'Alice', email: 'alice@example.com' },
      }
    }

    const [{ rawData, data }] = withSetup(() =>
      useRequest(service, {
        dataSerializer: res => res.data,
        formatData: user => `Name: ${user.name}, Email: ${user.email}`,
      }),
    )

    await asyncAwait(100)
    // rawData 是 service 返回的原始数据
    expect(rawData.value).toEqual({
      code: 0,
      message: 'success',
      data: { id: 1, name: 'Alice', email: 'alice@example.com' },
    })
    // data 是 formatData 处理后的数据（string）
    expect(data.value).toBe('Name: Alice, Email: alice@example.com')
  })

  it('请求失败时 rawData 保持之前的值', async () => {
    let shouldFail = false
    const service = async () => {
      await asyncAwait(20)
      if (shouldFail) throw new Error('request failed')
      return { name: 'Alice' }
    }

    const [{ rawData, data, error, run }] = withSetup(() =>
      useRequest(service, { manual: true }),
    )

    // 第一次请求成功
    await run()
    await asyncAwait(100)
    expect(rawData.value).toEqual({ name: 'Alice' })
    expect(data.value).toEqual({ name: 'Alice' })

    // 第二次请求失败
    shouldFail = true
    await run().catch(() => {})
    await asyncAwait(100)

    // 失败时 rawData 保持之前的值（因为 setState 只更新 error）
    expect(rawData.value).toEqual({ name: 'Alice' })
    expect(error.value).toBeInstanceOf(Error)
  })

  it('dataSerializer 返回不同类型时 rawData 是 service 返回的原始数据', async () => {
    interface RawResponse {
      list: number[]
      total: number
    }

    const service = async (): Promise<RawResponse> => {
      await asyncAwait(20)
      return { list: [1, 2, 3], total: 3 }
    }

    const [{ rawData, data }] = withSetup(() =>
      useRequest(service, {
        dataSerializer: res => res.list,
        formatData: list => list.map(n => n * 10),
      }),
    )

    await asyncAwait(100)
    // rawData 是 service 返回的原始数据
    expect(rawData.value).toEqual({ list: [1, 2, 3], total: 3 })
    // data 是 formatData 返回的 number[]
    expect(data.value).toEqual([10, 20, 30])
  })

  it('多次请求时 rawData 更新为最新结果', async () => {
    let counter = 0
    const service = async () => {
      await asyncAwait(20)
      return { count: ++counter }
    }

    const [{ rawData, data, refresh }] = withSetup(() =>
      useRequest(service, { manual: true }),
    )

    // 第一次请求
    await refresh()
    await asyncAwait(100)
    expect(rawData.value).toEqual({ count: 1 })

    // 第二次请求
    await refresh()
    await asyncAwait(100)
    expect(rawData.value).toEqual({ count: 2 })
    expect(data.value).toEqual({ count: 2 })
  })
})
