# naiveUI — naive-ui 小工具

- **文件位置**: `packages/vue/foundation/naiveUI.ts`
- **引入方式**: `import { naiveUI } from 'kit/vue'`
- **依赖**: `vue`、`vue-router`（渲染 `RouterLink`）

目前只提供一个辅助函数：为 naive-ui 的菜单/下拉项生成「渲染成 `RouterLink` 的 label」。

## 方法速查表

| 方法 | 作用 |
| --- | --- |
| [`createdRouterLinkLabel(labelText, routerLinkOptions)`](#createdrouterlinklabel-labeltext-routerlinkoptions-生成-routerlink-label) | 生成 `RouterLink` 的函数式 label |

## 方法

### `createdRouterLinkLabel(labelText, routerLinkOptions)` — 生成 RouterLink label

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `labelText` | `string` | — | 显示文本 |
| `routerLinkOptions` | `RouterLinkProps`（含 `to`、`target` 等） | — | 透传给 `RouterLink` 的 props |

**返回值**

- `() => VNode`：一个无状态函数组件，把它作为 `label` 传给 naive-ui 的菜单项即可渲染出带跳转的文本。

## 示例

```ts
import { h } from 'vue'
import { naiveUI } from 'kit/vue'

const menuOptions = [
  {
    label: naiveUI.createdRouterLinkLabel('首页', { to: { name: 'home' } }),
    key: 'home'
  }
]
```

---

> **说明**：`services/naiveUIService.ts` 里的 `createdRouterLinkLabel` 与本文件实现相同（历史遗留的重复代码），两者可以互相替代；`kit/vue` 入口同时导出了 `naiveUI`（foundation）与 `naiveUIService`（services）。详见 [naiveUIService](/vue/services/naive-ui)。
>
> 组件侧更常用的是 [NaiveUIMenu](/vue/components/naive/NaiveUIMenu)，它在内部就是用它生成菜单 label 的。
