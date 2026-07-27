---
outline: deep
---

# 快速开始

本节介绍如何快速上手。

## 环境要求

- **Vue >= 3.3**

## 安装

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

## 基本用法

```vue
<script setup lang="ts">
import { createRequest } from 'vue-rex'

// 创建请求实例
const useApi = createRequest({ dataKey: 'data' })

// 定义 service
const getUserList = async () => {
  const res = await fetch('/api/users')
  return res.json() // { data: [...] }
}

// 组件中使用
const { data, loading, error } = useApi(getUserList)
</script>

<template>
  <div>
    <div v-if="loading">
      加载中...
    </div>
    <div v-if="error">
      错误：{{ error.message }}
    </div>
    <div v-if="data">
      <div v-for="user in data" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>
```

## 分页用法

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
