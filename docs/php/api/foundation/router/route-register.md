# RouteRegister — 单路由载体

- **文件位置**: `kernel/Foundation/Router/RouteRegister.php`
- **命名空间**: `kernel\Foundation\Router`
- **是否可继承**: 是（`RouteGroup` / `RouteSame` / `RouteDomain` 继承）

由 `Route::get/post/...` 实例化的单路由载体。支持链式设置。

## 构造

```php
public function __construct($uri = "", $method = "", $group = null, $same = null)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `$uri` | `string` | 路由 URI |
| `$method` | `string` | HTTP 方法（小写），any 用 `"*"` |
| `$group` | `RouteGroup\|null` | 所属组 |
| `$same` | `RouteSame\|null` | 所属同 URI 注册器 |

## 属性

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$method` | `string` | `""` | HTTP 方法（小写），any 用 `"*"` |
| `$uri` | `string` | `""` | 原始 URI（未含组前缀） |
| `$prefix` | `string` | `""` | 组前缀 |
| `$middlewares` | `array` | `[]` | 路由级中间件 |
| `$name` | `string` | `""` | 路由名称 |
| `$controller` | `mixed` | `null` | 控制器 |
| `$parameters` | `array` | `[]` | 控制器实例化参数 |
| `$where` | `array` | `[]` | 参数约束（参数名 => 正则） |
| `$append` | `array` | `[]` | 额外参数 |
| `$group` | `RouteGroup\|null` | `null` | 所属组 |
| `$domain` | `string` | `"*"` | 生效域名 |
| `$same` | `RouteSame\|null` | `null` | 所属同 URI 注册器 |
| `$fallback` | `bool` | `false` | 是否兜底路由 |

## 读写一体 setter

以下方法传值写入返回 `$this`，无参读取返回当前值：

```php
function name($value = null)       // 路由名称
function prefix($value = null)     // 组前缀
function domain($value = null)     // 生效域名
function fallback($value = null)   // 是否兜底
function controller($value = null) // 控制器
function method($value = null)     // HTTP 方法
function uri($value = null)        // URI
function parameters($value = null) // 控制器实例化参数
```

## `middleware(...$middlewares)` — 设置路由中间件

```php
function middleware(...$middlewares): $this
```

可传数组或逐个传多个：

```php
->middleware(AuthMiddleware::class)
->middleware([AuthMiddleware::class, CorsMiddleware::class])
->middleware("auth")  // 使用别名
```

## `where($name, $regex)` — 参数约束

```php
function where($name, $regex = null): $this
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string\|array` | 参数名或 `参数名=>正则` 映射 |
| `$regex` | `string\|null` | 当 `$name` 为字符串时必填的正则 |

## where 助手方法

```php
function whereNumber(...$names): $this        // [0-9]+
function whereAlpha(...$names): $this         // [a-zA-Z]+
function whereAlphaNumeric(...$names): $this  // [a-zA-Z0-9]+
function whereIn($name, $values): $this       // 枚举值
function whereUuid(...$names): $this          // UUID v4
```

| 方法 | 正则 | 说明 |
|------|------|------|
| `whereNumber(...$names)` | `[0-9]+` | 数字 |
| `whereAlpha(...$names)` | `[a-zA-Z]+` | 字母 |
| `whereAlphaNumeric(...$names)` | `[a-zA-Z0-9]+` | 字母数字 |
| `whereIn($name, $values)` | `val1\|val2\|...` | 枚举值 |
| `whereUuid(...$names)` | UUID v4 正则 | UUID 格式 |

## `append($extras)` — 额外参数

```php
function append($extras = null): array|$this
```

无参读取，传数组写入合并返回 `$this`。

## `params()` — 解析动态参数

```php
function params(): array
```

解析 URI 动态参数映射（参数名 => 正则）。`where` 优先于内联正则，内联优先于全局 `pattern`。

## `resolve()` — 产出完整路由定义

```php
function resolve(): array
```

**返回值**

```php
[
    "name" => string,           // 路由名
    "method" => string,         // HTTP 方法
    "uri" => string,            // 完整 URI（已拼组前缀）
    "controller" => mixed,      // 控制器
    "methodName" => string|null, // 方法名（[类,方法] 时）
    "middlewares" => array,     // 中间件列表
    "parameters" => array,      // 控制器实例化参数
    "where" => array,           // 参数约束
    "params" => array,          // 动态参数正则
    "append" => array,          // 额外参数
    "domain" => string,         // 生效域名
    "fallback" => bool,         // 是否兜底
]
```
