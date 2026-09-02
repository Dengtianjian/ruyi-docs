# ResponseRedirect

重定向响应类，继承 `Response`，位于 `kernel\Foundation\HTTP\Response\ResponseRedirect`。

参考 Laravel `Illuminate\Routing\Redirector` 的设计，提供链式、语义化的跳转能力。跳转方法只「配置」目标与模式，`output()` 时才统一组装最终 URL（合并 with 数据、片段、协议策略）并发送 `Location` 头与状态码，**不输出响应主体**。

与父类 `Response::redirect()` 的区别：父类 `redirect()` 仅设 `Location` + 状态码；本类额外提供路由生成、外部跳转、协议策略、数据携带等能力。

## 构造

```php
new ResponseRedirect($to = null, $statusCode = 302)
```

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$to` | `string\|null` | `null` | 初始目标地址（可选），传入即等同调用 `to($to, $statusCode)` |
| `$statusCode` | `int` | `302` | HTTP 状态码（302 Found / 301 Moved Permanently 等） |

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$redirectTo` | `string\|null` | `null` | protected | 解析后的目标地址 |
| `$isAway` | `bool` | `false` | protected | 是否为外部跳转（away），不强制同域/协议 |
| `$isSecure` | `bool` | `false` | protected | 是否强制 HTTPS |
| `$fragment` | `string\|null` | `null` | protected | URL 片段（不含前导 `#`） |
| `$withData` | `array` | `[]` | protected | `with()` 携带的数据，输出时合并进查询字符串 |

## 方法

### `to($path, $statusCode = 302, $headers = [])` — 跳转到指定地址

相对路径（不含 `://`）自动补全为基于当前请求的绝对 URL；完整 URL 直接采用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$path` | `string` | 目标路径或完整 URL |
| `$statusCode` | `int` | HTTP 状态码 |
| `$headers` | `array` | 附加响应头 `[key => value]` |

返回：`$this`

### `route($name, $parameters = [], $statusCode = 302, $headers = [])` — 按命名路由跳转

委托 `Routes::url()` 反向生成路由 URL。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 路由名称 |
| `$parameters` | `array` | 路由参数 |
| `$statusCode` | `int` | HTTP 状态码 |
| `$headers` | `array` | 附加响应头 |

返回：`$this`

### `away($path, $statusCode = 302, $headers = [])` — 跳转到外部地址

不强制同域/HTTPS，用于第三方站点跳转。

返回：`$this`

### `secure($path, $statusCode = 302, $headers = [])` — 强制 HTTPS 跳转

以 HTTPS 跳转到当前域名下的路径。

返回：`$this`

### `back($statusCode = 302, $fallback = null, $headers = [])` — 回退到上一页

读取请求头 `Referer`；缺失则回退到 `$fallback`（默认当前完整 URL）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$statusCode` | `int` | HTTP 状态码 |
| `$fallback` | `string\|null` | 兜底地址，默认当前请求完整 URL |
| `$headers` | `array` | 附加响应头 |

返回：`$this`

### `with($key, $value = null)` — 携带一次性数据

> 本框架无 Session 闪存，数据以 **URL 查询参数**形式附加到目标地址（前端可读、可再次透传）。

- `with('key', 'value')` 单条；
- `with(['k1' => 'v1', 'k2' => 'v2'])` 批量。

返回：`$this`

### `withFragment($fragment)` — 附加 URL 片段（锚点）

传入值可带或不带前导 `#`，统一拼为 `#fragment`。

返回：`$this`

### `output()` — 输出重定向

组装最终 URL 并发 `Location` 头、`http_response_code()`，**不输出主体**。

## 在控制器中使用

`ControllerResponse` 已提供 `redirect()` 工厂，可直接在 `data()` 中返回：

```php
use kernel\Foundation\Controller\Controller;

class LoginController extends Controller
{
  function data()
  {
    // 登录成功后跳转到命名路由
    return $this->response->redirect()->route("home");

    // 或跳转到路径并携带提示
    // return $this->response->redirect()->to("/dashboard")->with("msg", "ok")->withFragment("top");

    // 或回退上一页
    // return $this->response->redirect()->back();
  }
}
```

## 与 Laravel 的差异

| 能力 | Laravel | 本框架 |
|------|---------|--------|
| 数据携带 | `with()` 闪存到 Session | `with()` 以 URL 查询参数附加（无 Session） |
| `action()` | 按控制器 action 跳转 | 未实现（本框架路由以 `controller@method` 编排，可改用 `route()`） |
| `guest()` / `intended()` | 依赖 Session 记录预期地址 | 未实现 |
| 路由生成 | `route()` | 复用 `Routes::url()` |
