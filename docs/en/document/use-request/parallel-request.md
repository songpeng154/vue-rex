---
outline: deep
---

# Parallel Request

A single `useApi` call, using `run` with different params to fire multiple requests in parallel. Use `onSuccess` to collect results into separate keys.

```typescript
import { reactive } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

const getLibs = async (type: string) => {
  // ...returns { data: string[] }
}

const list = reactive<Record<string, string[]>>({ vue: [], react: [], svelte: [] })

const { run } = useApi(getLibs, {
  manual: true,
  onSuccess(data, _rawData, params) {
    list[params[0]] = data
  },
})

// Fire three requests simultaneously
run('vue')
run('react')
run('svelte')
```

::: demo
use-request/parallel-request
:::
