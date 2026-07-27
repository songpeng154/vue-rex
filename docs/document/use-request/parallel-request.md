---
outline: deep
---

# 并行请求

一次 `useApi` 调用，通过 `run` 传入不同参数同时发起多个请求，配合 `onSuccess` 将结果收集到各自的位置。

```typescript
import { reactive } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

const getLibs = async (type: string) => {
  // ...返回 { data: string[] }
}

const list = reactive<Record<string, string[]>>({ vue: [], react: [], svelte: [] })

const { run } = useApi(getLibs, {
  manual: true,
  onSuccess(data, _rawData, params) {
    list[params[0]] = data
  },
})

// 同时发起三个请求，互不等待
run('vue')
run('react')
run('svelte')
```

::: demo
use-request/parallel-request
:::
