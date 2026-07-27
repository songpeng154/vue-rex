---
outline: deep
---

[createRequest](./home) / **RequestResult**

# 类型：RequestResult

[createRequest](./home.md)返回的工厂函数的返回值类型

## 类型声明
```typescript
import { ComputedRef } from 'vue'

// 将 T 的每个属性类型用 ComputedRef 包裹
type WrapWithComputed<T extends Record<string, any>> = {
  [K in keyof T]: ComputedRef<T[K]>;
}

export type RequestResult<
  // 数据
  TData = any,
  // 方法参数
  TParams extends any[] = any[],
  TSerialized = TData,
  // 格式化数据
  TFormatData = TSerialized,
> = WrapWithComputed<RequestState<TData, TParams, TSerialized, TFormatData>>
  & RequestMethod<TData, TParams, TSerialized, TFormatData>
```

## 泛型

| 名称            | 默认值     | 继承      | 可选  | 描述        |
|:--------------|:--------|:--------|:----|-----------|
| `TData`       | `any`   |         | `是` | 数据类型      |
| `TParams`     | `any[]` | `any[]` | `是` | 函数入参类型    |
| `TSerialized` | `TData` |         | `是` | 序列化后的数据类型 |
| `TFormatData` | `TSerialized` |    | `是` | 格式化数据后的类型 |

## 引用

* [RequestState](request-state)
* [RequestMethod](request-method)
