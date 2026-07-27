import { describe, expect, it } from 'vitest'
import { clearCache, useRequest } from '../../src/hooks'
import { asyncAwait, withSetup } from '../utils.ts'

describe('useRequest 缓存', () => {
  it('数据同步与缓存命中 (SWR)', async () => {
    let callCount = 0
    const mockService = async (id: number): Promise<string> => {
      callCount++
      await asyncAwait(50)
      return `Data ${id}`
    }

    const [{ data: data1 }] = withSetup(() =>
      useRequest(mockService, {
        defaultParams: [1],
        cacheKey: 'test-sync-key',
        staleTime: 200,
      }),
    )

    await asyncAwait(100)
    expect(callCount).toBe(1)
    expect(data1.value).toBe('Data 1')

    // 再次发一个相同 cacheKey 的请求
    const [{ data: data2, loading }] = withSetup(() =>
      useRequest(mockService, {
        defaultParams: [1],
        cacheKey: 'test-sync-key',
        staleTime: 200,
      }),
    )

    // 因为有了缓存，data 会立刻被赋予上一次的值
    expect(data2.value).toBe('Data 1')
    expect(callCount).toBe(1)

    // 在 staleTime 内认为是新鲜的，不会再发出请求
    await asyncAwait(100)
    expect(callCount).toBe(1)
    expect(loading.value).toBe(false)
  })

  it('相同 cacheKey 并发请求共享 Promise', async () => {
    let callCount = 0
    const mockService = async (): Promise<string> => {
      callCount++
      await asyncAwait(50)
      return 'Result'
    }

    const [{ data: data1 }] = withSetup(() =>
      useRequest(mockService, { cacheKey: 'test-concurrent-key' }),
    )

    const [{ data: data2 }] = withSetup(() =>
      useRequest(mockService, { cacheKey: 'test-concurrent-key' }),
    )

    await asyncAwait(100)

    expect(data1.value).toBe('Result')
    expect(data2.value).toBe('Result')
    // 两个实例，但底层只发一次请求
    expect(callCount).toBe(1)
  })

  it('使用 clearCache 清除缓存后会重新请求', async () => {
    let callCount = 0
    const mockService = async (): Promise<string> => {
      callCount++
      await asyncAwait(50)
      return 'Result'
    }

    const [{ data: data1 }] = withSetup(() =>
      useRequest(mockService, { cacheKey: 'test-clear-key', staleTime: 1000 }),
    )
    await asyncAwait(100)
    expect(callCount).toBe(1)
    expect(data1.value).toBe('Result')

    // 清除该缓存
    clearCache('test-clear-key')

    const [{ data: data2 }] = withSetup(() =>
      useRequest(mockService, { cacheKey: 'test-clear-key', staleTime: 1000 }),
    )

    // 缓存已清除，初始应该是 undefined
    expect(data2.value).toBeUndefined()

    await asyncAwait(100)
    expect(callCount).toBe(2)
    expect(data2.value).toBe('Result')
  })

  it('多实例数据共享与更新同步', async () => {
    let callCount = 0
    const mockService = async (val: string): Promise<string> => {
      callCount++
      await asyncAwait(50)
      return val
    }

    const [{ data: data1, run }] = withSetup(() =>
      useRequest(mockService, { cacheKey: 'test-sync-update-key', manual: true }),
    )

    await run('Apple')
    expect(data1.value).toBe('Apple')
    expect(callCount).toBe(1)

    // 第二个实例从缓存直接读取
    const [{ data: data2 }] = withSetup(() =>
      useRequest(mockService, { cacheKey: 'test-sync-update-key' }),
    )
    expect(data2.value).toBe('Apple')
  })

  it('缓存错误后不缓存结果', async () => {
    let callCount = 0
    const mockService = async (): Promise<string> => {
      callCount++
      if (callCount === 1)
        throw new Error('first call failed')
      return 'Success'
    }

    const [{ data, error, run }] = withSetup(() =>
      useRequest(mockService, { cacheKey: 'test-error-no-cache', manual: true }),
    )

    await run().catch(() => {})
    expect(error.value).toBeInstanceOf(Error)
    expect(data.value).toBeUndefined()

    // 第二次应该重新请求（不会使用错误的缓存）
    await run()
    expect(data.value).toBe('Success')
    expect(callCount).toBe(2)
  })
})

describe('useRequest 轮询', () => {
  it('pollingInterval 大于 0 时自动轮询', async () => {
    let callCount = 0
    const service = async () => {
      callCount++
      return callCount
    }

    withSetup(() =>
      useRequest(service, { pollingInterval: 80 }),
    )

    await asyncAwait(30)
    expect(callCount).toBe(1)

    await asyncAwait(100)
    expect(callCount).toBeGreaterThanOrEqual(2)
  })
})

describe('useRequest 防抖', () => {
  it('debounceRun 在指定时间内只执行一次', async () => {
    let callCount = 0
    const service = async () => {
      callCount++
      return callCount
    }

    const [{ debounceRun }] = withSetup(() =>
      useRequest(service, {
        manual: true,
        debounceWait: 100,
      }),
    )

    debounceRun()
    debounceRun()
    debounceRun()

    await asyncAwait(150)
    expect(callCount).toBe(1)
  })
})

describe('useRequest 节流', () => {
  it('throttleRun 在指定时间内只执行一次', async () => {
    let callCount = 0
    const service = async () => {
      callCount++
      return callCount
    }

    const [{ throttleRun }] = withSetup(() =>
      useRequest(service, {
        manual: true,
        throttleWait: 100,
      }),
    )

    throttleRun()
    throttleRun()
    throttleRun()

    await asyncAwait(50)
    expect(callCount).toBe(1)
  })
})

describe('useRequest 错误重试', () => {
  it('errorRetryCount 指定重试次数', async () => {
    let callCount = 0
    const service = async () => {
      callCount++
      await asyncAwait(20)
      if (callCount <= 2) throw new Error('fail')
      return 'ok'
    }

    const [{ data, error }] = withSetup(() =>
      useRequest(service, {
        errorRetryCount: 3,
        errorRetryInterval: 10,
      }),
    )

    await asyncAwait(300)
    expect(callCount).toBe(3)
    expect(data.value).toBe('ok')
    expect(error.value).toBeUndefined()
  })

  it('超过重试次数后 error 被设置', async () => {
    let callCount = 0
    const service = async () => {
      callCount++
      await asyncAwait(20)
      throw new Error('always fail')
    }

    const [{ error }] = withSetup(() =>
      useRequest(service, {
        errorRetryCount: 2,
        errorRetryInterval: 10,
      }),
    )

    await asyncAwait(300)
    // 初始 1 次 + 重试 2 次 = 3 次
    expect(callCount).toBe(3)
    expect(error.value).toBeInstanceOf(Error)
  })
})
