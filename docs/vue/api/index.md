# 接口封装 — common

- **文件位置**: `packages/vue/api/common/`
- **引入方式**: 子路径**必须带 `.ts` 扩展名**，如 `import SettingsApi from 'kit/vue/api/common/SettingsApi.ts'`

通用（非 DiscuzX）的接口封装，都继承自 [Request](/vue/foundation/http)（已解包 `res.data`）。

## AttachmentsApi

- **文件**: `api/common/AttachmentsApi.ts`
- **导出**: 只有具名导出 `class AttachmentsApi extends Request {}`

它是一个**空壳类**：没有自有方法、也没有预设 `prefix`，只作为业务侧继承/实例化的入口。

```ts
import { AttachmentsApi } from 'kit/vue/api/common/AttachmentsApi.ts'

const api = new AttachmentsApi('attachments', import.meta.env.VITE_API_URL)
await api.get('1')          // GET {baseUrl}/attachments/1
```

> 与同类文件不同，它**没有默认导出**（其它 api 文件通常默认导出一个已实例化对象）。

## SettingsApi

- **文件**: `api/common/SettingsApi.ts`
- **导出**: 默认导出一个**已实例化的对象** `new SettingsApi("settings")`；类本身未导出，只能按实例使用

| 方法 | HTTP | 路径 | 说明 | 返回 |
| --- | --- | --- | --- | --- |
| `list<T>(keys: string[])` | GET | `settings/list?keys=a,b` | 批量读取设置 | `Promise<T>` |
| `saveList(KeyValues: Record<string, any>)` | PATCH | `settings/list`，body `{ data: KeyValues }` | 批量保存 | `Promise<number>` |
| `save(key: string, value: any)` | PATCH | `settings/<key>`，body `{ value }` | 保存单个键 | `Promise<number>` |

```ts
import SettingsApi from 'kit/vue/api/common/SettingsApi.ts'

const settings = await SettingsApi.list<{ siteName: string }>(['siteName'])
await SettingsApi.save('siteName', '如意')
```

> 注意：方法名与 [SettingFormService](/vue/services/setting-form) 期望的 `ISettingsApi`（`items` / `item` / `saveItems` / `save`）**不一致**，直接把它当 `ISettingsApi` 传进去会报 `items is not a function`。

## 扩展自己的 api

```ts
// isdtj/src/api/UsersApi.ts 的真实写法
import { RuyiRequest } from "kit/vue";

export class UsersApi extends RuyiRequest {
  login(username: string, password: string) {
    return this.post("users/login", { username, password });
  }
}

export default new UsersApi("users");
```

要求：

- **`baseUrl` 必传**（第二个构造参数）。URL 由 `[baseUrl, ...uri].join('/')` 拼成，不传时字符串里会直接出现 `null`（如 `null/users/login`）。
- 继承了 [`RuyiRequest`](/vue/foundation/http) 就会自动带上 `X-Ajax: 1` 与 `localStorage.Ruyi_Token` 的鉴权头；需要自定义鉴权/公共头请参考 `isdtj/src/foundation/Request.ts`，在 `globalMiddlewares` 里加自己的中间件。

---

> **相关**：[api/discuzx](/vue/api/discuzx)、[HTTP](/vue/foundation/http)
