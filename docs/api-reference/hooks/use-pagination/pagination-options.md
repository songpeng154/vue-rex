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
> extends Omit<
    RequestOptions<
      TData,
      [TParams],
      PaginationData<TItem>,
      PaginationData<TFormatData>
    >,
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
    error: any,
    params: TParams,
  ) => void

  /** 最后执行，不管 service 成功失败都会执行 */
  onFinally?: (params: TParams) => void

  /** 当连续请求的时候，最后一个服务请求完成之后触发 */
  onFinallyFetchDone?: (params: TParams) => void
}
```

## 泛型

| 名称            | 默认值       | 继承      | 可选  | 描述              |
|:--------------|:----------|:--------|:----|-----------------|
| `TData`       | `any`     |         | `是` | service 返回的数据类型 |
| `TParams`     | `Record<string, any>` | `Record<string, any>` | `是` | 分页请求参数类型 |
| `TItem`       | `any`     |         | `是` | 列表项类型          |
| `TFormatData` | `TItem`   |         | `是` | 格式化后的列表项类型    |

## 继承

继承自 `RequestOptions<TData, [TParams], PaginationData<TItem>, PaginationData<TFormatData>>`，但不包含 `dataSerializer`、`formatData`、`defaultParams`、`onSuccess`、`onError`、`onBefore`、`onFinally`、`onFinallyFetchDone`。

## 属性

### initialPage

* `可选` - `number`
* 默认值：`1`

初始页码

### initialPageSize

* `可选` - `number`
* 默认值：`10`

初始每页条数

### pageWatch

* `可选` - `boolean`
* 默认值：`true`

page 变化时是否自动刷新。为 `true` 时会自动禁用 `watchSource` 的依赖自动收集，避免 page/pageSize 变化时重复请求。显式传入 `watchSource: Ref[]` 仍会保留。

### resetPageWhenPageSizeChange

* `可选` - `boolean`
* 默认值：`true`

pageSize 变化时是否重置 page

### defaultParams

* `可选` - `TParams`

默认参数，直接传对象即可

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

### onBefore

请求之前执行

#### 入参

| 名称       | 类型        | 默认值 | 描述 |
|:---------|:----------|:----|:---|
| `params` | `TParams` |     | 入参 |

#### 返回值

`void`

### onSuccess

请求成功时执行

#### 入参

| 名称       | 类型                                 | 默认值 | 描述        |
|:---------|:-----------------------------------|:----|:----------|
| `data`   | `PaginationData<TFormatData>`      |     | 分页数据      |
| `rawData`| `TData`                            |     | 原始数据      |
| `params` | `TParams`                          |     | 入参        |

#### 返回值

`void`

### onError

请求错误的时候执行

#### 入参

| 名称       | 类型        | 默认值 | 描述 |
|:---------|:----------|:----|:---|
| `error`  | `any`     |     | 错误信息 |
| `params` | `TParams` |     | 入参 |

#### 返回值

`void`

### onFinally

最后执行，不管 service 成功失败都会执行

#### 入参

| 名称       | 类型        | 默认值 | 描述 |
|:---------|:----------|:----|:---|
| `params` | `TParams` |     | 入参 |

#### 返回值

`void`

### onFinallyFetchDone

当连续请求的时候，最后一个服务请求完成之后触发

#### 入参

| 名称       | 类型        | 默认值 | 描述 |
|:---------|:----------|:----|:---|
| `params` | `TParams` |     | 入参 |

#### 返回值

`void`
