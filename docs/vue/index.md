# Vue 模块

`ruyi-kit` 的 `vue` 子包：Vue 3 组件、请求封装、业务服务与类型定义。

它的使用方式是 **源码直引**：kit 没有构建步骤、也不需要发布，业务工程通过 `link:` 依赖 + 子路径导出（`exports`）直接引用 `packages/vue` 下的源码，改完 kit 代码业务工程热更新即可生效，`vue-tsc` 还能直接检查到 kit 源码。

## 接入

**1. kit 自己装一次依赖（必须）**

```bash
cd ruyi-kit && pnpm install
```

业务侧 `vue-tsc` 会顺着 `vite.config.ts` 走进 kit 源码，其中 `vite` 的类型由 kit 自己的 `devDependencies` 提供，不装会报 `找不到模块 "vite"`。

**2. 业务工程声明依赖**

```bash
pnpm add kit@link:../ruyi-kit   # 键名必须写成 kit（包自身的 name 是 ruyi-kit）
```

等价于手写 `"dependencies": { "kit": "link:../ruyi-kit" }`。

**3. vite 配置挂上插件**

```ts
// vite.config.ts
import { kitPlugin } from 'kit/vue/vite-plugin'

export default defineConfig({
  plugins: [vue(), kitPlugin()]
})
```

`kitPlugin()` 处理 `link:` 安装带来的三件事：`resolve.dedupe`（避免 `vue` / `naive-ui` 出现双实例）、`server.fs.allow`（放行业务工程根目录 + kit 真实目录）、`server.watcher.add`（监听 kit 源码，改动即热更新）。

**4. 样式按需引入**

```ts
// src/main.ts
import('kit/vue/assets/css/common.css')   // 主题变量、省略号工具类、细滚动条
import 'kit/core/css/common.css'          // 与框架无关的基础样式
```

## 引入约定

| 导入 | 内容 |
| --- | --- |
| `kit/vue` | 入口，只导出 `foundation/*`、`services/*`、`types/*` |
| `kit/vue/components/<分组>/<组件>.vue` | 组件，默认导出 |
| `kit/vue/api/**` | 接口封装，多数同时有具名（类）与默认（已实例化对象）导出 |
| `kit/vue/vite-plugin` | 业务工程用的 vite 插件 |

> `exports` **不做扩展名回退**：`kit/vue/api/common/AttachmentsApi` 解析不到，必须写全 `kit/vue/api/common/AttachmentsApi.ts`（`.vue`、`.css` 同理），只有 `exports` 里显式声明过的单文件子路径（如 `kit/vue/vite-plugin`）才能省扩展名。

## 目录导览

| 分组 | 内容 |
| --- | --- |
| [HTTP](/vue/foundation/http) | `HTTP` / `Request` / `RuyiRequest` / `discuzXRequest` 请求封装，以及 `IResponse`、`IPagination` 等类型 |
| [foundation 其余能力](/vue/foundation/cookies) | `cookies`、[eventBus](/vue/foundation/event-bus)、[file](/vue/foundation/file)、[helper](/vue/foundation/helper)、[naiveUI](/vue/foundation/naive-ui) |
| [services](/vue/services/setting-form) | `SettingFormService`、[commonService](/vue/services/common)、[dayjsService](/vue/services/dayjs)、[naiveUIService](/vue/services/naive-ui)、[naiveRouterMenuService](/vue/services/naive-router-menu)、[DiscuzXSettingFormService](/vue/services/discuzx-setting-form) |
| [components/base](/vue/components/base/RPanel) | 与框架无关的基础组件：面板、浮动、复制、状态、菜单、布局等 |
| [components/naive](/vue/components/naive/NaiveUIProvider) | 基于 naive-ui 的能力组件：Provider、菜单、表单、上传、分页等 |
| [components/discuzx](/vue/components/discuzx/RDiscuzXUploadFile) | DiscuzX 场景的上传组件 |
| [api](/vue/api/index) | 接口封装（`AttachmentsApi`、`SettingsApi`、`discuzX/*`） |
| [types](/vue/types/index) | 通用类型、组件类型、`vue-router` 模块扩充 |
| [vite-plugin](/vue/vite-plugin) | 业务工程用的 vite 插件：`dedupe`、`fs.allow` 放行、kit 源码 HMR 监听 |

## 注意事项

- kit 的 `vue` / `vue-router` / `naive-ui` / `dayjs` / `vite` 都是 `peerDependencies`，由业务工程提供，kit 不锁定版本；`vue`、`naive-ui` 必须只有一份。
- `foundation/` 下的工具都是浏览器环境代码（`document`、`localStorage`、`FileReader`、`fetch`），不做 SSR 兼容。
- `packages/vue/foundation/network/request/` 是**旧版实现，当前无人引用**，不要在新代码里使用。
