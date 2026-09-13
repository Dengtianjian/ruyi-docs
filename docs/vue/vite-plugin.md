# vite-plugin — 业务工程用的构建插件

- **文件位置**: `packages/vue/vite-plugin.ts`
- **引入方式**: `import { kitPlugin } from 'kit/vue/vite-plugin'`（`exports` 里的单文件子路径，无需写扩展名）
- **依赖**: `vite`（类型）、Node 内置模块（`fs`、`path`、`node:url`、`node:module`）

因为 kit 是 `link:` 安装的源码包、位于业务工程目录之外，插件负责补齐 Vite 默认不会处理的几件事。

## 用法

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { kitPlugin } from 'kit/vue/vite-plugin'

export default defineConfig({
  plugins: [vue(), kitPlugin()]
})
```

## API

```ts
export interface KitPluginOptions {}   // 目前没有任何配置项，留作后续扩展
export function kitPlugin(options?: KitPluginOptions): Plugin
```

返回的插件对象：`name: 'vite-plugin-kit'`、`enforce: 'pre'`。

## 它做了什么

| 阶段 | 行为 | 原因 |
| --- | --- | --- |
| `config()` | `resolve.dedupe: ['vue', 'vue-router', 'naive-ui']` | kit 与业务工程各自依赖了这些包，只保留业务侧一份实例，避免双实例导致的 provide/inject、响应式错乱 |
| `config()` | `optimizeDeps.exclude: ['kit']` | kit 是源码直引，不走预构建 |
| `config()` | `server.fs.allow: [业务工程根目录, kit 真实目录]` | 显式声明 `allow` 会覆盖 Vite 默认的“工作区根目录”，所以业务工程根目录必须一起放行，否则连 `index.html` 都会 403 |
| `configureServer()` | `server.watcher.add([kit/packages/{core,javaScript,vue}])` | kit 在工程目录外，默认不在监听范围内，补上后改 kit 源码即可 HMR |

## kit 根目录是怎么定位的

`resolveKitRoot()` 会依次尝试：

1. 以源码形式加载时，按 `import.meta.url` 相对定位（`packages/vue/../../`）；
2. `require.resolve('kit/vue/vite-plugin')` 后向上两级（被业务工程打包进 `vite.config` 时走这条）。

拿到候选目录后校验其中的 `package.json` 的 `name` 是否为 `kit` 或 `ruyi-kit`（**业务侧的依赖名是 `kit`，包自身的 name 是 `ruyi-kit`**），最后用 `realpathSync` 解析软链，保证监听的是真实目录。

定位失败会抛出：`[vite-plugin-kit] 无法定位 kit 包目录，请确认 kit 已作为依赖安装`。

## 注意事项

- **新增 `packages/` 子包时要改源码**：监听范围来自常量 `const PACKAGES = ['core', 'javaScript', 'vue']`，新增目录需要在这个数组里补上（否则该子包改代码不会触发 HMR）。
- 插件只处理「解析、放行、监听」，不做任何代码转换；`.vue` / TS 的编译仍由业务工程自己的插件负责。
- `KitPluginOptions` 是空接口，传参不会有任何效果。
