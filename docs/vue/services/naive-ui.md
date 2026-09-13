# naiveUIService — naive-ui 辅助

- **文件位置**: `packages/vue/services/naiveUIService.ts`
- **引入方式**: `import { naiveUIService } from 'kit/vue'`
- **依赖**: `vue`、`vue-router`（渲染 `RouterLink`）

提供一个辅助函数：给 naive-ui 的菜单/下拉项生成「渲染成 `RouterLink` 的 label」。

## 方法速查表

| 方法 | 作用 |
| --- | --- |
| [`createdRouterLinkLabel(labelText, routerLinkOptions)`](#createdrouterlinklabel-生成-routerlink-label) | 生成 `RouterLink` 的函数式 label |

## 方法

### `createdRouterLinkLabel(labelText, routerLinkOptions)` — 生成 RouterLink label

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `labelText` | `string` | — | 显示文本 |
| `routerLinkOptions` | `AllowedComponentProps & ComponentCustomProps & VNodeProps & RouterLinkProps` | — | 透传给 `RouterLink` 的 props（`to`、`target` 等） |

**返回值**

- `() => VNode`：无状态函数组件，可直接作为 naive-ui 菜单项的 `label`

## 示例

```ts
import { naiveUIService } from 'kit/vue'

const options = [
  {
    label: naiveUIService.createdRouterLinkLabel('首页', { to: { name: 'home' } }),
    key: 'home'
  }
]
```

## 注意事项

- 与 foundation 的 [naiveUI](/vue/foundation/naive-ui) 里同名函数**实现完全相同**（历史遗留的重复代码），两者可互换使用；`kit/vue` 入口同时导出了 `naiveUI`（foundation）与 `naiveUIService`（services）。
- 返回的是 VNode 渲染函数而不是字符串，因此这类 `label` **不参与 naive-ui 的内置文本过滤/搜索**。
- 与路由菜单配合使用时，通常不用手写它：[generateRouterMenuOptions](/vue/services/naive-router-menu) 与 [NaiveUIMenu](/vue/components/naive/NaiveUIMenu) 内部都会调用。

---

> 业务工程暂未使用，示例为最小用法。
