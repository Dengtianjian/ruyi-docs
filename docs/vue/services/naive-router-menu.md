# naiveRouterMenuService — 由路由生成菜单

- **文件位置**: `packages/vue/services/naiveRouterMenuService.ts`
- **引入方式**: `import { generateRouterMenuOptions } from 'kit/vue'`（同时导出类型 `TRuyiRouteMetaNaiveUIMenu`）
- **依赖**: `vue-router`（仅类型与 `RouterLink`）

把 vue-router 的路由表转换成菜单数组（`RTMenuOption[]`），供 [RNaiveRouterMenu](/vue/components/naive/RNaiveRouterMenu)、[RRouterMenu](/vue/components/base/RRouterMenu) 等组件直接使用。

菜单元信息写在 **`meta.naiveUIRouteMenu`**（兼容历史的 `meta.menu`）。

## 方法

### `generateRouterMenuOptions<RouteMeta>(Routes, level?, RouteName?)`

**参数**

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `Routes` | `TRuyiRouteRecordRaw<RouteMeta>[]` | — | 路由表（vue-router `RouteRecordRaw` 加 `children` 递归类型） |
| `level` | `number \| number[] \| boolean` | `false` | `false` 表示层级过滤；传数字/数组时只保留 `meta.naiveUIRouteMenu.level` 命中的路由 |
| `RouteName` | `string` | `null` | 只从该路由的 `children` 生成菜单（先按 name 定位） |

**返回值**

- `RTMenuOption<RouteMeta>[]`：按 `index` 升序排序

## 菜单元信息字段（`meta.naiveUIRouteMenu`）

类型为 `TRuyiRouteMetaNaiveUIMenu`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `show` | `boolean` | 是否显示（不写则视为显示，由组件决定） |
| `disabled` | `boolean` | 禁用 |
| `type` | `'group' \| 'list'` | `group`：渲染为分组（会生成空 `children`）；`list`：有 children 就继续展开，但不生成跳转 label |
| `index` | `number` | 排序序号，缺省为当前层已生成的菜单数 + 1 |
| `level` | `number` | 层级标记，配合 `level` 参数过滤 |
| `label` | `string \| (() => VNodeChild)` | 菜单文本或自定义 label（未写时用 `meta.title`） |
| `linkProps` | `RouterLinkProps` | 透传给 `RouterLink` 的 props（如 `target="_blank"`） |
| `extra` | `string \| (() => VNodeChild)` | naive-ui 菜单项右侧内容 |
| `icon` | `() => VNode` | 图标渲染函数 |

## 示例

```ts
import { generateRouterMenuOptions } from 'kit/vue'
import type { TRuyiRouteMetaNaiveUIMenu } from 'kit/vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
    meta: {
      title: '首页',
      naiveUIRouteMenu: { index: 1, icon: () => h(HomeIcon) }
    } as TRuyiRouteMetaNaiveUIMenu
  }
]

const menuOptions = generateRouterMenuOptions(routes)
```

## 注意事项

- **只有写了 `meta.naiveUIRouteMenu`（或旧字段 `meta.menu`）的路由才会进菜单**；没写的路由会被跳过，但它的 `children` 仍会被继续遍历。
- 未指定 `type` 时，`label` 会自动用 `NaiveUI.createdRouterLinkLabel` 包成 `RouterLink`，跳转目标是 `{ name: route.name }`。
- 路由 **`name` 必填**（源码直接 `RouteItem.name.toString()`），存在匿名路由时会抛错。
- `TRuyiRouteRecordRaw` 没有从 `kit/vue` 入口导出，需要按子路径引入：`kit/vue/types/declare/vue-router.ts`。
- 业务工程暂未使用，示例为最小用法。

---

> **相关**：[types](/vue/types/index)、[NaiveUIMenu](/vue/components/naive/NaiveUIMenu)
