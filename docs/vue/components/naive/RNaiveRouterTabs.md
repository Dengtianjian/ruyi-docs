# RNaiveRouterTabs — 路由联动 Tabs

- **文件位置**: `packages/vue/components/Naive/RNaiveRouterTabs.vue`
- **引入方式**: `import RNaiveRouterTabs from 'kit/vue/components/Naive/RNaiveRouterTabs.vue'`
- **依赖**: `naive-ui`（`n-tabs`）、`vue-router`

把 `n-tabs` 的选中值与路由绑定：切换 tab 时 `router.replace({ name: key })`，路由变化（含浏览器前进后退）时同步高亮。

## 示例

```vue
<template>
  <RNaiveRouterTabs>
    <n-tab-pane name="userSetting" tab="基本设置" />
    <n-tab-pane name="userSecurity" tab="安全设置" />
  </RNaiveRouterTabs>
</template>
```

## Props / Emits

组件自身不声明 props 与事件；`$attrs` 透传给 `n-tabs`，内容通过默认插槽传入（内部就是 `n-tab-pane`）。

## 关键约定

- **`n-tab-pane` 的 `name` 必须是路由 `name`**：切换时会直接 `router.replace({ name: key })`，name 不存在会导航失败（源码未捕获异常）。
- 用 `replace` 而不是 `push`，切换 tab 不会在历史记录里堆栈。

## 注意事项

- `childrenNames` 机制与 [RNaiveRouterMenu](/vue/components/naive/RNaiveRouterMenu) 相同，但**内部 `selectedMenu` 初始为 `null`**，只有发生过一次交互（或路由解析时命中）才会被赋值，因此首次直接进入子路由页面时，高亮的可能是「子路由 name」而不是父 tab。
- 同样存在匿名路由导致 `Route.name.toString()` 抛错的风险，且注册的 `beforeResolve` 钩子不会在卸载时移除。
