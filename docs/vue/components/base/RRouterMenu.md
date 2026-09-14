# RRouterMenu — 路由菜单（naive-ui 版）

- **文件位置**: `packages/vue/components/Base/RRouterMenu.vue`
- **引入方式**: `import RRouterMenu from 'kit/vue/components/Base/RRouterMenu.vue'`
- **依赖**: `naive-ui`（`n-menu`）、`vue-router`；建议外层有 [NaiveUIProvider](/vue/components/naive/NaiveUIProvider)

把 [RTMenuOption](/vue/types/index) 数组渲染成 naive-ui 菜单，使用 `$attrs` 透传所有 `n-menu` 属性，并根据当前路由自动计算选中项与需要展开的父级。

## 示例

```vue
<template>
  <RRouterMenu :options="menuOptions" />
</template>

<script setup lang="ts">
import { generateRouterMenuOptions } from 'kit/vue'
import RRouterMenu from 'kit/vue/components/Base/RRouterMenu.vue'
import routes from '@/router/routes'

const menuOptions = generateRouterMenuOptions(routes)
</script>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `options` | `RTMenuOption[]` | — | 否 | 菜单数据，通常由 [`generateRouterMenuOptions`](/vue/services/naive-router-menu) 生成 |

## Emits / Slots

无（选中值由组件内部维护，不对外事件）；未声明的属性全部透传给 `n-menu`。

## 选中与展开逻辑

- 初始选中值为当前路由 name；路由解析（`beforeResolve`）时重新计算。
- 遍历 `options`，若某项的 `childrenNames` 命中当前路由 name，则选中该项，并把它放进 `default-expanded-keys`（即只展开一层父级）。
- `type === 'group'` 的项不参与选中判断。

## 注意事项

- 选中值的计算依赖 `route.name`，**匿名路由会抛错**（源码里直接 `Route.name.toString()`）。
- **`link` 为字符串的菜单项会被重写成只有 `label` + `key` 的新对象**（`label` 若是字符串会被包成 `RouterLink`），因此这类项的 `icon`、`extra`、`childrenNames` 等信息会丢失。需要保留完整能力请用 [NaiveUIMenu](/vue/components/naive/NaiveUIMenu) 或直接给 `options` 传 naive-ui 原生结构。
- 组件在内部注册了 `router.beforeResolve` 钩子且**没有在卸载时移除**，单页面里长期存在多份实例会重复执行该回调。
