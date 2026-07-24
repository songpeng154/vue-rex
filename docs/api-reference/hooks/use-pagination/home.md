---
outline: deep
---

# createPagination

`createPagination` 是基于 [createRequest](../use-request/home.md) 的分页请求 hook 工厂函数，用于处理分页数据请求。

首先调用 `createPagination` 获取一个分页工厂函数，再调用该工厂函数发起分页请求。

::: warning 注意
[service](./pagination-service-fn) 返回数据需通过 `dataSerializer` 提取符合分页规范的数据结构（字段名通过 `listKey`、`totalKey` 指定）。
:::

## 特性

* 支持 [createRequest](../use-request/home.md) 的全部功能
* 自动管理分页状态
* pageSize 变化后重置分页
* 响应式 page / pageSize

## 类型声明

```typescript
function createPagination<
  TListKey extends string = string,
  TTotalKey extends string = string,
>(
  config: CreatePaginationConfig<TListKey, TTotalKey>
)
```

### CreatePaginationConfig

```typescript
interface CreatePaginationConfig<
  TListKey extends string = string,
  TTotalKey extends string = string,
> {
  /** 列表字段路径，支持点号嵌套 */
  listKey: TListKey

  /** 总条数字段路径，支持点号嵌套 */
  totalKey: TTotalKey

  /**
   * 分页字段映射，将内部 page / pageSize 映射为后端实际的参数名
   * @default { page: 'page', pageSize: 'pageSize' }
   * @example
   * paginationFields: { page: 'current', pageSize: 'size' }
   */
  paginationFields?: PaginationFields

  /** 全局默认配置，会被调用时的 options 覆盖（params 为每次调用时传入） */
  options?: Omit<PaginationOptions, 'dataSerializer' | 'paginationFields' | 'errorSerializer' | 'params'>
}
```

## 返回的工厂函数

`createPagination` 返回一个 `usePage` 工厂函数：

```typescript
function usePage<
  TData = any,
  TParams extends Record<string, any> = Record<string, any>,
  TItem = any,
  TFormatData = TItem,
>(
  service: RequestServiceFn<TData, [TParams]>,
  options?: PaginationOptions<TData, TParams, TItem, TFormatData>,
): PaginationResult<TData, TParams, TItem, TFormatData>;
```

## 使用示例

```typescript
import { ref } from 'vue'
import { createPagination } from 'vue-rex'

const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
})

const searchParams = ref({ keyword: '', page: 1, pageSize: 10 })

const { list, total, page, pageSize, loading, search } = usePage(
  (params) => fetch('/api/list', params),
  { params: searchParams },
)

// 搜索
search()

// 翻页
page.value = 2
```

## 相关类型

### [PaginationData](./pagination-response)

### [PaginationOptions](./pagination-options)

### [PaginationResult](./pagination-result)

## 泛型

| 名称            | 默认值       | 继承      | 可选  | 描述              |
|:--------------|:----------|:--------|:----|-----------------|
| `TListKey`    | `string`  | `string` | `是` | 列表字段路径          |
| `TTotalKey`   | `string`  | `string` | `是` | 总条数字段路径         |

## 入参（工厂函数）

| 名称        | 类型                                                                                       | 默认值 | 可选  | 描述                         |
|:----------|:-----------------------------------------------------------------------------------------|:----|:----|:---------------------------|
| `service` | [RequestServiceFn\<TData, [TParams]>](../use-request/request-service-fn)                    | -   | `否` | 异步函数                      |
| `options` | [PaginationOptions\<TData, TParams, TItem, TFormatData>](./pagination-options)             | -   | `是` | 配置对象                       |

#### 返回值

[PaginationResult<TData, TParams, TItem, TFormatData>](./pagination-result.md)
