# RTwoColumnLayout — 左右两栏布局

- **文件位置**: `packages/vue/components/Base/Layout/RTwoColumnLayout.vue`
- **引入方式**: `import RTwoColumnLayout from 'kit/vue/components/Base/Layout/RTwoColumnLayout.vue'`
- **依赖**: `naive-ui`（`n-layout` 系列）、`vue-router`；建议外层有 [NaiveUIProvider](/vue/components/naive/NaiveUIProvider)

左侧固定宽度侧边栏（[RRouterMenu](/vue/components/base/RRouterMenu)）+ 右侧内容区，内容区默认在 [RPanel](/vue/components/base/RPanel) 里放 [RKeepAliveRouterView](/vue/components/base/RKeepAliveRouterView)，底部自动带 [RCommonFooter](/vue/components/base/RCommonFooter)。

## 示例

```vue
<template>
  <RTwoColumnLayout :menu-options="menuOptions" :content-width="960">
    <!-- 不传默认插槽时，内容区自动渲染 router-view -->
  </RTwoColumnLayout>
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `menuOptions` | `RTMenuOption[]` | — | 是 | 侧边栏菜单数据，透传给 `RRouterMenu` |
| `siderWidth` | `string \| number` | `272` | 否 | 侧边栏宽度（数字为 px） |
| `contentWidth` | `string \| number` | `'auto'` | 否 | 内容面板宽度（`RPanel` 的 `width` 样式） |

## Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | — | 传入后**替换整个右侧内容区**（不再渲染 `RPanel` + `RKeepAliveRouterView`，但页脚仍会保留） |

## 注意事项

- 侧边栏高度写死为 `calc(100vh - 60px)`，隐含了「顶部有 60px 头部」的假设，头部高度不同时需要自己覆盖样式。
- 布局用的 `n-layout` / `n-layout-sider` / `n-layout-content` 都来自 naive-ui，**没有 NaiveUIProvider（或 NConfigProvider）时主题/暗色模式不会生效**。
- 默认内容区依赖 vue-router（`RKeepAliveRouterView` 内部用 `router-view`），非路由页面请使用 `default` 插槽。
