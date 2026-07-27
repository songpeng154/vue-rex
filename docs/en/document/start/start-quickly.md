---
outline: deep
---

# Quick Start

## Requirements

- **Vue >= 3.3**

## Installation

::: code-group

```bash [npm]
npm install vue-rex
```

```bash [pnpm]
pnpm add vue-rex
```

```bash [yarn]
yarn add vue-rex
```

:::

## Basic Usage

```vue
<script setup lang="ts">
import { createRequest } from 'vue-rex'

// Create request instance
const useApi = createRequest({ dataKey: 'data' })

// Define service
const getUserList = async () => {
  const res = await fetch('/api/users')
  return res.json() // { data: [...] }
}

// Use in component
const { data, loading, error } = useApi(getUserList)
</script>

<template>
  <div>
    <div v-if="loading">
      Loading...
    </div>
    <div v-if="error">
      Error: {{ error.message }}
    </div>
    <div v-if="data">
      <div v-for="user in data" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>
```

## Pagination Usage

```vue
<script setup lang="ts">
import { createPagination } from 'vue-rex'

const usePage = createPagination({
  listKey: 'data.records',
  totalKey: 'data.total',
})

const getUserPage = async (params: { page: number, pageSize: number }) => {
  const res = await fetch(`/api/users?page=${params.page}&size=${params.pageSize}`)
  return res.json()
}

const { list, total, page, pageSize } = usePage(getUserPage)
</script>
```
