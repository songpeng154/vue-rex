---
outline: deep
---

[createPagination](./home) / **PaginationResult**

# 接口：PaginationResult

[createPagination](./home)返回的工厂函数的返回值类型

## 类型声明

```typescript
import type { DebouncedFunction } from 'es-toolkit'
import { ComputedRef, Ref } from 'vue'

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
    'params' | 'run' | 'runAsync' | 'debounceRun' | 'throttleRun' | 'refresh' | 'refreshAsync' | 'optimisticUpdate'
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

  /** 重新加载（静默模式）：提交参数 + page 归 1 + 触发请求 */
  reload: (params?: TParams) => Promise<void>

  /** 重新加载（Promise 模式）：提交参数 + page 归 1 + 触发请求，失败抛出异常 */
  reloadAsync: (params?: TParams) => Promise<PaginationData<TFormatData>>

  /** 防抖版 reload */
  debounceReload: DebouncedFunction<(params?: TParams) => Promise<void>>

  /** 节流版 reload */
  throttleReload: DebouncedFunction<(params?: TParams) => Promise<void>>

  /** 使用当前参数重新请求（静默模式） */
  refresh: () => Promise<void>

  /** 使用当前参数重新请求（Promise 模式） */
  refreshAsync: () => Promise<PaginationData<TFormatData>>

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

当前请求参数（已提交的筛选字段 + 当前 page / pageSize）

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

### reload

提交参数 + page 归 1 + 触发请求（静默模式）。无参时提交 params ref 中的当前表单值；传参时先写入 params ref 再提交。
内部捕获异常，不会抛出 Promise 错误。

#### 入参

| 名称       | 类型        | 默认值 | 描述   |
|:---------|:----------|:----|:-----|
| `params` | `TParams` | 可选 | 筛选参数，写入表单 ref 后提交 |

#### 返回值

`Promise<void>`

### reloadAsync

提交参数 + page 归 1 + 触发请求（Promise 模式）。
失败时抛出异常，可使用 `try...catch` 进行捕获并获取处理后的分页结果。

#### 入参

| 名称       | 类型        | 默认值 | 描述   |
|:---------|:----------|:----|:-----|
| `params` | `TParams` | 可选 | 筛选参数，写入表单 ref 后提交 |

#### 返回值

`Promise<PaginationData<TFormatData>>`

### debounceReload

与 [reload](#reload) 用法一致，带防抖

### throttleReload

与 [reload](#reload) 用法一致，带节流

### refresh

使用当前参数重新请求（静默模式）

#### 返回值

`Promise<void>`

### refreshAsync

使用当前参数重新请求（Promise 模式）

#### 返回值

`Promise<PaginationData<TFormatData>>`

### optimisticUpdate

乐观更新

#### 入参

| 名称        | 类型                                                                                     | 默认值 | 描述 |
|:----------|:---------------------------------------------------------------------------------------|:----|:---|
| `newData` | `PaginationData<TFormatData> \| ((oldData: PaginationData<TFormatData>) => PaginationData<TFormatData>)` |     | 新数据 |

#### 返回值

`void`
