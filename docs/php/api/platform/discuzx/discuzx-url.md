# DiscuzXURL — Discuz!X URL 构建器

- **文件位置**: `kernel/Platform/DiscuzX/DiscuzXURL.php`
- **命名空间**: `kernel\Platform\DiscuzX`
- **继承**: `extends URL`
- **是否可继承**: 是

Discuz!X 场景下的 URL 构建与解析封装，扩展了 `kernel\Foundation\HTTP\URL`。默认以 `plugin.php` 作为入口路径，并支持将 `uri` 作为查询参数。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$pathName` | string | `plugin.php` | 默认路径 |
| public | `$uri` | string | `null` | URI（作为查询参数 `uri` 使用） |

其余属性继承自 `URL`（`host`、`queryParams`、`fragment`、`protocol`、`port`、`user`、`password` 等）。

## 构造

```php
__construct($URL = null)
```

- `$URL`（string，可选）：传入后解析 URL

若 URL 无路径则保持 `plugin.php`；若查询参数含 `uri`，则提取到 `$this->uri`。

## 方法

### `buildURL` — 构建 URL（static）

```php
static function buildURL(
  $host = "",
  $pathName = "",
  $uri = null,
  $queryParams = [],
  $fragment = null,
  $protocol = "https",
  $port = null,
  $user = null,
  $password = null
)
```

- `$host`（string）：主机
- `$pathName`（string）：路径
- `$uri`（string，可选）：URI；非 null 时自动加入 `$queryParams['uri']`
- `$queryParams`（array）：请求参数
- `$fragment`（string）：hash 片段
- `$protocol`（string）：协议，默认 `https`
- `$port`（int）：端口
- `$user` / `$password`（string）：认证信息

将 `uri` 追加为查询参数后，委托父类 `URL::buildURL` 返回构建好的 URL 字符串。

### `toString` — 字符串化

```php
public function toString()
```

使用当前实例的 host/pathName/uri/queryParams/fragment/protocol/port/user/password 构建完整 URL 字符串。

## 使用

```php
use kernel\Platform\DiscuzX\DiscuzXURL;

// 构建插件入口 URL
$url = DiscuzXURL::buildURL(
  "example.com",
  "plugin.php",
  "appid://module/action",
  ["param" => "value"]
);

// 实例方式
$u = new DiscuzXURL("https://example.com/plugin.php?uri=appid://module&a=1");
echo $u->toString();
```
