# Event — 事件系统

Event 提供简单的事件注册和分发机制，支持在应用的不同位置触发和监听事件，实现模块间的解耦。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Event.php`
- **注册方式**: 自由注册——任意位置 `new Event(...)` 即完成注册（构造即注册）；推荐在 `Lifecycle/events.php`（由引导类 `Lifecycle\Bootup` 按需引入）或实例化 App 之后注册
- **调用方式**: 触发/检查/移除为静态方法，直接 `Event::xxx()` 调用

## 特性

- **订阅者三种形式**：类名（实例化即处理）、`[类名, 方法名]`（推荐，调用方法处理）、可调用（闭包/函数）
- **异常隔离**：单个订阅者抛出的异常会被捕获并记录日志，不影响其余订阅者执行
- **进程内注册表**：同名事件重复注册会覆盖旧订阅者列表
- **可检查/可移除**：`has()` 查询、`remove()` 注销事件

## 订阅者形式

订阅者可以是以下三种形式之一：

| 形式 | 写法 | 执行方式 |
|------|------|----------|
| 类名字符串（兼容旧写法） | `SendWelcomeEmail::class` | `new SendWelcomeEmail(...$params)`，实例化即处理 |
| `[类名, 方法名]`（推荐） | `[SendWelcomeEmail::class, "handle"]` | `(new SendWelcomeEmail())->handle(...$params)` |
| 可调用 | `function ($userId) {...}` / 实现 `__invoke` 的对象 | 直接调用 `$callable(...$params)` |

推荐使用 **`[类名, 方法名]`** 形式：业务逻辑放在普通方法中，类的构造函数保持无参，便于复用与单元测试。

## 方法列表

### `__construct($name, $subscriptions = [])`

注册事件。构造即注册到进程内注册表；**同名事件重复注册会覆盖**已存在的订阅者列表。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 事件名称 |
| `$subscriptions` | `array` | 订阅者数组（见上方"订阅者形式"） |

```php
new Event("user.registered", [
    [SendWelcomeEmail::class, "handle"],
    [CreateDefaultSettings::class, "handle"]
]);
```

### `dispatch($name, ...$params)`

静态方法，触发事件。按顺序执行全部订阅者；单个订阅者失败不影响其余（异常被捕获记录）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 事件名称 |
| `$params` | `mixed` | 传给订阅者的参数（按位置匹配） |

返回值：`string` — 事件类名 `kernel\Foundation\Event`。事件未注册时抛出 `Exception`。

```php
Event::dispatch("user.registered", $userId, $userData);
```

### `distribute($name)`

静态方法，获取事件分发闭包。**事件是否存在的校验延迟到闭包被调用时**（由 `dispatch` 完成），因此闭包可以在事件注册前创建，注册后再调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 事件名称 |

返回值：`callable` — 调用该闭包时触发事件

```php
$onUserRegistered = Event::distribute("user.registered");
// ... 中间可注册事件 ...
$onUserRegistered($userId, $userData); // 此时触发
```

### `has($name)`

静态方法，检查事件是否已注册。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 事件名称 |

返回值：`bool`

```php
if (Event::has("user.registered")) {
    // 已注册
}
```

### `remove($name)`

静态方法，移除已注册的事件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 事件名称 |

返回值：`bool` — 移除成功返回 `true`；事件不存在返回 `false`

```php
Event::remove("user.registered");
```

### `getName()` / `getSubscriptions()`

实例方法，获取事件名称与订阅者列表。

```php
$event = new Event("order.created", [...]);
$event->getName();         // "order.created"
$event->getSubscriptions(); // 订阅者数组
```

## 使用方式

### 1. 注册事件

事件可在**任意位置**注册（`new Event(...)` 构造即注册）。推荐在 `Lifecycle/events.php` 中集中注册，并在引导类 `Lifecycle\Bootup.php` 中 `include_once(__DIR__ . "/events.php")` 引入：

```php
<?php
// Lifecycle/events.php
use kernel\Foundation\Event;

new Event("user.registered", [
    [\myapp\Event\SendWelcomeEmail::class, "handle"],
    [\myapp\Event\CreateDefaultProfile::class, "handle"],
]);

new Event("order.created", [
    [\myapp\Event\SendOrderNotification::class, "handle"],
    [\myapp\Event\UpdateInventory::class, "handle"],
]);
```

也可在入口文件实例化 App 之后注册，或注册到具体功能模块中：

```php
// index.php
$App = new App("myapp");
new Event("app.started", [
    [\myapp\Event\WarmupCache::class, "handle"],
]);
$App->run();
```

### 2. 创建订阅者

```php
<?php
// Event/SendWelcomeEmail.php
namespace myapp\Event;

class SendWelcomeEmail
{
    public function handle($userId, $userData)
    {
        // 发送欢迎邮件
        mail($userData['email'], "欢迎注册", "欢迎您，{$userData['username']}！");
    }
}
```

### 3. 触发事件

```php
// 在控制器或服务中触发事件
Event::dispatch("user.registered", $userId, $userData);
```

### 4. 使用闭包订阅者

```php
use kernel\Foundation\Event;

new Event("user.login", [
    function ($userId) {
        Log::info("用户登录", ["userId" => $userId]);
    }
]);

// 触发
Event::dispatch("user.login", $userId);
```

### 5. 检查与移除

```php
if (Event::has("user.registered")) {
    Event::dispatch("user.registered", $userId, $userData);
}

// 不再需要时移除（例如后台关闭某项功能）
Event::remove("legacy.feature");
```

## 注意事项

1. **订阅者失败不阻断**：某订阅者抛异常时，框架捕获并写入错误日志（`Log::error`），其余订阅者照常执行。
2. **参数按位置匹配**：订阅者方法/构造函数的参数顺序必须与 `dispatch` 传入顺序一致，参数数量不匹配会抛 `ArgumentCountError`（同样被隔离）。
3. **重复注册会覆盖**：同名 `new Event(...)` 会替换之前的订阅者列表，而不是追加。
4. **每次触发都会实例化**：订阅者不会缓存实例，每次 `dispatch` 都会新建（保证每次触发都是干净的初始状态）。
5. **进程内注册表**：注册仅对当前进程（请求）有效，长驻 Worker 模式下注册表不会自动清理，需自行管理。

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 加载装配文件 | `$app->onBootUp(Bootup::class)` / `$app->onShutdown(Shutdown::class)` 实例化装配类 |
| [Lifecycle](./lifecycle.md) | 推荐注册位置 | `Lifecycle/events.php` 集中注册事件 |
| [Log](./log.md) | 异常记录 | 订阅者执行失败时通过 `Log::error` 记录 |
