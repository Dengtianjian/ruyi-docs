# RNaiveRouterMenu — 路由菜单（options 版）

- **文件位置**: `packages/vue/components/Naive/RNaiveRouterMenu.vue`
- **引入方式**: `import RNaiveRouterMenu from 'kit/vue/components/Naive/RNaiveRouterMenu.vue'`
- **依赖**: `naive-ui`（`n-menu`）、`vue-router`

接收一个简单的菜单数组（`key` + `label` + `link` + `childrenNames`），自动完成「内链 label 包装」「当前路由高亮」「命中子路由时高亮父项」。

## 示例

```vue
<template>
  <RNaiveRouterMenu :options="[
    { key: 'home', label: '首页', link: '/' },
    { key: 'user', label: '用户', childrenNames: ['userSetting', 'userSignin'] }
  ]" />
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `options` | `Array<{ link?: string \| RouterLinkProps, label?: string \| (() => VNode) \| RouterLinkProps, key: string, childrenNames?: string[] }>` | — | 是 | 菜单数据 |
| 其余 | `MenuProps` | — | 否 | 透传给 `n-menu` |

## 选中逻辑

- 初始选中：当前路由 `name`；若某项的 `childrenNames` 包含当前 `name`，则选中该项的 `key`。
- 路由解析（`beforeResolve`）时按同样规则更新。

## 注意事项

- **`link` 是字符串的项会被重写成只有 `label` + `key` 的新对象**（`label` 为字符串时会被包成 `RouterLink`，跳转目标就是 `link`），因此这类项上的 `icon`、`childrenNames` 之外的字段会被丢弃；需要图标/子菜单请**不传 `link`**，直接把 naive-ui 原生字段（`icon`、`children` 等）写在 options 里，走 `else` 分支原样透传。
- 存在匿名路由（无 `name`）时，源码里的 `Route.name.toString()` 会抛错，使用前请确保所有路由都有 `name`。
- 组件内部注册了 `router.beforeResolve` 且**未在卸载时移除**。
- 源码额外用 `declare module 'vue-router'` 声明了 `RouteMeta.menu` 结构，但**组件本身并不读取该字段**，数据仍需通过 `options` 传入。
