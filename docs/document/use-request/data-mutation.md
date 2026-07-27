---
outline: deep
---

# 数据突变

某些场景中我们希望在不重新请求接口的前提下，直接修改已有的请求结果，比如新增、删除、更新一条数据。此时可以使用 `mutate` 手动更新 `data` 数据。

```typescript
const useApi = createRequest({ dataKey: 'data' })

const { data, mutate } = useApi(fetchList)

// 手动更新数据
mutate([...data.value, newItem])

// 或使用函数形式更新
mutate(prevData => prevData.filter(item => item.id !== 100))
```

::: demo
use-request/mutate
:::

## 乐观更新

乐观更新是数据突变的一种特殊形式，通常用于用户操作后立即更新 UI，同时在后台发送请求修改数据，如果请求失败则自动回滚。

```typescript
const { optimisticUpdate } = useApi(updateService)

// 立即更新 UI，后台发起请求
optimisticUpdate(prevData => ({ ...prevData, name: 'new name' }))
```

::: demo
use-request/optimistic-update
:::
