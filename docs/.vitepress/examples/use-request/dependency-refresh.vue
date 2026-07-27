<script setup lang="ts">
import { ref } from 'vue'
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

// 模拟根据分类获取库列表
const getLibs = async (type: number) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const vueLibs = ['Vue 3', 'Vue Router', 'Pinia', 'Vite']
  const reactLibs = ['React 19', 'React Router', 'Redux', 'Next.js']
  return { data: type === 0 ? vueLibs : reactLibs }
}

const type = ref(0)

// watchSource: type —— 监听 type 变化，自动用新参数重新请求
const { data, loading } = useApi(() => getLibs(type.value), {
  watchSource: type,
})
</script>

<template>
  <div>
    <p class="desc">
      切换选项时自动刷新数据，无需手动调用 run
    </p>
    <div class="tabs">
      <label :class="type === 0 ? 'active' : ''">
        <input v-model="type" :value="0" type="radio"> Vue 生态
      </label>
      <label :class="type === 1 ? 'active' : ''">
        <input v-model="type" :value="1" type="radio"> React 生态
      </label>
    </div>
    <div v-if="loading" class="box loading">
      ⏳ 加载中...
    </div>
    <ul v-else-if="data">
      <li v-for="item in data" :key="item">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.tabs { display: flex; gap: 16px; margin-bottom: 12px; }
label { cursor: pointer; padding: 4px 12px; border-radius: 4px; font-size: 14px; }
label.active { background: #5e7aeb; color: #fff; }
input[type="radio"] { display: none; }
.box { padding: 12px; border-radius: 6px; }
.loading { background: var(--vp-c-bg-soft); }
ul { margin: 0; padding-left: 20px; }
li { margin-bottom: 4px; }
</style>
