# eventBus — 事件总线

- **文件位置**: `packages/vue/foundation/eventBus.ts`
- **引入方式**: `import { eventBus } from 'kit/vue'`
- **依赖**: 无

模块级 `Map<string, 回调数组>` 实现的全局事件总线，用事件名分组：`distribute(name)` 拿到触发器，`subscribe(name, cb)` 订阅并返回取消句柄。

## 方法速查表

| 方法 | 作用 |
| --- | --- |
| [`distribute(name)`](#distribute-name-触发) | 拿到事件名的触发器 `{ complete }` |
| [`subscribe(name, callback)`](#subscribe-name-callback-订阅) | 订阅，返回 `{ cancel }` |
| [`once(name, callback)`](#once-name-callback-只触发一次) | 只触发一次的订阅（实现有缺陷，见注意事项） |

## 方法

### `distribute(name)` — 触发

若该事件名没有订阅列表则先创建，返回带 `complete` 的对象。

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 事件名 |

**返回值**

- `{ complete: (...params: any[]) => void }`：调用后按注册顺序依次执行该事件名的所有回调，参数原样透传（不会有返回值汇总）。

### `subscribe(name, callback)` — 订阅

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 事件名 |
| `callback` | `(...params: any[]) => void` | — | 触发时执行的回调 |

**返回值**

- `{ cancel: () => void }`：`cancel()` 通过下标 `splice` 移除本次订阅。

### `once(name, callback)` — 只触发一次

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 事件名 |
| `callback` | `(...params: any[]) => void` | — | 触发时执行的回调 |

**返回值**

- `void`

## 示例

```ts
import { eventBus } from 'kit/vue'

// 发布方
eventBus.distribute('user:logout').complete(userId)

// 订阅方：记得在组件卸载时取消
const { cancel } = eventBus.subscribe('user:logout', (id) => {
  console.log('logout', id)
})
onUnmounted(cancel)
```

---

> **注意（`once` 有缺陷）**：源码里 `const index = list.push(fn)` 保存的是 `push` 返回的**长度**，回调内部却用 `list.splice(index - 1, 1)` 删除，下标会随订阅顺序偏移（且只在首次触发后删除，删除目标不一定是自己）。需要「只触发一次」时建议用 `subscribe` + `cancel` 自行实现。
>
> **注意（`cancel` 按下标删除）**：`subscribe` 返回的 `cancel` 也用固定下标 `splice`，如果其它订阅在此之前被移除，可能删错条目；频繁增删订阅时请谨慎。
>
> 业务工程暂未使用，此处为最小示例。
