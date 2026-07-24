---
outline: deep
---

[createPagination](./home) / **PaginationOptions**

# 接口：PaginationOptions

[createPagination](./home)返回的工厂函数的配置项

## 类型声明

```typescript
import type { DebouncedFunction } from 'es-toolkit'

export interface PaginationOptions<
  TData = any,
  TParams extends Record<string, any> = Record<string, any>,
  TItem = any,
  TFormatData = TItem,
  TError = any,
> extends Omit<
    RequestOptions<
      TData,
      [TParams],
      PaginationData<TItem>,
      PaginationData<TFormatData>,
      TError
    >,
    'dataSerializer' | 'formatData' | 'defaultParams'
    | 'onSuccess' | 'onError' | 'onBefore' | 'onFinally' | 'onFinallyFetchDone'
  > {
  /** 表单参数 ref，包含搜索字段和分页字段 */
  params?: Ref<TParams>

  /** 初始页码（不传 params 时生效） @default 1 */
  initialPage?: number

  /** 初始每页条数（不传 params 时生效） @default 10 */
  initialPageSize?: number

  /** pageSize 变化时是否重置 page @default true */
  resetPageWhenPageSizeChange?: boolean

  /** page 超出总页数时是否自动调整 @default true */
  adjustPageWhenOutOfRange?: boolean

  /** 分页字段映射 @default { page: 'page', pageSize: 'pageSize' } */
  paginationFields?: PaginationFields

  /** 从 server 返回数据中提取 list 和 total */
  dataSerializer: (data: TData, params: TParams) => PaginationData<TItem>

  /** 格式化列表项，total 保持不变 */
  formatList?: (list: TItem[], rawData: TData, params: TParams) => TFormatData[]

  /** 请求之前执行 */
  onBefore?: (params: TParams) => void

  /** 请求成功时执行 */
  onSuccess?: (data: PaginationData<TFormatData>, rawData: TData, params: TParams) => void

  /** 请求错误的时候执行 */
  onError?: (error: TError, params: TParams) => void

  /** 最后执行，不管 service 成功失败都会执行 */
  onFinally?: (params: TParams) => void

  /** 当连续请求的时候，最后一个服务请求完成之后触发 */
  onFinallyFetchDone?: (params: TParams) => void
}
```

## 泛型

| 名称            | 默认值       | 可选  | 描述              |
|:--------------|:----------|:----|-----------------|
| `TData`       | `any`     | `是` | service 返回的数据类型 |
| `TParams`     | `Record<string, any>` | `是` | 分页请求参数类型 |
| `TItem`       | `any`     | `是` | 列表项类型          |
| `TFormatData` | `TItem`   | `是` | 格式化后的列表项类型    |
| `TError`      | `any`     | `是` | 错误类型          |

## 属性

### params

* `可选` - `Ref<TParams>`

表单参数 ref，包含搜索字段和分页字段（page / pageSize）。hook 会在此 ref 上建立 page / pageSize 的 computed 代理。搜索字段通过 `search()` 提交后才会用于请求。不传时 hook 内部自建，仅含 page / pageSize。

### initialPage

* `可选` - `number`
* 默认值：`1`

初始页码（不传 params 时生效）

### initialPageSize

* `可选` - `number`
* 默认值：`10`

初始每页条数（不传 params 时生效）

### resetPageWhenPageSizeChange

* `可选` - `boolean`
* 默认值：`true`

pageSize 变化时是否重置 page 到第一页

### adjustPageWhenOutOfRange

* `可选` - `boolean`
* 默认值：`true`

请求返回后 page 超出总页数时是否自动调整到最后一页

### paginationFields

* `可选` - `PaginationFields`
* 默认值：`{ page: 'page', pageSize: 'pageSize' }`

分页字段映射，用于适配后端不同的字段名

### dataSerializer

* `必填` - `(data: TData, params: TParams) => PaginationData<TItem>`

从 service 返回数据中提取 list 和 total

### formatList

* `可选` - `(list: TItem[], rawData: TData, params: TParams) => TFormatData[]`

格式化列表项，total 保持不变

### onBefore / onSuccess / onError / onFinally / onFinallyFetchDone

生命周期回调，params 参数为当前请求参数（已提交的搜索字段 + 当前 page / pageSize）。
