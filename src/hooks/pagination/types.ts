import type { DebouncedFunction } from 'es-toolkit'
import type { ComputedRef, Ref } from 'vue'
import type { Undefinable } from '../../types/utils.ts'
import type { RequestOptions, RequestResult } from '../request/types.ts'

/**
 * 分页字段映射
 * 将内部的 page / pageSize 概念映射为后端实际的参数名
 * @example
 * // 默认（后端字段名就是 page / pageSize）
 * { page: 'page', pageSize: 'pageSize' }
 * // 自定义（后端用 current / size）
 * { page: 'current', pageSize: 'size' }
 */
export interface PaginationFields {
  page: string
  pageSize: string
}

/**
 * 分页数据标准结构
 */
export interface PaginationData<TItem = any> {
  list: TItem[]
  total: number
}

/**
 * 分页配置
 */
export interface PaginationOptions<
  TData = any,
  TParams extends Record<string, any> = Record<string, any>,
  TItem = any,
  TFormatData = TItem,
  TError = any,
> extends Omit<
    RequestOptions<TData, [TParams], PaginationData<TItem>, PaginationData<TFormatData>, TError>,
    'dataSerializer' | 'formatData' | 'defaultParams'
    | 'onSuccess' | 'onError' | 'onBefore' | 'onFinally' | 'onFinallyFetchDone'
  > {
  /** 初始页码 */
  initialPage?: number

  /** 初始每页条数 */
  initialPageSize?: number

  /**
   * page 变化时是否自动刷新
   * 为 true 时会自动禁用 watchSource 的依赖自动收集（watchSource: true），
   * 避免 page/pageSize 变化时重复请求；显式传入 watchSource: Ref[] 仍会保留
   * @default true
   */
  pageWatch?: boolean

  /** pageSize 变化时是否重置 page @default true */
  resetPageWhenPageSizeChange?: boolean

  /** 默认参数，直接传对象即可 */
  defaultParams?: TParams

  /** 分页字段映射，用于适配后端不同的字段名 @default { page: 'page', pageSize: 'pageSize' } */
  paginationFields?: PaginationFields

  /** 从 server 返回数据中提取 list 和 total */
  dataSerializer: (data: TData, params: TParams) => PaginationData<TItem>

  /** 格式化列表项，total 保持不变 */
  formatList?: (list: TItem[], rawData: TData, params: TParams) => TFormatData[]

  /** 请求之前执行 */
  onBefore?: (params: TParams) => void

  /** 请求成功时执行 */
  onSuccess?: (
    data: PaginationData<TFormatData>,
    rawData: TData,
    params: TParams,
  ) => void

  /** 请求错误的时候执行 */
  onError?: (
    error: TError,
    params: TParams,
  ) => void

  /** 最后执行，不管 service 成功失败都会执行 */
  onFinally?: (params: TParams) => void

  /** 当连续请求的时候，最后一个服务请求完成之后触发 */
  onFinallyFetchDone?: (params: TParams) => void
}

/**
 * 分页返回值
 */
export interface PaginationResult<
  TData = any,
  TParams extends Record<string, any> = Record<string, any>,
  TItem = any,
  TFormatData = TItem,
  TError = any,
> extends Omit<
    RequestResult<
      TData,
      [TParams],
      PaginationData<TItem>,
      PaginationData<TFormatData>,
      TError
    >,
    'params' | 'run' | 'debounceRun' | 'throttleRun' | 'optimisticUpdate'
  > {
  /** 当前请求参数 */
  params: ComputedRef<TParams>

  /** 手动触发 service 执行 */
  run: (params: TParams) => Promise<Undefinable<PaginationData<TFormatData>>>

  /** 与 run 用法一致，带防抖 */
  debounceRun: DebouncedFunction<(params: TParams) => Promise<Undefinable<PaginationData<TFormatData>>>>

  /** 与 run 用法一致，带节流 */
  throttleRun: DebouncedFunction<(params: TParams) => Promise<Undefinable<PaginationData<TFormatData>>>>

  /** 乐观更新 */
  optimisticUpdate: (
    newData: PaginationData<TFormatData> | ((oldData: PaginationData<TFormatData>) => PaginationData<TFormatData>),
    params?: TParams,
  ) => void

  /** 当前列表数据 */
  list: ComputedRef<TFormatData[]>

  /** 当前页码（可写） */
  page: Ref<number>

  /** 每页条数（可写） */
  pageSize: Ref<number>

  /** 数据总条数 */
  total: ComputedRef<number>

  /** 总页数 */
  totalPage: ComputedRef<number>

  /** 是否已是最后一页 */
  isLastPage: ComputedRef<boolean>

  /** 重置到第一页 */
  reset: () => void
}
