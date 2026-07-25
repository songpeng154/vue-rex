import type { RequestOptions, RequestServiceFn } from '../types.ts'
import type useCoreState from './core-state.ts'
import type usePlugins from './plugins.ts'
import { isFunction } from 'es-toolkit'
import { ref } from 'vue'
import useDebounce from '../../debounce'
import useThrottle from '../../throttle'

export default function useCoreRequest<
  TData = any,
  TParams extends any[] = any[],
  TSerialized = TData,
  TFormatData = TSerialized,
  TError = any,
>(
  state: ReturnType<typeof useCoreState<TData, TParams, TSerialized, TFormatData, TError>>,
  service: RequestServiceFn<TData, TParams>,
  options: RequestOptions<TData, TParams, TSerialized, TFormatData, TError> = {},
  runPluginHooks: ReturnType<typeof usePlugins<TData, TParams, TSerialized, TFormatData, TError>>['runPluginHooks'],
) {
  const { data, setState, rawState } = state
  const {
    ready = ref(true),
    debounceWait = 500,
    debounceMaxWait,
    debounceLeading = false,
    debounceTrailing = true,
    throttleWait = 500,
    throttleLeading = true,
    throttleTrailing = true,
    onBefore,
    onFinally,
    onError,
    onSuccess,
    onFinallyFetchDone,
    dataSerializer,
    errorSerializer,
    formatData,
  } = options

  let count = 0
  let cancelledCount = 0

  const serviceWrapper = (...params: TParams): Promise<TData> => service(...params)

  const runAsync = async (...args: TParams): Promise<TFormatData> => {
    if (!ready.value) return data.value as TFormatData

    setTimeout(() => onBefore?.(args), 0)

    const beforeReturn = runPluginHooks('onBefore', args)
    if (beforeReturn?.isReturned) {
      setState({ loading: false, finished: true })
      return data.value as TFormatData
    }

    const currentCount = ++count
    setState({ params: args, finished: false })

    try {
      const { servicePromise } = runPluginHooks('onRequest', serviceWrapper, args)
      const result = await (servicePromise || serviceWrapper(...args))

      if (currentCount === count) {
        setState({ finished: true })
        onFinallyFetchDone?.(args)
        runPluginHooks('onFinallyFetchDone', args)
      }

      if (currentCount <= cancelledCount)
        return data.value as TFormatData

      const extracted = (dataSerializer ? dataSerializer(result, args) : result) as TSerialized
      const finalData = (formatData ? formatData(extracted, result, args) : extracted) as TFormatData

      setState({ data: finalData, rawData: result, error: undefined })
      onSuccess?.(finalData, result, args)
      runPluginHooks('onSuccess', finalData, result, args)

      return finalData
    }
    catch (e) {
      if (currentCount <= cancelledCount)
        return data.value as TFormatData

      const _e = errorSerializer ? errorSerializer(e, args) : e as TError

      setState({ error: _e, finished: true })
      onError?.(_e, args)
      runPluginHooks('onError', _e, args)

      throw _e
    }
    finally {
      onFinally?.(args)
      runPluginHooks('onFinally', args)
    }
  }

  const run = async (...args: TParams): Promise<void> => {
    if (!ready.value) return
    try {
      await runAsync(...args)
    }
    catch {
      // 吞噬异常，不抛出
    }
  }

  // 刷新
  const refresh = (): Promise<void> => {
    return run(...rawState.params)
  }

  const refreshAsync = (): Promise<TFormatData> => {
    return runAsync(...rawState.params)
  }

  const cancel = () => {
    cancelledCount = count
    setState({ loading: false })
    runPluginHooks('onCancel')
  }

  // 更改数据
  const mutate = (newData: TFormatData | ((oldData: TFormatData) => TFormatData)) => {
    const data = (isFunction(newData) ? newData(rawState.data as TFormatData) : newData) as TFormatData
    setState({ data })
    runPluginHooks('onMutate', data)
  }

  // 乐观更新
  const optimisticUpdate = (newData: TFormatData | ((oldData: TFormatData) => TFormatData), params: TParams = rawState.params) => {
    const oldData = rawState.data
    mutate(newData)
    runAsync(...params).catch(() => {
      if (oldData !== undefined)
        mutate(oldData)
    })
  }

  // 防抖 run
  const debounceRun = useDebounce(run, debounceWait, {
    maxWait: debounceMaxWait,
    leading: debounceLeading,
    trailing: debounceTrailing,
  })

  // 节流 run
  const throttleRun = useThrottle(run, throttleWait, {
    leading: throttleLeading,
    trailing: throttleTrailing,
  })

  return { run, runAsync, refresh, refreshAsync, cancel, mutate, optimisticUpdate, debounceRun, throttleRun }
}
