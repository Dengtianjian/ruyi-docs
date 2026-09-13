# NaiveUIMenu — 路由菜单（表单式配置）

- **文件位置**: `packages/vue/components/Naive/NaiveUIMenu.vue`
- **引入方式**: `import NaiveUIMenu from 'kit/vue/components/Naive/NaiveUIMenu.vue'`
- **依赖**: `naive-ui`（`n-menu`）、`vue-router`

比 [RRouterMenu](/vue/components/base/RRouterMenu) 更完整的一版菜单：**可以直接吃 `vue-router` 路由表**（读 `meta.naiveUIRouteMenu`），也可以吃手写的菜单数组，自动处理内链/外链、排序、选中态与父级展开。

## 示例

```vue
<!-- isdtj/src/App.vue 的真实用法 -->
<template>
  <NaiveUIMenu mode="horizontal" :routes="routes" responsive />
</template>

<script lang="ts" setup>
import NaiveUIMenu from 'kit/vue/components/Naive/NaiveUIMenu.vue'
import routes from '@/router/routes'
</script>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `menus` | `TNaiveUIRouteMenuOption[]` | `undefined` | 否 | 手写菜单数组（优先级高于 `routes`） |
| `routes` | `RouteRecordRaw[]` | `undefined` | 否 | 路由表，只读取写了 `meta.naiveUIRouteMenu` 的路由 |
| 其余 | `MenuProps`（`options` 除外） | — | 否 | 例如 `mode`、`responsive`、`collapsed`、`inverted`，全部透传给 `n-menu` |

字段含义见 [types](/vue/types/index)。

## 两种数据来源的处理流程

1. `menus`：`improveMenus()` 先补全子项相对 `path`，再交给 `improveMenuOptions()`。
2. `routes`：`transformRouteToMenuOption()` 递归读取 `meta.naiveUIRouteMenu`（`label` 缺省取 `meta.title`，再缺省取 `name`/`path`），生成菜单树后同样走 `improveMenuOptions()`。
3. `improveMenuOptions()`：判断内链/外链并生成 `label`（外链用 `NaiveUIMenuLink`，内链用 `RouterLink`），把 `index` / `level` / `path` / `linkProps` 收进 `meta`，最后按 `meta.index` 升序排序。

外链判定规则：`linkProps` 里带 `href`，或 `path` 能匹配 `/https?/`。

## 选中态

内部 `v-model:value` 绑定菜单选中 key，由 `router.beforeResolve` 同步为当前路由 `name`，也可由业务通过 `$attrs` 覆盖。

## Slots / Emits

无自定义插槽与事件；`$attrs` 透传给 `n-menu`。

## 注意事项

- **只认 `meta.naiveUIRouteMenu`**（不兼容旧字段 `meta.menu`，这一点与 [generateRouterMenuOptions](/vue/services/naive-router-menu) 不同）。
- 没写 `meta.naiveUIRouteMenu` 的路由**不会渲染自己**，但它的 `children` 会被**提升到当前层级**渲染。
- 数据重建（`menus` / `routes` 深度变化）时内部会先清空 `ActiveMenuKey`，重建瞬间选中态为空，要等下一次路由解析才恢复。
- `meta.index` 缺省时用的是**同级数组长度**，因此不写 `index` 的项排在写了 `index` 的项之后。
- 源码里 `RouteItem.meta.naiveUIRouteMenu` 用了 `@ts-ignore` 读取，业务侧路由类型没扩充 meta 也能跑，但不会获得类型提示。
