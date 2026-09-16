# cookies — Cookie 内存读写

- **文件位置**: `packages/vue/foundation/cookies.ts`
- **引入方式**: `import { cookies } from 'kit/vue'`
- **依赖**: 浏览器 `document.cookie`

把 `document.cookie` 一次解析进内存对象后的读写封装：首次调用任意方法时解析一次，之后所有操作都只作用于这份内存副本。**它不写 `document.cookie`**，所以 `set`/`remove` 只改变内存中的值，不会持久化，刷新页面即失效。

解析时会对值做 `decodeURIComponent`，读出来的是明文；解析只做一次，`document.cookie` 之后的外部变动不会自动同步，需要重新同步时调用 `refresh()`。非浏览器环境（SSR / worker / 单测）没有 `document`，按「没有任何 cookie」处理，不抛错。

## 方法速查表

| 方法 | 作用 |
| --- | --- |
| [`set(key, value)`](#set-key-value-写入内存) | 写入内存中的值 |
| [`get(key)`](#get-key-读取) | 读取值，不存在返回空串 |
| [`remove(key)`](#remove-key-删除) | 从内存中删除 |
| [`has(key)`](#has-key-是否存在) | 判断键是否存在 |
| [`all()`](#all-全部) | 拿到全部键值对象的副本 |
| [`refresh()`](#refresh-重新解析) | 丢弃缓存、重新解析 `document.cookie` |

## 方法

### `set(key, value)` — 写入内存

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | — | 键名 |
| `value` | `string` | — | 值 |

**返回值**

- `void`

> 只改内存副本，不写 `document.cookie`，不持久化，也不会被后续请求携带。

### `get(key)` — 读取

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | — | 键名 |

**返回值**

- `string`：存在则返回其值（已 URL 解码），否则返回 `""`。

### `remove(key)` — 删除

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | — | 键名 |

**返回值**

- `boolean`：恒为 `true`（键不存在时也返回 `true`）。

> 只删内存副本，不会清除浏览器里真实存在的 cookie。

### `has(key)` — 是否存在

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | — | 键名 |

**返回值**

- `boolean`

### `all()` — 全部

**返回值**

- `Record<string, string>`：内部缓存的**浅拷贝**，就地修改不会影响内部状态。

### `refresh()` — 重新解析

清空当前内存缓存，重新读取一次 `document.cookie`。

**返回值**

- `void`

**示例**

```ts
document.cookie = 'sid=2'
cookies.get('sid') // '1' —— 还是旧的
cookies.refresh()
cookies.get('sid') // '2'
```

## 示例

```ts
import { cookies } from 'kit/vue'

cookies.get('sid')        // 命中则返回值，否则 ''
cookies.has('sid')        // true / false
cookies.set('sid', '1')   // 只写内存
cookies.remove('sid')
cookies.all()             // { '其它 key': '...' }
```

---

> **注意**：解析只在首次调用时执行一次，之后 `document.cookie` 的变化不会同步进来（除非调用 `refresh()`）；写入也不会落盘。需要真正持久化请直接操作 `document.cookie` 或 `localStorage`。
>
> 业务工程暂未使用，此处为最小示例。
>
> **相关**：[helper](/vue/foundation/helper)
