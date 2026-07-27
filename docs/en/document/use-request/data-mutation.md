---
outline: deep
---

# Data Mutation

Sometimes you want to modify request results without re-fetching — e.g., add, delete, or update an item. Use `mutate` to manually update `data`.

```typescript
const useApi = createRequest({ dataKey: 'data' })

const { data, mutate } = useApi(fetchList)

// Directly update data
mutate([...data.value, newItem])

// Or use a function
mutate(prevData => prevData.filter(item => item.id !== 100))
```

::: demo
use-request/mutate
:::

## Optimistic Update

Optimistic update immediately updates the UI and sends a request in the background. If the request fails, data is automatically rolled back.

```typescript
const { optimisticUpdate } = useApi(updateService)

optimisticUpdate(prevData => ({ ...prevData, name: 'new name' }))
```

::: demo
use-request/optimistic-update
:::
