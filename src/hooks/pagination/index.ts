import type { Ref } from 'vue'
import type { RequestServiceFn } from '../request/types.ts'
import type { PaginationData, PaginationOptions, PaginationResult } from './types.ts'
import { computed, ref, watch } from 'vue'
import useDebounce from '../debounce'
import { useRequest } from '../request'
import useThrottle from '../throttle'

export function usePagination<
  TData = any,
  TParams extends Record<string, any> = Record<string, any>,
  TItem = any,
  TFormatData = TItem,
  TError = any,
>(
  service: RequestServiceFn<TData, [TParams]>,
  options: PaginationOptions<TData, TParams, TItem, TFormatData, TError>,
): PaginationResult<TData, TParams, TItem, TFormatData, TError> {
  const {
    params: paramsOption,
    dataSerializer,
    formatList,
    paginationFields = { page: 'page', pageSize: 'pageSize' },
    initialPage = 1,
    initialPageSize = 10,
    resetPageWhenPageSizeChange = true,
    adjustPageWhenOutOfRange = true,
    watchSource,
    watchDeep,
    manual,
    onBefore,
    onSuccess,
    onError,
    onFinally,
    onFinallyFetchDone,
    debounceWait = 500,
    debounceMaxWait,
    debounceLeading = false,
    debounceTrailing = true,
    throttleWait = 500,
    throttleLeading = true,
    throttleTrailing = true,
    ...useRequestOptions
  } = options

  const pageField = paginationFields.page
  const pageSizeField = paginationFields.pageSize

  // ─── params ref（用户提供或内部自建）─────────────────────────
  // 确保 params ref 含 page / pageSize
  if (paramsOption) {
    const val = paramsOption.value as Record<string, any>
    if (val[pageField] == null) val[pageField] = initialPage
    if (val[pageSizeField] == null) val[pageSizeField] = initialPageSize
  }
  const paramsRef = (paramsOption ?? ref({
    [pageField]: initialPage,
    [pageSizeField]: initialPageSize,
  })) as Ref<Record<string, any>>

  // ─── committed：上次 search() 提交的完整 params 快照 ────────
  const committed = ref({ ...paramsRef.value })

  // ─── page / pageSize：computed 代理，读写落在 paramsRef 上 ──
  const page = computed<number>({
    get: () => paramsRef.value[pageField],
    set: (v: number) => { paramsRef.value[pageField] = v },
  })

  const pageSize = computed<number>({
    get: () => paramsRef.value[pageSizeField],
    set: (v: number) => { paramsRef.value[pageSizeField] = v },
  })

  // ─── requestParams：committed + 当前 page / pageSize ────────
  // page / pageSize 永远覆盖 committed 里的，所以 committed 存不存分页字段都无所谓
  const requestParams = computed<TParams>(() => ({
    ...committed.value,
    [pageField]: page.value,
    [pageSizeField]: pageSize.value,
  }) as TParams)

  // ─── wrappedService：忽略入参，始终读 requestParams ──────────
  const wrappedService = (_params: TParams) => {
    return service(requestParams.value)
  }

  // ─── formatList → formatData ─────────────────────────────
  const formatData = formatList
    ? (data: PaginationData<TItem>, rawData: TData, _params: [TParams]): PaginationData<TFormatData> => ({
        list: formatList(data.list, rawData, requestParams.value),
        total: data.total,
      })
    : undefined

  // ─── 包装回调：params 始终取 requestParams（最新值）──────────
  const wrappedOnBefore = onBefore
    ? (_params: [TParams]) => onBefore(requestParams.value)
    : undefined

  const wrappedOnSuccess = onSuccess
    ? (data: PaginationData<TFormatData>, rawData: TData, _params: [TParams]) => onSuccess(data, rawData, requestParams.value)
    : undefined

  const wrappedOnError = onError
    ? (error: any, _params: [TParams]) => onError(error, requestParams.value)
    : undefined

  const wrappedOnFinally = onFinally
    ? (_params: [TParams]) => onFinally(requestParams.value)
    : undefined

  const wrappedOnFinallyFetchDone = onFinallyFetchDone
    ? (_params: [TParams]) => onFinallyFetchDone(requestParams.value)
    : undefined

  // ─── useRequest（manual 模式，由 pagination 控制触发）────────
  const fetchInstance = useRequest<TData, [TParams], PaginationData<TItem>, PaginationData<TFormatData>, TError>(
    wrappedService,
    {
      ...useRequestOptions,
      manual: true,
      defaultParams: [requestParams.value],
      dataSerializer: (data: TData, params: [TParams]) => dataSerializer(data, params[0]),
      formatData,
      onBefore: wrappedOnBefore,
      onSuccess: wrappedOnSuccess,
      onError: wrappedOnError,
      onFinally: wrappedOnFinally,
      onFinallyFetchDone: wrappedOnFinallyFetchDone,
    },
  )

  // ─── 派生状态 ─────────────────────────────────────────────
  const paginationData = computed(() =>
    fetchInstance.data.value ?? { list: [] as TFormatData[], total: 0 },
  )

  const list = computed<TFormatData[]>(() => paginationData.value.list)
  const total = computed(() => paginationData.value.total)
  const totalPage = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const isLastPage = computed(() => page.value >= totalPage.value)
  const params = computed(() => requestParams.value)

  // ─── 请求触发 ─────────────────────────────────────────────
  const doRequest = () => {
    return fetchInstance.run(requestParams.value)
  }

  // 首次请求（非 manual 时）
  if (!manual)
    doRequest()

  // page / pageSize / committed 变化 → 自动请求
  let suppressWatch = false
  watch([page, pageSize, committed], () => {
    if (suppressWatch) {
      suppressWatch = false
      return
    }
    doRequest()
  })

  // pageSize 变化 → 重置 page（sync 确保与主 watch 同 tick 合并）
  watch(pageSize, () => {
    if (resetPageWhenPageSizeChange)
      page.value = 1
  }, { flush: 'sync' })

  // page 超出总页数 → 自动调整
  watch(totalPage, (tp) => {
    if (adjustPageWhenOutOfRange && page.value > tp)
      page.value = tp
  })

  // 用户自定义 watchSource
  if (watchSource && watchSource !== true)
    watch(watchSource, doRequest, { deep: watchDeep })

  // ─── search ───────────────────────────────────────────────
  const search = (searchParams?: TParams) => {
    if (searchParams)
      Object.assign(paramsRef.value, searchParams)
    suppressWatch = true
    committed.value = { ...paramsRef.value }
    page.value = 1
    return doRequest()
  }

  // ─── refresh ──────────────────────────────────────────────
  const refresh = () => fetchInstance.run(requestParams.value)

  // ─── debounce / throttle search ───────────────────────────
  const debounceSearch = useDebounce(search, debounceWait, {
    maxWait: debounceMaxWait,
    leading: debounceLeading,
    trailing: debounceTrailing,
  })

  const throttleSearch = useThrottle(search, throttleWait, {
    leading: throttleLeading,
    trailing: throttleTrailing,
  })

  // ─── optimisticUpdate ─────────────────────────────────────
  const optimisticUpdate = (
    newData: PaginationData<TFormatData> | ((oldData: PaginationData<TFormatData>) => PaginationData<TFormatData>),
  ) => {
    fetchInstance.optimisticUpdate(newData, [requestParams.value])
  }

  // ─── 返回值（显式取属性，避免运行时泄漏 run/debounceRun 等）──
  const { data, rawData, error, loading, finished, mutate, cancel } = fetchInstance
  return {
    data,
    rawData,
    error,
    loading,
    finished,
    mutate,
    cancel,
    params,
    optimisticUpdate,
    list,
    page,
    pageSize,
    total,
    totalPage,
    isLastPage,
    search,
    refresh,
    debounceSearch,
    throttleSearch,
  }
}
