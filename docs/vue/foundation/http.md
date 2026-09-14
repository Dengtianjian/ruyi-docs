# HTTP — 请求封装

- **文件位置**: `packages/vue/foundation/HTTP/`（`index.ts`、`request.ts`、`RuyiRequest.ts`、`discuzXRequest.ts`）
- **引入方式**: `import { HTTP, request, RuyiRequest, discuzXRequest } from 'kit/vue'`
- **依赖**: 浏览器 `fetch`、`localStorage`（仅 `RuyiRequest`）

基于原生 `fetch` 的链式请求封装。`send()` 返回的 `IResponse` 里，`data` 是响应体里的业务数据，其余字段是状态码、响应头、耗时等元信息。

## 类层次

```
HTTP                 index.ts          # 最底层，send() 返回完整 IResponse
 └─ Request          request.ts        # 覆写 send()，只 resolve 出 res.data
     └─ RuyiRequest  RuyiRequest.ts    # 注入鉴权中间件（Ruyi_Token）
         └─ (匿名类)  discuzXRequest.ts # 覆写 URI 拼法，走 ?uri=a/b/c
```

| 类 | `send()` 返回 | 说明 |
| --- | --- | --- |
| `HTTP` | `Promise<IResponse<ResponseData>>` | 元信息完整，适合需要读响应头/状态码的场景 |
| `request`（`Request` 的默认导出） | `Promise<ResponseData>` | 已解包出 `res.data`，业务最常用 |
| `RuyiRequest` | 同 `request` | 额外注入 `X-Ajax: 1`、`Authorization: Bearer <localStorage.Ruyi_Token>`，并把响应头里的 token 回写 `localStorage` |
| `discuzXRequest` | 同 `request` | 把 `prefix/uri` 拼成查询串 `?uri=xxx/yyy` 后请求，适配 DiscuzX 的入口路由 |

## 构造与链式设置

```ts
new HTTP(baseURL?, method?, query?, body?, pipes?, options?, headers?, globalMiddlewares?)
new Request(prefix?, baseURL?, method?, query?, body?, pipes?, options?, headers?, globalMiddlewares?)
```

`Request` 与 `HTTP` 的唯一差别是第一个参数 `prefix`（会拼在 URI 最前面）。

| 方法 | 作用 |
| --- | --- |
| `url(baseURL)` | 设置请求根地址 |
| `prefix(value)` | 设置 URI 前缀，可传数组按顺序拼接 |
| `query(key, value, allowNull?)` | 追加查询参数；`boolean` 会转成 `1/0`，值为 `null` 且 `allowNull` 为 `false` 时忽略 |
| `body(data)` | 设置请求体；普通对象会自动 `JSON.stringify` 并补 `content-type: application/json` |
| `header(key, value)` | 设置请求头 |
| `options(key, value)` | 透传 `RequestInit` 的其它字段 |
| `pipes(...names)` | 追加数据管道（会拼成 `_pipes=a,b` 查询参数） |
| `setMiddleware(middleware)` | 追加**本次请求**的中间件 |

`Request` 额外提供：

| 方法 | 作用 |
| --- | --- |
| `upload(uri, file, fileName?, body?)` | `FormData` 上传：自动带 `X-Ajax: 1`，`file` 字段写入文件，可附带 `fileName` 与其它字段 |
| `polling(request, breakCallback, waitDuraion?, stopRequest?)` | 轮询：`breakCallback` 返回 `true`（或请求报错）时结束；`waitDuraion` 单位秒；`stopRequest` 传 `ref(false)`，置为 `true` 可中断 |
| `page(page?, perPage?)` | 追加 `page`、`perPage` 查询参数（默认 `1` / `10`） |
| `order(fieldName, sort?)` | 追加 `order`、`orderBy`（`sort` 默认 `ASC`） |
| `orders(rules)` | 追加 `orders=字段:方式,...` |

## 发送请求

```ts
const api = new Request('/api/v1', 'https://example.com')

await api.get<User>('users/1')            // GET  ?query
await api.post('users', { name: '张三' })  // POST 请求体
await api.put('users/1', { name: '李四' })
await api.delete('users/1')
await api.patch('users/1', { name: '王五' })
await api.send('users/1', 'GET')          // 手动指定 method
```

`get` 的第二个参数是查询参数对象，其余方法的第二个参数是请求体。

## 中间件

```ts
type THTTPMiddleware<T = any> = (
  http: HTTP,
  next: () => Promise<IResponse<T>>
) => Promise<IResponse<T>>
```

执行顺序：`globalMiddlewares`（数组中靠前的先执行）→ `setMiddleware` 注册的本次中间件 → 真正的 `fetch`；响应按相反顺序回传。

```ts
import { HTTP } from 'kit/vue'

const http = new HTTP('/api')

// 全局：构造时传入
const withToken = new HTTP('/api', 'GET', {}, null, [], {}, {}, [
  async (h, next) => {
    h.header('X-Trace-Id', String(Date.now()))
    return next()
  }
])

// 单次：链式注册
await http
  .setMiddleware(async (h, next) => {
    const res = await next()
    console.log('耗时', res.requiredTime)
    return res
  })
  .get('/users')
```

## 响应结构

```ts
interface IResponse<ResponseData, ResponseHeader = Record<string, string>> {
  statusCode: number          // HTTP 状态码
  header: ResponseHeader      // 响应头
  cookies: string[]           // 目前始终为 null（未实现）
  error: boolean              // statusCode > 299 时为 true
  code: number | string       // 业务状态码（响应体里的 code）
  message: string
  data: ResponseData          // 业务数据
  details: any
  requiredTime: string
  version: string
}
```

分页响应固定结构：

```ts
interface IPagination<Data> {
  pagination: { items: number, limit: number, page: number, skip: number, total: number }
  list: Data
}
```

同时导出 `TMethods`（请求方法联合类型）、`TBody`（请求体类型）、`THTTPMiddleware`。

## 扩展一个 api 类

```ts
// isdtj/src/... 的真实写法：继承 Request / DiscuzXRequest，只声明自己的方法
import Request from 'kit/vue/foundation/HTTP/request'

export class AttachmentsApi extends Request {
  // 继承来的 send/get/post/... 直接可用
}
```

具体例子见 [api](/vue/api/index) 与 [api/discuzx](/vue/api/discuzx)。

## 注意事项

- **错误走 `reject`，且 `reject` 出来的不是 `Error` 而是 `IResponse`**：`statusCode > 299` 时 `fetch()` 会 `reject(Response)`；`Request` 的 `send()` 只处理 `then(res => res.data)`，所以用 `request` 时 `catch` 拿到的是 `IResponse`（可用 `err.message`、`err.details`）。网络异常才是原生 `Error`。
- **请求结束后实例状态会被清空**（`query`、`body`、`headers`、`options`、`pipes`、本次中间件），因此同一个实例可以在多次请求间复用；但**并发使用同一个实例会互相覆盖参数**，需要并发时请每次 `new`。
- `RuyiRequest` 依赖 `localStorage`，token 写回逻辑只在响应头包含 `Authorization`/`authorization` 时触发。
- `discuzXRequest` 会把 `prefix` 与 `uri` 用 `/` 拼成 `?uri=` 传给 `baseURL`，因此 `baseURL` 应是 DiscuzX 的入口地址。
- 响应体不是 `application/json` 时，`data` 是**原始文本**（`await res.text()`），此时 `message` 保持默认 `'ok'`、`code` 等于 HTTP 状态码。
- 构造参数里的 `headers` 是**全局请求头**（与单次请求的 `header()` 分开存放，请求结束后的清空逻辑不会重置它），适合放固定的公共头。
- `options` 与默认值 `{ headers, method: 'get', mode: 'cors' }` 做的是**浅合并**，自己传 `headers` 会整体覆盖默认请求头。
- `HTTP.genURL` 是已废弃的静态方法，请用实例上的 `generateRequestURL()`；它生成的 URL 末尾总会带 `?`（即使查询参数为空）。
- 源码里 `Request.send()` 有一行调试输出 `console.log("send1")`，属于残留，不影响功能。
