import { describe, expect, it } from 'vitest'
import { useRequest } from '../../src/hooks'
import { asyncAwait, withSetup } from '../utils.ts'

describe('useRequest 基础用法', () => {
  it('自动执行 service，正确返回 data', async () => {
    const service = async () => {
      await asyncAwait(30)
      return { name: 'Alice' }
    }

    const [{ data, loading, finished }] = withSetup(() => useRequest(service))

    expect(loading.value).toBe(true)
    expect(finished.value).toBe(false)

    await asyncAwait(100)
    expect(data.value).toEqual({ name: 'Alice' })
    expect(loading.value).toBe(false)
    expect(finished.value).toBe(true)
  })

  it('请求失败时 error 被正确设置', async () => {
    const service = async () => {
      await asyncAwait(20)
      throw new Error('fail')
    }

    const [{ error, data }] = withSetup(() => useRequest(service))

    await asyncAwait(100)
    expect(error.value).toBeInstanceOf(Error)
    expect((error.value as Error).message).toBe('fail')
    expect(data.value).toBeUndefined()
  })

  it('service 参数通过 run 传入并记录在 params 中', async () => {
    let captured: any[] = []
    const service = async (id: number, name: string) => {
      await asyncAwait(20)
      captured = [id, name]
      return `${id}-${name}`
    }

    const [{ run, params, data }] = withSetup(() =>
      useRequest(service, { manual: true }),
    )

    await run(1, 'Alice')
    await asyncAwait(50)
    expect(captured).toEqual([1, 'Alice'])
    expect(params.value).toEqual([1, 'Alice'])
    expect(data.value).toBe('1-Alice')
  })
})

describe('useRequest 手动执行', () => {
  it('manual: true 时不自动执行', async () => {
    let called = false
    const service = async () => {
      called = true
      return 'ok'
    }

    const [{ data, loading }] = withSetup(() =>
      useRequest(service, { manual: true }),
    )

    await asyncAwait(50)
    expect(called).toBe(false)
    expect(data.value).toBeUndefined()
    expect(loading.value).toBe(false)
  })

  it('run 手动触发执行 (静默模式，报错不抛异常)', async () => {
    const service = async () => {
      await asyncAwait(30)
      throw new Error('fail')
    }

    const [{ run, error }] = withSetup(() =>
      useRequest(service, { manual: true }),
    )

    // 不会抛错
    await run()
    expect(error.value).toBeInstanceOf(Error)
  })

  it('runAsync 手动触发执行 (Promise 模式，正确返回数据或抛出异常)', async () => {
    const successService = async () => {
      await asyncAwait(20)
      return 'done-data'
    }

    const [{ runAsync }] = withSetup(() =>
      useRequest(successService, { manual: true }),
    )

    const res = await runAsync()
    expect(res).toBe('done-data')

    const failService = async () => {
      await asyncAwait(20)
      throw new Error('async-fail')
    }

    const [{ runAsync: runAsyncFail }] = withSetup(() =>
      useRequest(failService, { manual: true }),
    )

    await expect(runAsyncFail()).rejects.toThrow('async-fail')
  })

  it('refresh 使用上次参数重新请求', async () => {
    let count = 0
    const service = async (id: number) => {
      await asyncAwait(20)
      count++
      return { id, count }
    }

    const [{ run, refresh, data }] = withSetup(() =>
      useRequest(service, { manual: true }),
    )

    await run(42)
    await asyncAwait(50)
    expect(data.value).toEqual({ id: 42, count: 1 })

    await refresh()
    await asyncAwait(50)
    expect(data.value).toEqual({ id: 42, count: 2 })
  })

  it('defaultParams 自动传入 service', async () => {
    let captured: any[] = []
    const service = async (id: number, name: string) => {
      await asyncAwait(20)
      captured = [id, name]
      return 'ok'
    }

    withSetup(() =>
      useRequest(service, { defaultParams: [1, 'Alice'] }),
    )

    await asyncAwait(100)
    expect(captured).toEqual([1, 'Alice'])
  })
})

describe('useRequest loading', () => {
  it('如果服务在 loadingDelay 内返回，loading 始终为 false', async () => {
    const fastService = async (): Promise<string> => {
      await asyncAwait(100)
      return 'ok'
    }

    const [{ loading }] = withSetup(() =>
      useRequest(fastService, {
        loadingDelay: 200,
      }),
    )

    expect(loading.value).toBe(false)
    await asyncAwait(50)
    expect(loading.value).toBe(false)

    await asyncAwait(100)
    expect(loading.value).toBe(false)
  })

  it('如果服务耗时大于 loadingDelay，loading 会在延迟后变为 true', async () => {
    const slowService = async (): Promise<string> => {
      await asyncAwait(300)
      return 'ok'
    }

    const [{ loading }] = withSetup(() =>
      useRequest(slowService, {
        loadingDelay: 100,
      }),
    )

    expect(loading.value).toBe(false)

    await asyncAwait(150)
    expect(loading.value).toBe(true)

    await asyncAwait(200)
    expect(loading.value).toBe(false)
  })

  it('使用 loadingKeep 保证 loading 至少显示指定时长 (防闪烁)', async () => {
    const veryFastService = async (): Promise<string> => {
      await asyncAwait(50)
      return 'ok'
    }

    const [{ loading }] = withSetup(() =>
      useRequest(veryFastService, {
        loadingKeep: 300,
      }),
    )

    expect(loading.value).toBe(true)

    await asyncAwait(100)
    expect(loading.value).toBe(true)

    await asyncAwait(250)
    expect(loading.value).toBe(false)
  })

  it('loadingDelay 和 loadingKeep 组合使用', async () => {
    const service = async (): Promise<string> => {
      await asyncAwait(200)
      return 'ok'
    }

    const [{ loading }] = withSetup(() =>
      useRequest(service, {
        loadingDelay: 100,
        loadingKeep: 300,
      }),
    )

    expect(loading.value).toBe(false)

    await asyncAwait(150)
    expect(loading.value).toBe(true)

    await asyncAwait(100)
    expect(loading.value).toBe(true)

    await asyncAwait(200)
    expect(loading.value).toBe(false)
  })
})

describe('useRequest 取消请求', () => {
  it('cancel 取消正在进行的请求，不更新 data', async () => {
    const service = async () => {
      await asyncAwait(100)
      return 'result'
    }

    const [{ run, cancel, data, loading }] = withSetup(() =>
      useRequest(service, { manual: true }),
    )

    run()
    await asyncAwait(20)
    expect(loading.value).toBe(true)

    cancel()
    await asyncAwait(150)
    expect(data.value).toBeUndefined()
    expect(loading.value).toBe(false)
  })
})
