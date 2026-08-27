# Routes — 静态容器

- **文件位置**: `kernel/Foundation/Router/Routes.php`
- **命名空间**: `kernel\Foundation\Router`
- **是否可继承**: 否

静态路由容器，存储所有路由定义并提供匹配和 URL 生成功能。

## 常量

```php
const PLACEHOLDER = '/\{(\??)(\w+)(?::([^}]+))?\}/'
```

URI 动态参数占位符正则（唯一来源），捕获组：1=可选标记（`?`），2=参数名，3=内联正则。

## 静态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `$routes` | `RouteRegister[]` | 原始注册器表 |
| `$staticRoutes` | `array` | 静态路由表：domain => method => uri => 定义 |
| `$paramRoutes` | `array` | 动态路由表：domain => method => uri => 定义 |
| `$named` | `array` | 命名路由索引：路由名 => 定义 |
| `$fallback` | `array` | 兜底路由表：domain => 定义 |
| `$patterns` | `array` | 全局参数约束：参数名 => 正则 |
| `$dirty` | `bool` | 分表脏标记 |

## 路由管理

### `push($RR)` — 注册路由

```php
static function push(RouteRegister $RR): void
```

将路由注册器加入容器，标记脏。重复注册同名/同路径路由触发 `E_USER_WARNING`。

### `remove($RR)` — 移除路由

```php
static function remove(RouteRegister $RR): void
```

从容器中移除指定路由注册器，标记脏。

### `clear()` — 清空所有路由

```php
static function clear(): void
```

清空所有路由表和索引。

## 全局参数约束

### `pattern($name, $regex)` — 设置全局约束

```php
static function pattern($name, $regex = null): void
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string\|array` | 参数名或 `参数名=>正则` 映射 |
| `$regex` | `string\|null` | 当 `$name` 为字符串时必填的正则 |

### `patterns()` — 获取所有全局约束

```php
static function patterns(): array
```

## 匹配

### `match($method, $uri, $domain)` — 匹配路由

```php
static function match($method, $uri, $domain = null): ?array
```

**匹配规则**

1. **域名查找序**：指定域名优先 → 全局（`"*"`）回退
2. **静态路由**：精确匹配 URI，方法优先 → `any` 兜底
3. **动态路由**：按段数从多到少 + 同段 URI 长度排序（最具体优先），逐条 `preg_match`
4. **HEAD 语义**：未注册 `head` 时回退 `get`
5. **兜底路由**：所有正常路由未命中时查 fallback

**返回值**

- `array|null`：匹配的路由定义数组，未命中返回 `null`

## URL 生成

### `url($name, $params, $domain, $https)` — 反向生成 URL

```php
static function url($name, $params = [], $domain = null, $https = false): string
```

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 必填 | 路由名 |
| `$params` | `array` | `[]` | 路由参数（参数名 => 值） |
| `$domain` | `string\|null` | `null` | 域名（非 null 时生成绝对 URL） |
| `$https` | `bool` | `false` | 是否 HTTPS |

**行为**

- 路径参数值经 `rawurlencode` 编码
- 多余参数追加为查询串
- 必选参数缺失抛 `InvalidArgumentException`
- 可选参数 `{?name}` 缺省留空（多余空段归一化）
- 传 `$domain` 生成绝对 URL
- 命名 fallback 不入 `$named`，对其调用 `url()` 抛异常

## 查找

### `find($name)` — 按名查找

```php
static function find($name): ?array
```

从 `$named` 索引中查找命名路由定义。

## 导出

### `tables()` — 导出完整路由表

```php
static function tables(): array
```

返回 `domain => method => uri => 路由定义` 三层结构。

## 内部方法

### `distribute()` — 分发表

```php
static function distribute(): void
```

将 `$routes` 分发到 `$staticRoutes` / `$paramRoutes` / `$named` / `$fallback`。使用 `$dirty` 脏标记缓存，仅在有变更时重建。

### `compilePattern($uri, $params)` — 编译正则

```php
static function compilePattern($uri, $params): string
```

将含占位符的 URI 编译为完整匹配正则（`#^...$#` 包裹）。

### `extractParams($uri, $where)` — 解析参数

```php
static function extractParams($uri, $where): array
```

解析 URI 动态参数映射（参数名 => 正则）。`$where` 优先于内联正则，内联优先于全局 `pattern`。
