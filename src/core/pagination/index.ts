import type { ArrayElement, Get } from 'type-fest'
import type { PaginationOptions, PaginationResult, RequestServiceFn } from '../../hooks'
import type { CreatePaginationConfig } from './types.ts'
import { get } from 'es-toolkit/compat'
import { usePagination } from '../../hooks'

/**
 * 创建一个绑定了提取逻辑的分页 hook
 *
 * 通过 listKey / totalKey 指定字段路径（支持点号嵌套如 'data.list'），
 * TypeScript 会在每次调用 usePage(service) 时从 service 的返回类型中
 * 自动推导出列表项类型，无需任何泛型标注。
 *
 * @example
 * // 简单路径
 * export const usePage = createPagination({
 *   listKey: 'records',
 *   totalKey: 'totalCount',
 * })
 *
 * // 嵌套路径（通用响应体）
 * export const usePage = createPagination({
 *   listKey: 'data.list',
 *   totalKey: 'data.total',
 * })
 *
 * // 配置错误类型（泛型自动推导，无需显式传入）
 * interface ApiError {
 *   code: number
 *   message: string
 * }
 * export const usePage = createPagination({
 *   listKey: 'data.list',
 *   totalKey: 'data.total',
 *   errorSerializer: (e): ApiError => ({
 *     code: e?.response?.status ?? -1,
 *     message: e?.message ?? String(e),
 *   })
 * })
 *
 * // 组件里 — 自动推导，无需泛型
 * const { list } = usePage(getUserList)   // list.value → User[]   ✅
 * const { list } = usePage(getPostList)   // list.value → Post[]   ✅
 */
export function createPagination<
  TListKey extends string,
  TTotalKey extends string,
  TError = any,
>(config: CreatePaginationConfig<TListKey, TTotalKey, TError>) {
  const listKey = config.listKey as string
  const totalKey = config.totalKey as string

  return function <
    TData extends object,
    TParams extends Record<string, any> = Record<string, any>,
    TItem = ArrayElement<Get<TData, TListKey>>,
    TFormatData = TItem,
  >(
    service: RequestServiceFn<TData, [TParams]>,
    options?: Omit<PaginationOptions<TData, TParams, TItem, TFormatData, TError>, 'dataSerializer' | 'paginationFields' | 'errorSerializer'>,
  ): PaginationResult<TData, TParams, TItem, TFormatData, TError> {
    const _options = {
      ...config.options,
      ...options,
      dataSerializer: (data: any) => ({
        list: get(data, listKey) ?? [],
        total: get(data, totalKey) ?? 0,
      }),
      paginationFields: config.paginationFields,
    } as PaginationOptions<TData, TParams, TItem, TFormatData, TError>

    if (config.errorSerializer && !_options.errorSerializer)
      _options.errorSerializer = config.errorSerializer as any

    return usePagination<TData, TParams, TItem, TFormatData, TError>(service, _options)
  }
}
