# RStatus — 加载状态提示

- **文件位置**: `packages/vue/components/Base/RStatus.vue`
- **引入方式**: `import RStatus from 'kit/vue/components/Base/RStatus.vue'`
- **依赖**: 无（但**代码来自小程序侧，Web 端不可直接用**，见注意事项）

一段「下拉加载更多 / 加载中 / 没有更多了」的文案提示，加载时可显示三点跳动的动画。

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `defaultText` | `string` | `'下拉加载更多'` | 否 | 既未加载中也未完成时的文案 |
| `loading` | `boolean` | `false` | 否 | 是否加载中 |
| `loadingText` | `string` | `'加载中'` | 否 | 加载中文案 |
| `loadingIcon` | `boolean` | `true` | 否 | 是否显示三点动画 |
| `iconColor` | `string` | `'#999'` | 否 | 动画点的颜色 |
| `iconActiveColor` | `string` | `'#333'` | 否 | 动画点高亮颜色 |
| `fontSize` | `string` | `'14px'` | 否 | 字号 |
| `finished` | `boolean` | `false` | 否 | 是否已加载完 |
| `finishedText` | `string` | `'没有更多了'` | 否 | 加载完文案 |

## 注意事项

> **该组件当前无法在 Web 工程正常使用**，它看起来是从小程序（uni-app）版本复制过来的，源码里有多处不兼容：
>
> - 模板用 `<view>` 标签、样式用 `rpx` 单位（Web 端不生效）。
> - 模板里写了 `{{ activeIndex===0?'...':'' }}` 这种小程序插值语法，在 Web 模板里会原样输出成文本。
> - 模板里同时还用了 Vue 的 `:class` 之外的小程序写法，且 `activeIndex` 与脚本中的 `ActiveIndex` 不是同一个名字。
> - 脚本里 `ref` / `watch` / `onMounted` **没有 import**，直接使用会报未定义；`onMounted` 里也无条件启动动画定时器。
>
> 需要「加载中 / 没有更多了」的提示时，建议直接用 naive-ui 的能力（如 `n-spin`、`n-empty`）或业务侧自己写一个。
