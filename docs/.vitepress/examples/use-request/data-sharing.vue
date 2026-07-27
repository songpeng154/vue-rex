<script setup lang="ts">
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

interface Config {
  siteName: string
  version: string
  theme: string
}

const getConfig = async (): Promise<{ data: Config }> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return {
    data: {
      siteName: 'vue-rex 文档',
      version: '2.0.0',
      theme: 'light',
    },
  }
}

// 两个 useApi 调用共享同一个 cacheKey
// 数据只需请求一次，两个组件同时获得结果
const {
  data: dataA,
  loading: loadingA,
  run: runA,
} = useApi(getConfig, {
  cacheKey: 'shared-config',
})

const {
  data: dataB,
  loading: loadingB,
  run: runB,
} = useApi(getConfig, {
  cacheKey: 'shared-config',
})
</script>

<template>
  <div>
    <p class="desc">
      两个数据块共享同一个 cacheKey。只需发起一次请求，两个 useApi 实例都会收到相同的数据。
    </p>
    <div class="row">
      <div class="col">
        <h4>组件 A</h4>
        <div v-if="loadingA" class="state-box loading">
          加载中...
        </div>
        <div v-else-if="dataA" class="state-box success">
          <p>站点：{{ dataA.siteName }}</p>
          <p>版本：{{ dataA.version }}</p>
        </div>
        <button :disabled="loadingA" @click="runA()">
          刷新 A
        </button>
      </div>
      <div class="col">
        <h4>组件 B</h4>
        <div v-if="loadingB" class="state-box loading">
          加载中...
        </div>
        <div v-else-if="dataB" class="state-box success">
          <p>站点：{{ dataB.siteName }}</p>
          <p>版本：{{ dataB.version }}</p>
        </div>
        <button :disabled="loadingB" @click="runB()">
          刷新 B
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card { padding: 0; }
.desc { font-size: 13px; color: var(--vp-c-text-2); margin: 0 0 12px; }
.row { display: flex; gap: 16px; }
.col { flex: 1; }
h4 { margin: 0 0 8px; font-size: 14px; }
.state-box { padding: 12px; border-radius: 6px; margin-bottom: 8px; font-size: 14px; }
.loading { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }
.success { background: var(--vp-c-brand-soft); }
p { margin: 0 0 4px; }
button { background: #5e7aeb; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
