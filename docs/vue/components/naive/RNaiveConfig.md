# RNaiveConfig — 配置容器（含 dialog）

- **文件位置**: `packages/vue/components/Naive/RNaiveConfig.vue`
- **引入方式**: `import RNaiveConfig from 'kit/vue/components/Naive/RNaiveConfig.vue'`
- **依赖**: `naive-ui`

最简的 naive-ui 容器：`n-config-provider`（只配 `themeOverrides`）+ `n-dialog-provider` + `n-message-provider`。

## 示例

```vue
<template>
  <RNaiveConfig :theme-overrides="{ common: { primaryColor: '#2080f0' } }">
    <App />
  </RNaiveConfig>
</template>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `themeOverrides` | `GlobalThemeOverrides` | `{}` | 否 | 透传给 `n-config-provider` |

## Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | — | 应用内容 |

## 与 NaiveUIProvider 的区别

| 能力 | `RNaiveConfig` | [NaiveUIProvider](/vue/components/naive/NaiveUIProvider) |
| --- | --- | --- |
| `themeOverrides` | 支持 | 支持 |
| 中文语言包（`zh-CN` / `dateZhCN`） | 无 | 有 |
| 亮/暗主题切换（`v-model:color-mode`） | 无 | 有 |
| `useDialog()` | 可用 | **不可用** |
| `useMessage()` | 可用 | 可用 |

两者选一个当根容器即可，不要嵌套多份（会造成主题与 message 上下文重复）。
