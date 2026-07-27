---
outline: deep
---

[createPagination](./home) / **PaginationServiceFn**

# 类型：PaginationServiceFn

[createPagination](./home.md)返回的工厂函数的 service 参数类型

PaginationServiceFn 即 [RequestServiceFn<TData, [TParams]>](../use-request/request-service-fn)，
其中 `TParams` 是分页参数对象。

```typescript
type PaginationServiceFn<TData = any, TParams extends Record<string, any> = Record<string, any>>
  = (...args: [TParams]) => Promise<TData>
```

## 示例

```typescript
const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
})

const { list, total } = usePage(
  (params: { page: number, size: number }) => fetch('/api/list', params)
)
```

## 泛型

| 名称       | 默认值       | 继承      | 可选  | 描述     |
|:---------|:----------|:--------|:----|--------|
| `TData`  | `any`     |         | `是` | 数据类型   |
| `TParams` | `Record<string, any>` | `Record<string, any>` | `是` | 分页请求参数类型 |

## 入参

| 名称        | 类型        | 默认值 | 描述     |
|:----------|:----------|:----|:-------|
| `params`  | `TParams` |     | 分页请求参数 |

## 返回值

`Promise<TData>`
