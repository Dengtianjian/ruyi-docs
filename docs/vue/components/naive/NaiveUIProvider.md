# NaiveUIProvider — naive-ui 全局 Provider

- **文件位置**: `packages/vue/components/Naive/NaiveUIProvider.vue`
- **引入方式**: `import NaiveUIProvider from 'kit/vue/components/Naive/NaiveUIProvider.vue'`
- **依赖**: `naive-ui`

应用级容器，包住整个页面即可获得：中文语言包、`themeOverrides` 主题定制、亮/暗主题切换，以及 `useMessage()` 所需的 `n-message-provider`。

## 示例

```vue
<!-- isdtj/src/App.vue 的真实用法 -->
<template>
  <NaiveUIProvider v-model:color-mode="ColorMode" :config="{ themeOverrides: ThemeOverides }">
    <header>...</header>
    <main>...</main>
  </NaiveUIProvider>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import NaiveUIProvider from 'kit/vue/components/Naive/NaiveUIProvider.vue'
import type { GlobalThemeOverrides } from 'naive-ui'

const ColorMode = ref<'dark' | 'light'>('light')
// themeOverrides 会被整体替换，用 shallowRef 避免深层类型解包与 naive-ui 类型冲突
const ThemeOverides = shallowRef<GlobalThemeOverrides>({})
</script>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `autoSwitchColorMode` | `boolean` | `false` | 否 | 为 `true` 时跟随系统主题（`useOsTheme`），并覆盖 `colorMode` 的值 |
| `config` | `Partial<{ theme: ThemeCommonVars, themeOverrides: GlobalThemeOverrides }>` | — | 否 | 目前只有 `themeOverrides` 生效，透传给 `n-config-provider` |

## 双向绑定

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `colorMode`（`v-model:color-mode`） | `'dark' \| 'light'` | `'light'` | 亮/暗主题；`autoSwitchColorMode` 为 `true` 时会被系统主题覆盖 |

## Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| `default` | — | 应用内容 |

## 注意事项

- **只提供了 `n-message-provider`，没有 `n-dialog-provider`**：在它内部调用 `useDialog()` 会报错，需要弹窗能力时请改用 [RNaiveConfig](/vue/components/naive/RNaiveConfig) 或自己再包一层。
- `config.theme`（`ThemeCommonVars`）虽然声明在类型里，但组件实现**没有使用**，主题色请通过 `themeOverrides` 配置。
- `n-config-provider` 传了 `abstract`，因此不会额外渲染一层 DOM 容器。
- 组件是全局单例式的：语言包固定 `zh-CN`，无法通过 props 更换。
