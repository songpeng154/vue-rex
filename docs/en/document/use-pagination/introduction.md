---
outline: deep
---

# createPagination

`createPagination` creates paginated request instances, built on top of `createRequest` with full feature support.

## Basic Usage

```typescript
import { createPagination } from 'vue-rex'

// Backend returns { code: 0, data: { list: User[], total: number } }
const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
})

interface User { id: number; name: string }

const getUsers = (params: { page: number; pageSize: number }) =>
  server.get<{ data: { list: User[]; total: number } }>('/api/users', { params })

const { list, total, page, pageSize, totalPage, isLastPage, reset } = usePage(getUsers)
```

Change `page` or `pageSize` to auto-trigger a request; call `reset()` to return to page 1.

::: demo
use-pagination/base
:::

## Custom Pagination Fields

When the backend uses different field names, map them with `paginationFields`:

```typescript
const usePage = createPagination({
  listKey: 'data.list',
  totalKey: 'data.total',
  paginationFields: { page: 'current', pageSize: 'size' },
})

// service receives current / size instead of page / pageSize
const getUsers = (params: { current: number; size: number }) =>
  server.get('/api/users', { params })
```

::: demo
use-pagination/pagination-fields
:::

## Search + Pagination

Reset to page 1 and push new conditions on search: `page.value = 1` + `run(params)`.

```typescript
const searchParams = ref({ page: 1, pageSize: 10, keyword: '' })

const { list, page, run } = usePage(getUsers, {
  defaultParams: searchParams.value,
})

const onSearch = () => {
  page.value = 1
  run({ ...searchParams.value, page: 1 })
}
```

::: demo
use-pagination/search-with-pagination
:::

## formatList

Transform list items (rename fields, format values, etc.) while `total` stays unchanged:

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

## Load More

Set `addedMode: true` to append data on page change instead of replacing:

::: demo
use-pagination/added-mode
:::

## Scroll Loading

Use `target` to specify a scroll container; automatically loads the next page when scrolled to the bottom:

::: demo
use-pagination/target
:::

## Configuration

| Config | Type | Description |
|:---|:---|:---|
| `listKey` | `string` | List field path, supports dot notation `data.records` |
| `totalKey` | `string` | Total count field path, supports dot notation |
| `paginationFields` | `{ page: string, pageSize: string }` | Map page/pageSize to backend param names, e.g. `{ page: 'current', pageSize: 'size' }` |
| `options` | `object` | Global defaults, overridden by local options |

## Options

`usePage(service, options)` supports [all createRequest Options](../use-request/introduction.md#options), plus:

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `initialPage` | `number` | `1` | Initial page number |
| `initialPageSize` | `number` | `10` | Initial page size |
| `pageWatch` | `boolean` | `true` | Auto-request on page change |
| `resetPageWhenPageSizeChange` | `boolean` | `true` | Reset to page 1 when pageSize changes |
| `formatList` | `(list, rawData, params) => TFormatData[]` | - | Transform list items |

## Return Value

Extends [createRequest return value](../use-request/introduction.md#return-value) with:

| Property | Type | Description |
|:---|:---|:---|
| `list` | `ComputedRef<TFormatData[]>` | Current page data |
| `total` | `ComputedRef<number>` | Total record count |
| `page` | `Ref<number>` | Current page (writable) |
| `pageSize` | `Ref<number>` | Page size (writable) |
| `totalPage` | `ComputedRef<number>` | Total pages |
| `isLastPage` | `ComputedRef<boolean>` | Whether last page |
| `reset` | `() => void` | Reset to first page |
