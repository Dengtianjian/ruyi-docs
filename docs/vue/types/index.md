# 类型定义

`packages/vue/types/` 下集中放 kit 对外约定的类型。**注意导出范围**：

| 文件 | 是否从 `kit/vue` 入口导出 |
| --- | --- |
| `types/common/index.ts` | 是（`export *`） |
| `types/components/Common.ts` | 是（`export *`） |
| `types/components/NaiveUI.ts` | 是（`export *`） |
| `types/declare/vue-router.ts` | **否**，需子路径引入（`kit/vue/types/declare/vue-router.ts`） |
| `types/discuzX/common.ts` | 目前是**空文件**，不导出任何东西 |

请求相关的类型（`IResponse`、`IPagination`、`TMethods`、`TBody`、`THTTPMiddleware`）在 [HTTP](/vue/foundation/http) 里，同样从 `kit/vue` 导出。

## `types/common`

| 类型 | 说明 |
| --- | --- |
| `TRuyiFileAccessControl` | 文件访问权限字面量联合：`'private' \| 'public-read' \| 'public-read-write' \| 'authenticated-read' \| 'authenticated-read-write'` |
| `IRuyiFileInfo` | 文件信息：`key`、`remote`、`platform`、`belongsId`、`belongsType`、`ownerId`、`sourceFileName`、`name`、`size`、`path`、`width`、`height`、`extension`、`accessControl`、`createdAt`、`updatedAt`，以及可选的 `previewURL`、`downloadURL`、`transferPreviewURL`、`transferDownloadURL` |
| `IRuyiFileUploadAuth` | 上传鉴权字段：`'header-list'`、`'key-time'`、`'sign-algorithm'`、`'sign-time'`、`signature`、`'url-param-list'` |
| `IRuyiFileAuthData` | 上传授权数据：`fileKey`、`remoteFileKey`、`auth`、`authString`、`previewURL`、`accessControl`、`httpMethod`（`'post' \| 'put'`） |

被 [DiscuzXFilesApi](/vue/api/discuzx) 使用。

## `types/components/Common`

### `RTMenuOption<Meta = {}>`

菜单选项结构，由 [generateRouterMenuOptions](/vue/services/naive-router-menu) 生成、被菜单组件消费。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 唯一键（通常取路由 name） |
| `index` | `number` | 排序序号 |
| `label` | `string \| (() => VNode) \| RouterLinkProps` | 菜单文本或渲染函数 |
| `link` | `string \| RouterLinkProps` | 可选的链接配置 |
| `childrenNames` | `string[]` | 所有后代路由 name（用于展开/高亮） |
| `children` | `Array<RTMenuOption<Meta>>` | 子菜单 |
| `disabled` | `boolean` | 禁用 |
| `show` | `boolean` | 是否显示 |
| `extra` | `string \| (() => VNodeChild)` | 右侧附加内容 |
| `icon` | `() => VNode` | 图标 |
| `type` | `'group'` | 分组类型 |
| `level` | `number` | 层级标记 |
| `meta` | `Meta` | 路由 meta（原样带出） |

## `types/components/NaiveUI`

| 类型 | 说明 |
| --- | --- |
| `TNaiveUIMenuTypes` | `'group' \| 'divider' \| 'list'` |
| `TNaiveUIMenuOption` | naive-ui `MenuOption` 的扩展，`meta` 里带 `key`、`path`、`index`、`level`、`linkProps`、`childrenKeys` |
| `TNaiveUIRouteMenuOption` | 路由菜单选项：`key`、`path`、`label`、`index`、`type`、`show`、`props`、`extra`、`icon`、`linkProps`、`children`、`level`、`disabled`、`childrenKeys` |
| `INaiveUIMenuRouteMeta` | 写在路由 `meta.naiveUIRouteMenu` 上的字段：`show`、`disabled`、`type`、`index`、`level`、`label`、`linkProps`、`extra`、`icon` |

### 用它扩充业务工程的路由 meta

```ts
// isdtj/src/types/global.ts 的真实写法
import type { INaiveUIMenuRouteMeta } from "kit/vue";

declare module 'vue-router' {
  interface RouteMeta extends INaiveUIMenuRouteMeta {
    title?: string
  }
}
```

## `types/declare/vue-router`

### `TRuyiRouteRecordRaw<Meta extends Object = {}>`

`RouteRecordRaw & { meta?: Meta; children?: TRuyiRouteRecordRaw<Meta>[] }`，用于让 `children` 递归带上自定义 meta 类型（`generateRouterMenuOptions` 的入参类型）。

```ts
import type { TRuyiRouteRecordRaw } from 'kit/vue/types/declare/vue-router.ts'
```

---

> **相关**：[types 的实际使用者](/vue/services/naive-router-menu)、[naiveRouterMenuService](/vue/services/naive-router-menu)
