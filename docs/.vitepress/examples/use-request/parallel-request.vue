<script setup lang="ts">
import { reactive } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟不同技术栈的库列表
const getLibs = async (type: string): Promise<{ data: string[] }> => {
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
  const data: Record<string, string[]> = {
    vue: ['Vue 3', 'Vue Router', 'Pinia', 'Vite'],
    react: ['React 19', 'React Router', 'Redux', 'Next.js'],
    svelte: ['Svelte', 'SvelteKit', 'Threlte'],
  }
  return { data: data[type] || [] }
}

const list = reactive<Record<string, string[]>>({
  vue: [],
  react: [],
  svelte: [],
})

// 一次 useApi 调用，通过 onSuccess 把结果写入对应的 key
const { run } = useApi(getLibs, {
  manual: true,
  onSuccess(data, _rawData, params) {
    list[params[0]] = data
  },
})

// 同时发起三个请求
run('vue')
run('react')
run('svelte')
</script>

<template>
  <div>
    <p class="desc">
      一次 useApi 调用 + 三次 run，通过 onSuccess 回调将结果写入不同 key，三个请求同时发出、互不覆盖。
    </p>
    <div class="columns">
      <div v-for="(items, key) in list" :key="key" class="col">
        <h3>{{ key }}</h3>
        <ul v-if="items.length">
          <li v-for="item in items" :key="item">
            {{ item }}
          </li>
        </ul>
        <p v-else class="empty">
          加载中...
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.columns { display: flex; gap: 16px; }
.col { flex: 1; }
h3 { margin: 0 0 8px; font-size: 15px; text-transform: capitalize; }
ul { margin: 0; padding-left: 18px; }
li { margin-bottom: 4px; font-size: 14px; }
.empty { color: var(--vp-c-text-3); font-size: 13px; margin: 0; }
</style>
