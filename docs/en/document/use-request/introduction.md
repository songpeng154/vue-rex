---
outline: deep
---

# createRequest

`createRequest` is a factory function for creating request instances with bound data extraction logic.

## Basic Usage

```ts
import { createRequest } from 'vue-rex'

const useApi = createRequest({ dataKey: 'data' })

const { data, loading, error, run } = useApi(getUserList)
```

## Configuration

### dataKey

Data field path, supports dot notation. TypeScript automatically infers `data.value` type.

```ts
// Extract res.data
const useApi = createRequest({ dataKey: 'data' })

// Extract res.result.data
const useApi = createRequest({ dataKey: 'result.data' })
```

### options

Global defaults, overridden by local options when calling.

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

Global default plugins.

```ts
import { createRequest, definePlugin } from 'vue-rex'

const logPlugin = definePlugin(ctx => ({
  onBefore(params) {
    console.log('request start', params)
  },
}))

const useApi = createRequest({
  dataKey: 'data',
  plugins: [logPlugin],
})
```

## Options

Full configuration for `useApi(service, options)`:

### Behavior

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `manual` | `boolean` | `false` | Manual trigger only, no auto-execute |
| `ready` | `Ref<boolean>` | `true` | Whether request is allowed |
| `defaultParams` | `TParams` | - | Default params passed to service |
| `watchSource` | `true \| WatchSource \| WatchSource[]` | - | Watch sources, `true` for auto-collect |
| `watchDeep` | `boolean` | `false` | Deep watch |

### Loading

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `loadingDelay` | `MaybeRef<number>` | - | Delay before showing loading (ms) |
| `loadingKeep` | `MaybeRef<number>` | - | Minimum loading duration (ms) |

### Debounce / Throttle

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `debounceWait` | `MaybeRef<number>` | `500` | Debounce wait time (ms) |
| `debounceMaxWait` | `MaybeRef<number>` | - | Max debounce delay (ms) |
| `debounceLeading` | `MaybeRef<boolean>` | `false` | Invoke on leading edge |
| `debounceTrailing` | `MaybeRef<boolean>` | `true` | Invoke on trailing edge |
| `throttleWait` | `MaybeRef<number>` | `500` | Throttle wait time (ms) |
| `throttleLeading` | `MaybeRef<boolean>` | `true` | Invoke on leading edge |
| `throttleTrailing` | `MaybeRef<boolean>` | `true` | Invoke on trailing edge |

### Cache

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `cacheKey` | `string` | - | Cache key, enables caching and global sharing |
| `cacheTime` | `number` | `600000` | Cache expiration (ms), `Infinity` = never |
| `staleTime` | `number` | - | Data freshness time (ms), no request during this window |
| `getCache` | `(key, params) => CachedData` | - | Custom get cache |
| `setCache` | `(key, data) => void` | - | Custom set cache |

### Error handling

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `errorRetryCount` | `MaybeRef<number>` | - | Error retry count, `Infinity` = unlimited |
| `errorRetryInterval` | `MaybeRef<number>` | - | Retry interval (ms) |

### Polling

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `pollingInterval` | `MaybeRef<number>` | `0` | Polling interval (ms), > 0 enables |
| `pollingWhenDocumentHidden` | `MaybeRef<boolean>` | `false` | Continue polling when page hidden |
| `pollingErrorRetryCount` | `MaybeRef<number>` | `3` | Polling error retry count |

### Window focus

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `refreshOnWindowFocus` | `MaybeRef<boolean>` | `false` | Refresh on window focus |
| `focusTimespan` | `MaybeRef<number>` | `5000` | Focus refresh throttle (ms) |

### Data

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `initialData` | `TFormatData` | - | Initial value for data |
| `formatData` | `(data, rawData, params) => TFormatData` | - | Post-process extracted data |

### Callbacks

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `onBefore` | `(params) => void` | - | Before request |
| `onSuccess` | `(data, rawData, params) => void` | - | On success |
| `onError` | `(error, params) => void` | - | On error |
| `onFinally` | `(params) => void` | - | After request (success or error) |
| `onFinallyFetchDone` | `(params) => void` | - | After last request in a sequence |

## Return Value

| Property | Type | Description |
|:---|:---|:---|
| `data` | `ComputedRef<TFormatData>` | Extracted and formatted data |
| `rawData` | `ComputedRef<TData>` | Raw service response |
| `error` | `ComputedRef<any>` | Error from rejected service |
| `loading` | `ComputedRef<boolean>` | Request in progress |
| `finished` | `ComputedRef<boolean>` | Request completed |
| `params` | `ComputedRef<TParams>` | Current request params |
| `run` | `(...args) => Promise<void>` | Manual trigger (silent mode) |
| `runAsync` | `(...args) => Promise<TFormatData>` | Manual trigger (Promise mode, throws on error) |
| `debounceRun` | `(...args) => Promise<void>` | Debounced run |
| `throttleRun` | `(...args) => Promise<void>` | Throttled run |
| `refresh` | `() => Promise<void>` | Re-run with last params (silent mode) |
| `refreshAsync` | `() => Promise<TFormatData>` | Re-run with last params (Promise mode) |
| `cancel` | `() => void` | Cancel current request |
| `mutate` | `(data \| fn) => void` | Directly modify data |
| `optimisticUpdate` | `(data \| fn, params?) => void` | Optimistic update, auto-rollback on failure |
