---
outline: deep
---

# Loading

## Loading Delay

When a service completes very quickly (e.g., within 200ms), immediately showing a loading indicator can cause visual flicker. Set a delay threshold to only show loading when the operation takes longer.

```typescript
const useApi = createRequest({ dataKey: 'data' })

const { loading } = useApi(service, {
  loadingDelay: 300, // only show loading after 300ms
})
```

::: demo
use-request/loading-delay
:::

## Loading Keep

`loadingKeep` ensures loading lasts at least the specified duration to avoid flickering.

- If request time < `loadingKeep`, loading lasts `loadingKeep` ms
- If request time > `loadingKeep`, loading lasts the actual request time

::: demo
use-request/loading-keep
:::

## Combined Usage

In practice, `loadingDelay` and `loadingKeep` are often used together: `loadingDelay` prevents flicker for fast requests, `loadingKeep` ensures loading provides enough visual feedback.

```typescript
const { loading } = useApi(service, {
  loadingDelay: 200, // don't show loading for requests under 200ms
  loadingKeep: 500, // loading lasts at least 500ms
})
```

How it works: after calling run, wait 200ms — if the request completes before that, loading never shows; if it exceeds 200ms, loading appears and stays for at least 500ms.

## API

| Property | Type | Default | Description |
|:---|:---|:---|:---|
| `loadingDelay` | `MaybeRef<number>` | - | Delay before showing loading (ms) |
| `loadingKeep` | `MaybeRef<number>` | - | Minimum loading duration (ms) |
