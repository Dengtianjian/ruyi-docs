# 根层级类

`kernel/Foundation/` 根目录下的类，命名空间均为 `kernel\Foundation`。这些类构成了框架的核心基础设施：应用入口、缓存、配置、事件、生命周期、日志、输出、编排器、结果、路由与服务基类。

- **文件位置**: `kernel/Foundation/*.php`
- **命名空间**: `kernel\Foundation`

> 全局函数（`getApp`/`config`/`path`/`dd` 等）见 [Common 全局函数](./common.md)；`App` 的详细使用见 [框架核心 App](../framework/app.md)。

## App — 应用入口

- **文件位置**: `kernel/Foundation/App.php`
- **命名空间**: `kernel\Foundation`

应用启动器，负责初始化配置、加载路由、执行中间件链和控制器。延迟实例化组件，通过 `setup()` 装配 + `set()` 注入。

### `__construct($id, $kernelId = "kernel")`

| 参数 | 类型 | 说明 |
|------|------|------|
| `$id` | `string` | 应用唯一 ID，**必须与应用目录名一致** |
| `$kernelId` | `string` | 内核目录名称，默认 `"kernel"` |

实例化即注册为**当前实例**。构造时载入 `Common.php` 全局函数、初始化配置、注册异常/错误处理、加载错误码、实例化 Router 与 Request。

```php
$App = new App("isdtj");
$App->setup(\isdtj\Setup\Bootstrap::class);
$App->run();
```

### `setup($call)`

装配应用，必须在 `run()` 之前调用。传类名则 `new $call($this)`；传闭包则 `$call($this)`。见 [App 应用入口](../framework/app.md)。

### `set(array $bindings)`

批量注入组件，白名单键 `router/request/lifeCycle/middleware`。在 Bootstrap 构造内调用。

```php
$app->set(["middleware" => $m, "lifeCycle" => $l, "router" => $r]);
```

### `run()`

启动应用：兜底装配组件、路由分发、执行中间件链与控制器、触发生命周期钩子。

### 静态方法

| 方法 | 说明 |
|------|------|
| `App::id()` | 当前 App 的 ID |
| `App::kernelId()` | 当前内核目录名 |
| `App::mode()` | 运行模式（`Config::get("mode", "production")`，懒计算） |
| `App::getInstance()` | 返回当前实例（未实例化返回 `null`） |

## Cache — 缓存

- **文件位置**: `kernel/Foundation/Cache.php`

缓存类。构造时生成 16 位随机 KEY（`Cache::key()`）。缓存不随 `ensureInstances()` 兜底，需在 Bootstrap 手动 `new Cache`。

```php
$Cache = new Cache();
$Cache->set("key", "value", 3600);
$value = $Cache->get("key");
```

## Config — 配置

- **文件位置**: `kernel/Foundation/Config.php`

配置管理，全部为静态方法。支持点号路径。

| 方法 | 说明 |
|------|------|
| `Config::get($key, $default = null, $appId = null)` | 读取配置，`$key` 支持点号路径 |
| `Config::set(...)` | 设置配置 |

```php
$mode = Config::get("mode", "production");
$cors = Config::get("cors.origin", "*");
```

## Event — 事件

- **文件位置**: `kernel/Foundation/Event.php`

事件机制。提供事件监听、触发能力。

```php
Event::on("user.created", function ($user) { /* ... */ });
Event::emit("user.created", $user);
```

## Lifecycle — 生命周期

- **文件位置**: `kernel/Foundation/Lifecycle.php`

应用生命周期管理器，无参构造。仅 3 个钩子：`onBootUp`/`onShutdown`/`onError`（on 开头）。类名 push 进 `$bootUp`，`run()` 循环 new 构造即装配；闭包直接注册。

| 方法 | 说明 |
|------|------|
| `onBootUp($classOrClosure)` | 注册启动钩子（默认 `{App}\Setup\Bootup`，幂等 + class_exists） |
| `onShutdown($classOrClosure)` | 注册关闭钩子（默认 `{App}\Setup\Shutdown`） |
| `onError($classOrClosure)` | 注册异常钩子 |

```php
$lifeCycle = new Lifecycle();
$lifeCycle->onBootUp(Setup\Bootup::class);
$lifeCycle->onShutdown(Setup\Shutdown::class);
$app->set(["lifeCycle" => $lifeCycle]);
```

异常时序：捕获异常 → `onError` → `onShutdown` → 全局异常处理器。`$context = ["exception", "error", "preflight"]`；OPTIONS 预检也触发 shutdown。

## Log — 日志

- **文件位置**: `kernel/Foundation/Log.php`

日志记录。

```php
Log::info("用户登录", ["id" => 1]);
Log::error("数据库连接失败", $context);
```

## Output — 输出工具

- **文件位置**: `kernel/Foundation/Output.php`

静态调试输出。详见 [Output 输出工具](../framework/output.md)。

| 方法 | 说明 |
|------|------|
| `Output::format(...$data)` | 输出 HTML `<pre>`（纯输出） |
| `Output::string(...$data)` | 返回纯文本格式化字符串（无 HTML，CLI/HTTP 通用，供拼字符串） |
| `Output::printContent()` | echo 输出 |
| `Output::debug(...$data)` | 调试输出，**空参不 exit**，有数据 exit |
| `Output::backtrace()` | 输出堆栈（默认 `DEBUG_BACKTRACE_IGNORE_ARGS`） |
| `Output::isCli()` | 是否 CLI 环境 |

## Provisioner — 生命周期编排器

- **文件位置**: `kernel/Foundation/Provisioner.php`

提供生命周期编排能力。详见 [Provisioner](../framework/provisioner.md)。

## Result — 返回结果

- **文件位置**: `kernel/Foundation/Result.php`
- **继承**: `Response`

「调用结果 + HTTP 响应」合一。构造 `__construct($result, $errorStatusCode = null, $errorCode = 500, $errorMessage = "error", $errorDetails = null)`，`>299` 自动进错误态。详见 [Result 返回结果](../framework/result.md)。

**静态工厂（过去式，因静态调用）**：

```php
$ok = Result::succeeded($data, 200, 0, "success");
$err = Result::failed(400, "400:BadRequest", "参数错误", $details);
```

**判态与数据**：

| 方法 | 说明 |
|------|------|
| `isError()` / `isSuccess()` | 判断成败 |
| `result()` | 原始结果数据 |
| `getData($key = null, 点号)` | 取数据（点号路径） |
| `hasData($key = null)` | 是否有数据 |
| `getResult($key, $default)` | 取数据（键不存在回退默认） |

**错误 getter**（成功态返回 `null`）：`errorMessage()` / `errorStatusCode()` / `errorCode()` / `errorDetails()`。开发模式下 `errorDetails` 自动补 backtrace。

**通用 getter**（无论成败）：`getStatusCode()` / `getCode()` / `getMessage()`。

**链式与序列化**：`withData($data, $cover)` / `withMessage($message)` / `toArray()` / `toJson()`（失败抛 `\RuntimeException`）/ `getBody()` / `throwError()` / `throwErrorIf($condition = true)`。

> **注意**：勿用 `success`/`fail`（与父类 Response 非静态 `success()`/`error()` 方法冲突）；`failed()` 即使 `statusCode <= 299` 也强制错误态。

```php
if ($result->isError()) {
    return Result::failed(400, "400:X", "校验失败", $result->errorDetails());
}
```

## Router — 路由

- **文件位置**: `kernel/Foundation/Router.php`

路由分发。延迟加载：`__construct($mode = null)` 按 `PHP_SAPI !== "cli"` 判断 http/command 并 `loadRoutes()`。详见 [Router 路由](../framework/router.md)。

| 方法 | 说明 |
|------|------|
| `Router::register($URI, $Controller, $method, $middlewares, $params, $options)` | 注册 HTTP 路由（http 模式） |
| `Router::command($name, $Class, $description)` | 注册命令（command 模式） |
| `Router::setMode($mode)` / `Router::mode()` | 设置/读取模式（静态可覆盖） |
| `match($URI)` | 统一分发：command 返回命令，http 走 URI 匹配 |

```php
Router::register("user/detail", UserController::class, "GET");
Router::command("cache:clear", CacheClearCommand::class, "清理缓存");
```

## Service — 服务基类

- **文件位置**: `kernel/Foundation/Service.php`
- **继承**: `AbilityBaseObject`

无状态静态功能类基类，`XxxService::method()` 调用。提供静态扩展钩子 `bootstrap()` / `bootUp()`。无构造函数、无实例状态、不持有 Result 属性。

```php
class UserService extends Service
{
    public static function create(array $data): Result { /* ... */ }
}
$result = UserService::create($data);
```
