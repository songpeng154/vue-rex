import type { DebouncedFunction } from 'es-toolkit'
import type { EffectScope, MaybeRef, Ref, WatchSource } from 'vue'
import type { Undefinable, WrapWithComputed } from '../../types/utils.ts'
import type { CachedData } from './utils/cache.ts'

/**
 * service 函数类型
 * 直接返回 TData，出错抛异常（throw / reject）
 */
export type RequestServiceFn<
  TData = any,
  TParams extends any[] = any[],
> = (...args: TParams) => Promise<TData>

// 请求配置项
export interface RequestOptions<
  // 数据
  TData = any,
  // 方法参数
  TParams extends any[] = any[],
  // dataSerializer 返回的数据类型，未提供时等于 TData
  TSerialized = TData,
  // 格式化数据
  TFormatData = TSerialized,
  // 错误
  TError = any,
> {
  /**
   * data 初始的数据
   */
  initialData?: TFormatData

  /**
   * 传递给 service 的参数
   */
  defaultParams?: TParams

  /**
   * 手动执行
   * @desc  默认 false。 即在初始化时自动执行 service。如果设置为 true, 则需要手动调用 run 或 runAsync 触发执行
   * @default false
   */
  manual?: boolean

  /**
   * 当前请求是否准备好了,准备好后才可以发送请求
   * @default true
   */
  ready?: Ref<boolean>

  /**
   * 侦听一个或多个响应式数据源，如果传入 true 会自动收集 server 中的响应式数据源。当响应式数据源变化时会自动刷新服务
   */
  watchSource?: true | WatchSource | WatchSource[]

  /**
   * 是否深度观察，与 vue watch 中的 deep一致
   * @default false
   */
  watchDeep?: boolean

  /**
   * 窗口获取焦点的时候刷新请求
   * @default false
   */
  refreshOnWindowFocus?: MaybeRef<boolean>

  /**
   * 重新请求间隔（毫秒）
   * @default 5000ms
   */
  focusTimespan?: MaybeRef<number>

  /**
   * 指定 loading 的延时打开时间 (毫秒)，可以防止接口加载速度非常快，loading出现闪烁的情况
   */
  loadingDelay?: MaybeRef<number>

  /**
   * 可以让 loading 持续指定的时间 (毫秒)，可以防止 loading 一闪而过
   * 如果请求时间少于指定的时间，则最终时间为指定的时间
   * 如果请求时间大于指定的时间，则最终时间为请求的时间
   */
  loadingKeep?: MaybeRef<number>

  /**
   * 设置防抖等待时间 (毫秒)
   * @default 500ms
   */
  debounceWait?: MaybeRef<number>

  /**
   * 防抖允许被延迟的最大值
   */
  debounceMaxWait?: MaybeRef<number>

  /**
   * 在延迟开始前执行调用
   * @default false
   */
  debounceLeading?: MaybeRef<boolean>

  /**
   * 在延迟结束后执行调用
   * @default true
   */
  debounceTrailing?: MaybeRef<boolean>

  /**
   * 设置节流等待时间 (毫秒)
   * @default 500ms
   */
  throttleWait?: MaybeRef<number>

  /**
   * 在节流开始前执行调用
   * @default true
   */
  throttleLeading?: MaybeRef<boolean>

  /**
   * 在节流结束后执行调用
   * @default true
   */
  throttleTrailing?: MaybeRef<boolean>

  /**
   * 轮询间隔（毫秒），如果值大于 0，则启动轮询模式。
   * @default 0
   */
  pollingInterval?: MaybeRef<number>

  /**
   * 屏幕不可见时轮询，当 pollingInterval 大于 0 时才生效。
   * 默认情况下，轮询在屏幕不可见时，会暂停轮询。当设置成 true 时，在屏幕不可见时，轮询任务依旧会定时执行。
   * @default false
   */
  pollingWhenDocumentHidden?: MaybeRef<boolean>

  /**
   * 轮询错误重试次数。如果设置为 Infinity，则无限次
   * @default 3
   */
  pollingErrorRetryCount?: MaybeRef<number>

  /**
   * 错误重试次数。如果设置为 Infinity，则无限次重试。
   */
  errorRetryCount?: MaybeRef<number>

  /**
   * 重试时间间隔，单位为毫秒
   */
  errorRetryInterval?: MaybeRef<number>

  /**
   * 请求唯一标识。如果设置了 cacheKey，我们会启用缓存机制。同一个 cacheKey 的数据全局同步。
   */
  cacheKey?: string

  /**
   * 缓存过期时间（毫秒），超过该时间会自动清除该缓存数据。
   * 设置 Infinity 表示永不过期
   * @default 600000
   */
  cacheTime?: number

  /**
   * 设置数据保持新鲜时间，在该时间内，我们认为数据是新鲜的，不会重新发起请求。
   * 设置 Infinity 表示永不过期
   */
  staleTime?: number

  /**
   * 获取自定义缓存
   */
  getCache?: (cacheKey: string, params: TParams) => CachedData<TData, TParams, TSerialized, TFormatData>

  /**
   * 设置自定义缓存
   */
  setCache?: (cacheKey: string, cacheData: CachedData<TData, TParams, TSerialized, TFormatData>) => void

  /**
   * 从 service 返回的数据中提取真实数据
   * 在 formatData 之前执行，用于解包响应体
   *
   * @example
   * dataSerializer: (res) => res.data
   */
  dataSerializer?: (data: TData, params: TParams) => TSerialized

  /**
   * 将捕获到的原始错误转换为自定义错误类型
   *
   * @example
   * errorSerializer: (e, params) => ({
   *   code: e?.response?.status ?? -1,
   *   message: e?.message ?? String(e),
   * })
   */
  errorSerializer?: (error: unknown, params: TParams) => TError

  /**
   * 格式化数据
   * service resolve 后（经过 dataSerializer 提取后），对数据做二次处理
   * data 类型：有 dataSerializer 时为 TSerialized，否则为 TData
   * rawData 类型：service 返回的原始数据 TData
   */
  formatData?: (data: TSerialized, rawData: TData, params: TParams) => TFormatData

  /**
   * 请求之前执行
   * @param params 请求参数
   */
  onBefore?: (params: TParams) => void

  /**
   * 请求成功时执行
   * @param data 响应数据（经过 formatData 处理后）
   * @param rawData 原始响应数据
   * @param params 请求参数
   */
  onSuccess?: (
    data: TFormatData,
    rawData: TData,
    params: TParams,
  ) => void

  /**
   * 请求错误的时候执行（service throw / reject 时触发）
   * @param error 错误信息
   * @param params 请求参数
   */
  onError?: (
    error: TError,
    params: TParams,
  ) => void

  /**
   * 最后执行，不管 service 成功失败都会执行
   * @param params 参数
   */
  onFinally?: (params: TParams) => void

  /**
   * 当连续请求的时候，最后一个服务请求完成之后触发
   * @param params
   */
  onFinallyFetchDone?: (params: TParams) => void
}

export interface RequestState<
  // 数据
  TData = any,
  // 方法参数
  TParams extends any[] = any[],
  TSerialized = TData,
  // 格式化数据
  TFormatData = TSerialized,
  // 错误
  TError = any,
> {
  /**
   * service resolve 的数据,会经过 formatData 处理
   */
  data: Undefinable<TFormatData>

  /**
   * service resolve 的数据
   */
  rawData: Undefinable<TData>

  /**
   * service reject/throw 的错误
   */
  error: Undefinable<TError>

  /**
   * service 是否正在执行
   */
  loading: boolean

  /**
   * 请求是否已经完成
   */
  finished: boolean

  /**
   * 当次执行的 service 的参数数组
   */
  params: TParams
}

export interface RequestMethod<
  // 数据
  TData = any,
  // 方法参数
  TParams extends any[] = any[],
  TSerialized = TData,
  // 格式化数据
  TFormatData = TSerialized,
> {
  /**
   * 手动触发 service 执行（静默模式）。异常通过 onError 反馈，不抛出异常。
   */
  run: (...args: TParams) => Promise<void>

  /**
   * 手动触发 service 执行（Promise 模式）。请求失败时抛出异常，支持 try/catch 捕获。
   */
  runAsync: (...args: TParams) => Promise<TFormatData>

  /**
   * 与 run 用法一致，带防抖
   */
  debounceRun: DebouncedFunction<
    (...args: TParams) => Promise<void>
  >

  /**
   * 与 run 用法一致，带节流
   */
  throttleRun: DebouncedFunction<
    (...args: TParams) => Promise<void>
  >

  /**
   * 使用上次的 params，重新调用 run
   */
  refresh: () => Promise<void>

  /**
   * 使用上次的 params，重新调用 runAsync
   */
  refreshAsync: () => Promise<TFormatData>

  /**
   * 手动取消当前正在进行中的请求（伪取消）
   */
  cancel: () => void

  /**
   * 突变，立即更改 data 数据
   */
  mutate: (newData: TFormatData | ((oldData: TFormatData) => TFormatData)) => void

  /**
   * 乐观更新，立即更改 data 数据并在背后发起请求
   * 如果请求失败，自动还原到更新之前的数据
   */
  optimisticUpdate: (newData: TFormatData | ((oldData: TFormatData) => TFormatData), params?: TParams) => void
}

export type RequestResult<
  TData = any,
  TParams extends any[] = any[],
  TSerialized = TData,
  TFormatData = TSerialized,
  TError = any,
> = WrapWithComputed<RequestState<TData, TParams, TSerialized, TFormatData, TError>>
  & RequestMethod<TData, TParams, TSerialized, TFormatData>

export interface RequestPluginHooks<
  TData = any,
  TParams extends any[] = any[],
  TSerialized = TData,
  TFormatData = TSerialized,
  TError = any,
> {
  /**
   * 请求之前触发
   */
  onBefore?: (params: TParams) => {
    isReturned?: boolean
  } | void

  /**
   * 请求开始时触发（可拦截并替换 servicePromise）
   */
  onRequest?: (service: (...params: TParams) => Promise<TData>, params: TParams) => {
    servicePromise: Promise<TData>
  }

  /**
   * 请求失败时触发
   */
  onError?: (
    error: TError,
    params: TParams,
  ) => void

  /**
   * 请求成功时触发
   */
  onSuccess?: (
    data: TFormatData,
    rawData: TData,
    params: TParams,
  ) => void

  /**
   * 当连续请求的时候，最后一个服务请求完成之后触发
   */
  onFinallyFetchDone?: (params: TParams) => void

  /**
   * 最后执行，不管 service 成功还是失败都会执行
   */
  onFinally?: (params: TParams) => void

  /**
   * 通过 mutate 修改数据时触发
   */
  onMutate?: (newData: TFormatData) => void

  /**
   * 通过 cancel 取消请求时触发
   */
  onCancel?: () => void
}

export interface RequestContext<
  TData = any,
  TParams extends any[] = any[],
  TSerialized = TData,
  TFormatData = TSerialized,
  TError = any,
> extends RequestResult<TData, TParams, TSerialized, TFormatData, TError> {
  // 当前作用域
  scope: EffectScope

  // 配置项
  options: RequestOptions<TData, TParams, TSerialized, TFormatData, TError>

  // 原始 state
  rawState: RequestState<TData, TParams, TSerialized, TFormatData, TError>

  // 设置状态
  setState: (
    state: Partial<RequestState<TData, TParams, TSerialized, TFormatData, TError>>,
  ) => void
}

export interface RequestPluginImplement<
  TData = any,
  TParams extends any[] = any[],
  TSerialized = TData,
  TFormatData = TSerialized,
  TError = any,
> {
  (
    context: RequestContext<TData, TParams, TSerialized, TFormatData, TError>,
  ): RequestPluginHooks<TData, TParams, TSerialized, TFormatData, TError> | void
}
