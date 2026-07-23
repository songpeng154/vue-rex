import type { RequestServiceFn } from '../request/types.ts'
import type { PaginationData, PaginationOptions, PaginationResult } from './types.ts'
import { computed, ref, watch } from 'vue'
import { useRequest } from '../request'

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
    dataSerializer,
    formatList,
    paginationFields = { page: 'page', pageSize: 'pageSize' },
    initialPage = 1,
    initialPageSize = 10,
    pageWatch = true,
    resetPageWhenPageSizeChange = true,
    watchSource,
    defaultParams,
    onBefore,
    onSuccess,
    onError,
    onFinally,
    onFinallyFetchDone,
    ...restOptions
  } = options

  // ─── 分页状态 ─────────────────────────────────────────────
  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)

  // ─── 构建默认参数 ─────────────────────────────────────────
  const paginationDefaults = {
    [paginationFields.page]: page.value,
    [paginationFields.pageSize]: pageSize.value,
  } as Partial<TParams>
  const effectiveDefaultParams = defaultParams
    ? { ...defaultParams, ...paginationDefaults }
    : paginationDefaults as TParams

  // ─── 包装 service，注入分页参数 ───────────────────────────
  const wrappedService = (params: TParams) => {
    const mergedArg = {
      ...params,
      [paginationFields.page]: page.value,
      [paginationFields.pageSize]: pageSize.value,
    }
    return service(mergedArg)
  }

  // ─── formatList → formatData ─────────────────────────────
  const formatData = formatList
    ? (data: PaginationData<TItem>, rawData: TData, params: [TParams]): PaginationData<TFormatData> => ({
        list: formatList(data.list, rawData, params[0]),
        total: data.total,
      })
    : undefined

  // ─── 包装回调，将元组参数转换为对象 ─────────────────────────
  const wrappedOnBefore = onBefore
    ? (params: [TParams]) => onBefore(params[0])
    : undefined

  const wrappedOnSuccess = onSuccess
    ? (data: PaginationData<TFormatData>, rawData: TData, params: [TParams]) => onSuccess(data, rawData, params[0])
    : undefined

  const wrappedOnError = onError
    ? (error: any, params: [TParams]) => onError(error, params[0])
    : undefined

  const wrappedOnFinally = onFinally
    ? (params: [TParams]) => onFinally(params[0])
    : undefined

  const wrappedOnFinallyFetchDone = onFinallyFetchDone
    ? (params: [TParams]) => onFinallyFetchDone(params[0])
    : undefined

  // ─── 调用 useRequest ──────────────────────────────────────
  const fetchInstance = useRequest<TData, [TParams], PaginationData<TItem>, PaginationData<TFormatData>, TError>(
    wrappedService,
    {
      ...restOptions,
      defaultParams: [effectiveDefaultParams],
      watchSource: pageWatch && watchSource === true ? undefined : watchSource,
      dataSerializer: dataSerializer as any,
      formatData,
      onBefore: wrappedOnBefore,
      onSuccess: wrappedOnSuccess,
      onError: wrappedOnError,
      onFinally: wrappedOnFinally,
      onFinallyFetchDone: wrappedOnFinallyFetchDone,
    },
  )

  const paginationData = computed(() =>
    fetchInstance.data.value ?? { list: [] as TFormatData[], total: 0 },
  )

  const list = computed<TFormatData[]>(() => paginationData.value.list)

  const total = computed(() => paginationData.value.total)
  const totalPage = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const isLastPage = computed(() => page.value >= totalPage.value)

  // ─── 覆盖 params 类型 ─────────────────────────────────────
  const params = computed(() => fetchInstance.params.value[0]) as any

  // ─── 包装 optimisticUpdate，将元组参数转换为对象 ────────────
  const optimisticUpdate = (
    newData: PaginationData<TFormatData> | ((oldData: PaginationData<TFormatData>) => PaginationData<TFormatData>),
    params?: TParams,
  ) => {
    fetchInstance.optimisticUpdate(newData as any, params ? [params] : undefined)
  }

  watch(page, () => {
    if (pageWatch)
      fetchInstance.refresh().catch(() => {})
  })

  watch(pageSize, () => {
    const wasPage1 = page.value === 1
    if (resetPageWhenPageSizeChange)
      page.value = 1
    if (wasPage1)
      fetchInstance.refresh().catch(() => {})
  })

  const reset = () => {
    page.value = initialPage
  }

  // ─── 返回值 ───────────────────────────────────────────────
  return {
    ...fetchInstance,
    params,
    optimisticUpdate,
    list,
    page,
    pageSize,
    total,
    totalPage,
    isLastPage,
    reset,
  }
}
