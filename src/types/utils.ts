import type { ComputedRef, MaybeRef } from 'vue'

export type Nullable<T> = T | null

export type Undefinable<T> = T | undefined

export type Recordable<T = any> = Record<string, T>

export type MaybePromise<T> = T | Promise<T>

export type AnyFunction = (...args: any[]) => any

// 将 T 的每个属性类型用 MaybeRef 包裹
export type WrapWithMaybeRef<T extends Recordable> = {
  [K in keyof T]: MaybeRef<T[K]>
}

// 将 T 的每个属性类型用 ComputedRef 包裹
export type WrapWithComputed<T extends Recordable> = {
  [K in keyof T]: ComputedRef<T[K]>;
}

// ─── 点号路径类型工具 ─────────────────────────────────────────

/** 将点号路径字符串拆分为元组：'a.b.c' → ['a', 'b', 'c'] */
export type SplitPath<S extends string, Acc extends string[] = []>
  = S extends `${infer Head}.${infer Tail}`
    ? SplitPath<Tail, [...Acc, Head]>
    : [...Acc, S]

/** 按元组路径从 T 中取值 */
export type PathValueByTuple<T, Keys extends readonly string[]>
  = Keys extends readonly [infer First, ...infer Rest]
    ? First extends keyof T
      ? Rest extends readonly string[]
        ? PathValueByTuple<T[First], Rest>
        : never
      : never
    : T

/** 从 T 中按点号路径取值：PathValue<Obj, 'a.b'> → Obj['a']['b'] */
export type PathValue<T, P extends string> = PathValueByTuple<T, SplitPath<P>>

/** 从 T 中按路径提取数组元素类型 */
export type PathItem<T, P extends string> = PathValue<T, P> extends (infer Item)[] ? Item : never
