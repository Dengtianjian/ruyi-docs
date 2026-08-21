# DiscuzXApp — Discuz!X 应用装配类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXApp.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation`
- **继承**: `extends App`
- **是否可继承**: 是（`DiscuzXHookApp` 继承自它）

Discuz!X 环境下的应用装配类，扩展内核 `App`，针对 Discuz!X 插件宿主做了特殊适配：从 `$_GET['uri']` 读取路由、注册 DiscuzX 异常/错误处理器、定义插件路径常量等。

## 继承方法

继承自 `kernel\Foundation\App`，包括 `setup()`、`set()`、`run()`、`id()`、`kernelId()`、`mode()`、`getInstance()` 等（详见 [App](../app.md)）。

## 构造

```php
public function __construct($appId)
```

- `$appId`（string）：应用（插件）ID

**逻辑**

1. 若未定义 `CHARSET` 常量，则定义 `CHARSET = "utf-8"`。
2. 调用父类构造 `parent::__construct($appId, "gstudio_kernel")`，内核 ID 固定为 `gstudio_kernel`。
3. 调用 `ensureInstances()` 兜底实例化组件。
4. 根据 `$_GET['uri']` 写入 `$this->request->URI`（`addslashes(trim())`）；不存在则设为 `/`。
5. 注册 `DiscuzXExceptionHandler::receive` 为异常处理器。
6. 注册 `DiscuzXExceptionHandler::handle` 为错误处理器（`E_ALL`）。

## 方法

### `hook` — 设置当前 URI

```php
public function hook($uri)
```

- `$uri`（string）：Discuz!X 钩子对应的 URI

调用 `ensureInstances()` 后，将 `$uri` 写入 `$this->request->URI`。用于 Discuz!X 插件钩子（hook）场景下指定业务路由。

### `defineConstants` — 定义常量（protected）

```php
protected function defineConstants()
```

定义 Discuz!X 插件相关的路径常量：

| 常量 | 值 | 说明 |
|------|-----|------|
| `F_DISCUZX_PLUGIN_ROOT` | `{DISCUZ_ROOT}/source/plugin` | 插件目录（绝对路径） |
| `F_DISCUZX_PLUGIN` | `source/plugin` | 插件目录（相对路径） |
| `F_DISCUZX_DATA` | `{DISCUZ_ROOT}/data` | Discuz!X Data 目录 |
| `F_DISCUZX_DATA_PLUGIN` | `{DISCUZ_ROOT}/data/plugindata/{App::id()}` | 插件数据目录 |
| `F_BASE_URL` | `$_G['siteurl']` 去尾斜杠 | 站点根 URL |

各常量均在未定义时才定义（`if (!defined(...))`）。`F_BASE_URL` 依赖全局 `$_G['siteurl']`。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\DiscuzXApp;

$app = new DiscuzXApp("your_plugin_id");
// 或指定钩子路由
$app->hook("appid://module/action");
$app->run();
```
