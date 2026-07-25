---
outline: deep
---

# createRequest 介绍

`createRequest` 是一个工厂函数，用于创建绑定了数据提取逻辑的请求实例。

## 基本用法

```ts
import { createRequest } from 'vue-rex'

// 创建实例
const useApi = createRequest({ dataKey: 'data' })

// 组件中使用
const { data, loading, error, run } = useApi(getUserList)
```

## 配置选项

### dataKey

数据字段路径，支持点号嵌套。TypeScript 会自动推导 `data.value` 的类型。

```ts
// 提取 res.data
const useApi = createRequest({ dataKey: 'data' })

// 提取 res.result.data
const useApi = createRequest({ dataKey: 'result.data' })

// 提取 res.data.attributes
const useApi = createRequest({ dataKey: 'data.attributes' })
```

### options

全局默认配置，会被调用时的局部 options 覆盖。

```ts
const useApi = createRequest({
  dataKey: 'data',
  options: {
    refreshOnWindowFocus: true,
    debounceWait: 300,
  },
})
```

### plugins

全局默认插件。

```ts
import { createRequest, definePlugin } from 'vue-rex'

const logPlugin = definePlugin(ctx => ({
  onBefore(params) {
    console.log('请求开始', params)
  },
}))

const useApi = createRequest({
  dataKey: 'data',
  plugins: [logPlugin],
})
```

## Options

`useApi(service, options)` 的完整配置项：

### 行为控制

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `manual` | `boolean` | `false` | 是否手动触发，默认自动执行 |
| `ready` | `Ref<boolean>` | `true` | 当前是否允许发送请求 |
| `defaultParams` | `TParams` | - | 传给 service 的默认参数 |
| `watchSource` | `true \| WatchSource \| WatchSource[]` | - | 监听依赖变化自动刷新，`true` 自动收集 |
| `watchDeep` | `boolean` | `false` | 是否深层监听 |

### Loading

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `loadingDelay` | `MaybeRef<number>` | - | loading 延迟显示时间(ms)，避免闪烁 |
| `loadingKeep` | `MaybeRef<number>` | - | loading 最短持续时间(ms) |

### 防抖 / 节流

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `debounceWait` | `MaybeRef<number>` | `500` | 防抖等待时间(ms) |
| `debounceMaxWait` | `MaybeRef<number>` | - | 防抖最大延迟(ms) |
| `debounceLeading` | `MaybeRef<boolean>` | `false` | 防抖是否在开始时调用 |
| `debounceTrailing` | `MaybeRef<boolean>` | `true` | 防抖是否在结束时调用 |
| `throttleWait` | `MaybeRef<number>` | `500` | 节流等待时间(ms) |
| `throttleLeading` | `MaybeRef<boolean>` | `true` | 节流是否在开始时调用 |
| `throttleTrailing` | `MaybeRef<boolean>` | `true` | 节流是否在结束时调用 |

### 缓存

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `cacheKey` | `string` | - | 缓存键，设置后启用缓存，相同 key 全局共享 |
| `cacheTime` | `number` | `600000` | 缓存过期时间(ms)，`Infinity` 永不过期 |
| `staleTime` | `number` | - | 数据保鲜时间(ms)，期间不发起新请求 |
| `getCache` | `(key, params) => CachedData` | - | 自定义获取缓存 |
| `setCache` | `(key, data) => void` | - | 自定义设置缓存 |

### 错误处理

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `errorRetryCount` | `MaybeRef<number>` | - | 错误重试次数，`Infinity` 无限重试 |
| `errorRetryInterval` | `MaybeRef<number>` | - | 重试间隔(ms) |

### 轮询

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `pollingInterval` | `MaybeRef<number>` | `0` | 轮询间隔(ms)，> 0 启用 |
| `pollingWhenDocumentHidden` | `MaybeRef<boolean>` | `false` | 页面隐藏时是否继续轮询 |
| `pollingErrorRetryCount` | `MaybeRef<number>` | `3` | 轮询错误重试次数 |

### 窗口聚焦

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `refreshOnWindowFocus` | `MaybeRef<boolean>` | `false` | 窗口获取焦点时刷新 |
| `focusTimespan` | `MaybeRef<number>` | `5000` | 聚焦刷新节流间隔(ms) |

### 数据

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `initialData` | `TFormatData` | - | data 初始值 |
| `formatData` | `(data, rawData, params) => TFormatData` | - | 对提取后的数据做二次处理 |

### 回调

| 选项 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `onBefore` | `(params) => void` | - | 请求发起前 |
| `onSuccess` | `(data, rawData, params) => void` | - | 请求成功后 |
| `onError` | `(error, params) => void` | - | 请求失败后 |
| `onFinally` | `(params) => void` | - | 请求结束（成功/失败都触发） |
| `onFinallyFetchDone` | `(params) => void` | - | 连续请求中最后一次完成时 |

## 返回值

| 属性 | 类型 | 说明 |
|:---|:---|:---|
| `data` | `ComputedRef<TFormatData>` | service 返回的数据（经过 dataKey 提取 + formatData 处理） |
| `rawData` | `ComputedRef<TData>` | service 原始返回值 |
| `error` | `ComputedRef<any>` | service reject 的错误 |
| `loading` | `ComputedRef<boolean>` | 是否正在请求中 |
| `finished` | `ComputedRef<boolean>` | 请求是否已完成 |
| `params` | `ComputedRef<TParams>` | 当前请求参数 |
| `run` | `(...args) => Promise<void>` | 手动触发请求（静默模式，不抛错） |
| `runAsync` | `(...args) => Promise<TFormatData>` | 手动触发请求（Promise 模式，抛错） |
| `debounceRun` | `(...args) => Promise<void>` | 带防抖的 run |
| `throttleRun` | `(...args) => Promise<void>` | 带节流的 run |
| `refresh` | `() => Promise<void>` | 用上次参数重新请求（静默模式） |
| `refreshAsync` | `() => Promise<TFormatData>` | 用上次参数重新请求（Promise 模式） |
| `cancel` | `() => void` | 取消当前请求 |
| `mutate` | `(data \| fn) => void` | 直接修改 data |
| `optimisticUpdate` | `(data \| fn, params?) => void` | 乐观更新，失败自动回退 |
