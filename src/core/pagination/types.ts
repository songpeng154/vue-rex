import type { PaginationFields, PaginationOptions } from '../../hooks'

export interface CreatePaginationConfig<
  TListKey extends string = string,
  TTotalKey extends string = string,
  TError = any,
> {
  /**
   * 列表字段路径，支持点号嵌套
   * TypeScript 会自动推导 list.value 的类型为 ArrayElement<Get<TData, TListKey>>[]
   */
  listKey: TListKey

  /**
   * 总条数字段路径，支持点号嵌套
   */
  totalKey: TTotalKey

  /**
   * 分页字段映射，将内部 page / pageSize 映射为后端实际的参数名
   * @default { page: 'page', pageSize: 'pageSize' }
   * @example
   * paginationFields: { page: 'current', pageSize: 'size' }
   */
  paginationFields?: PaginationFields

  /**
   * 将捕获到的原始错误转换为自定义错误类型，作用于所有通过此工厂创建的请求
   * 可被局部 options.errorSerializer 覆盖
   *
   * @example
   * errorSerializer: (e) => ({
   *   code: e?.response?.status ?? -1,
   *   message: e?.message ?? String(e),
   * })
   */
  errorSerializer?: (error: unknown, params: any[]) => TError

  /**
   * 全局默认配置，会被调用时的 options 覆盖
   */
  options?: Omit<PaginationOptions, 'dataSerializer' | 'paginationFields' | 'errorSerializer'>
}
