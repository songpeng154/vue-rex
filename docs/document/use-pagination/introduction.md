---
outline: deep
---

# createPagination 介绍

`createPagination` 用于创建分页请求实例，基于 `createRequest`，支持其全部功能。

## 基本用法

```typescript
import { createPagination } from 'vue-rex'

// 假设后端返回 { code: 0, data: { list: User[], total: number } }
const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
})

interface User { id: number; name: string }

const getUsers = (params: { page: number; pageSize: number }) =>
  server.get<{ data: { list: User[]; total: number } }>('/api/users', { params })

const { list, total, page, pageSize, totalPage, isLastPage } = usePage(getUsers)
```

修改 `page` 或 `pageSize` 自动触发请求。

::: demo
use-pagination/base
:::

## 自定义分页字段

后端分页字段名不是 `page` / `pageSize` 时，通过 `paginationFields` 映射：

```typescript
const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
  paginationFields: { page: 'current', pageSize: 'size' },
})

// service 收到的 params 里是 current / size
const getUsers = (params: { current: number; size: number }) =>
  server.get('/api/users', { params })
```

::: demo
use-pagination/pagination-fields
:::

## 搜索 + 分页

传入 `params` ref 作为表单模型，`search()` 提交搜索条件并自动回到第一页：

```typescript
const searchParams = ref({ page: 1, pageSize: 10, keyword: '' })

const { list, page, search } = usePage(getUsers, {
  params: searchParams,
})

// 搜索：提交表单当前值 + page 归 1 + 发请求
const onSearch = () => search()

// 也可以显式传参（会写入表单 ref 再提交）
search({ keyword: 'abc' })
```

翻页时使用的是上次 `search()` 提交的搜索条件，表单中未提交的改动不会影响分页请求。

::: demo
use-pagination/search-with-pagination
:::

## formatList

对列表项做二次处理（字段重命名、格式化等），`total` 不受影响：

```typescript
const { list } = usePage(getUsers, {
  formatList: (list) =>
    list.map(item => ({
      ...item,
      fullName: `${item.lastName}${item.firstName}`,
    })),
})
```

::: demo
use-pagination/format-list
:::

## 配置

| 配置项 | 类型 | 说明 |
|:---|:---|:---|
| `listKey` | `string` | 列表字段路径，支持点号 `data.records` |
| `totalKey` | `string` | 总条数字段路径，支持点号 |
| `paginationFields` | `{ page: string, pageSize: string }` | 将 page/pageSize 映射为后端参数名，如 `{ page: 'current', pageSize: 'size' }` |
| `options` | `object` | 全局默认配置，被调用时局部 options 覆盖 |

## Options

`usePage(service, options)` 支持 [createRequest 全部 Options](../use-request/introduction.md#options)，外加：

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `params` | `Ref<TParams>` | - | 表单参数 ref，page/pageSize 会建立 computed 代理 |
| `initialPage` | `number` | `1` | 初始页码（不传 params 时生效） |
| `initialPageSize` | `number` | `10` | 初始每页条数（不传 params 时生效） |
| `resetPageWhenPageSizeChange` | `boolean` | `true` | pageSize 变化时是否重置到第一页 |
| `adjustPageWhenOutOfRange` | `boolean` | `true` | page 超出总页数时是否自动调整 |
| `formatList` | `(list, rawData, params) => TFormatData[]` | - | 对列表项做二次处理 |

## 返回值

在 [createRequest 返回值](../use-request/introduction.md#返回值) 基础上，额外提供：

| 属性 | 类型 | 说明 |
|:---|:---|:---|
| `list` | `ComputedRef<TFormatData[]>` | 当前页数据列表 |
| `total` | `ComputedRef<number>` | 数据总条数 |
| `page` | `Ref<number>` | 当前页码（可写，代理到 params ref） |
| `pageSize` | `Ref<number>` | 每页条数（可写，代理到 params ref） |
| `totalPage` | `ComputedRef<number>` | 总页数 |
| `isLastPage` | `ComputedRef<boolean>` | 是否最后一页 |
| `search` | `(params?: TParams) => Promise` | 提交搜索条件 + page 归 1 + 发请求 |
| `debounceSearch` | `DebouncedFunction` | 防抖版 search |
| `throttleSearch` | `DebouncedFunction` | 节流版 search |
| `refresh` | `() => Promise` | 用当前参数重新请求 |
