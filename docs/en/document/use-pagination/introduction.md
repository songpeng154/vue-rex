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

const { list, total, page, pageSize, totalPage, isLastPage } = usePage(getUsers)
```

Change `page` or `pageSize` to auto-trigger a request.

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

Pass a `params` ref as the form model. `search()` commits search conditions and resets to page 1:

```typescript
const searchParams = ref({ page: 1, pageSize: 10, keyword: '' })

const { list, page, search } = usePage(getUsers, {
  params: searchParams,
})

// Search: commit current form values + page → 1 + request
const onSearch = () => search()

// Or pass explicit params (writes to form ref then commits)
search({ keyword: 'abc' })
```

Pagination uses the last committed search conditions — uncommitted form changes don't affect page requests.

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
| `params` | `Ref<TParams>` | - | Form params ref, page/pageSize are proxied via computed |
| `initialPage` | `number` | `1` | Initial page (used when no `params` provided) |
| `initialPageSize` | `number` | `10` | Initial page size (used when no `params` provided) |
| `resetPageWhenPageSizeChange` | `boolean` | `true` | Reset to page 1 when pageSize changes |
| `adjustPageWhenOutOfRange` | `boolean` | `true` | Auto-adjust page when it exceeds total pages |
| `formatList` | `(list, rawData, params) => TFormatData[]` | - | Transform list items |

## Return Value

Extends [createRequest return value](../use-request/introduction.md#return-value) with:

| Property | Type | Description |
|:---|:---|:---|
| `list` | `ComputedRef<TFormatData[]>` | Current page data |
| `total` | `ComputedRef<number>` | Total record count |
| `page` | `Ref<number>` | Current page (writable, proxied to params ref) |
| `pageSize` | `Ref<number>` | Page size (writable, proxied to params ref) |
| `totalPage` | `ComputedRef<number>` | Total pages |
| `isLastPage` | `ComputedRef<boolean>` | Whether last page |
| `search` | `(params?: TParams) => Promise` | Commit search conditions + page → 1 + request |
| `debounceSearch` | `DebouncedFunction` | Debounced search |
| `throttleSearch` | `DebouncedFunction` | Throttled search |
| `refresh` | `() => Promise` | Re-request with current params |
