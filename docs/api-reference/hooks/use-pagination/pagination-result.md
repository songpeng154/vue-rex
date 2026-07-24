---
outline: deep
---

[createPagination](./home) / **PaginationResult**

# 接口：PaginationResult

[createPagination](./home)返回的工厂函数的返回值类型

## 类型声明

```typescript
import { ComputedRef, Ref } from 'vue'
import type { DebouncedFunction } from 'es-toolkit'

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
    'params' | 'run' | 'debounceRun' | 'throttleRun' | 'refresh' | 'optimisticUpdate'
  > {
  /** 当前请求参数（已提交的搜索字段 + 当前 page / pageSize） */
  params: ComputedRef<TParams>

  /** 当前列表数据 */
  list: ComputedRef<TFormatData[]>

  /** 当前页码（可写，代理到 params ref） */
  page: Ref<number>

  /** 每页条数（可写，代理到 params ref） */
  pageSize: Ref<number>

  /** 数据总条数 */
  total: ComputedRef<number>

  /** 总页数 */
  totalPage: ComputedRef<number>

  /** 是否已是最后一页 */
  isLastPage: ComputedRef<boolean>

  /** 搜索：提交搜索条件 + page 归 1 + 触发请求 */
  search: (params?: TParams) => Promise<Undefinable<PaginationData<TFormatData>>>

  /** 防抖版 search */
  debounceSearch: DebouncedFunction<(params?: TParams) => Promise<Undefinable<PaginationData<TFormatData>>>>

  /** 节流版 search */
  throttleSearch: DebouncedFunction<(params?: TParams) => Promise<Undefinable<PaginationData<TFormatData>>>>

  /** 使用当前参数重新请求 */
  refresh: () => Promise<Undefinable<PaginationData<TFormatData>>>

  /** 乐观更新 */
  optimisticUpdate: (
    newData: PaginationData<TFormatData> | ((oldData: PaginationData<TFormatData>) => PaginationData<TFormatData>),
  ) => void
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

* `必填` - `ComputedRef<TParams>`

当前请求参数（已提交的搜索字段 + 当前 page / pageSize）

### list

* `必填` - `ComputedRef<TFormatData[]>`

列表数据

### page

* `必填` - `Ref<number>`

当前页码（可写，代理到 params ref）

### pageSize

* `必填` - `Ref<number>`

每页条数（可写，代理到 params ref）

### total

* `必填` - `ComputedRef<number>`

数据总条数

### totalPage

* `必填` - `ComputedRef<number>`

总页数

### isLastPage

* `必填` - `ComputedRef<boolean>`

是否已是最后一页

## 方法

### search

提交搜索条件 + page 归 1 + 触发请求。无参时提交 params ref 中的当前表单值；传参时先写入 params ref 再提交。

#### 入参

| 名称       | 类型        | 默认值 | 描述   |
|:---------|:----------|:----|:-----|
| `params` | `TParams` | 可选 | 搜索参数，写入表单 ref 后提交 |

#### 返回值

`Promise<Undefinable<PaginationData<TFormatData>>>`

### debounceSearch

与 [search](#search) 用法一致，带防抖

### throttleSearch

与 [search](#search) 用法一致，带节流

### refresh

使用当前参数重新请求

#### 返回值

`Promise<Undefinable<PaginationData<TFormatData>>>`

### optimisticUpdate

乐观更新

#### 入参

| 名称        | 类型                                                                                     | 默认值 | 描述 |
|:----------|:---------------------------------------------------------------------------------------|:----|:---|
| `newData` | `PaginationData<TFormatData> \| ((oldData: PaginationData<TFormatData>) => PaginationData<TFormatData>)` |     | 新数据 |

#### 返回值

`void`
