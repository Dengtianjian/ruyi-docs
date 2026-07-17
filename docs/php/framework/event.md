# Event — 事件系统

Event 提供简单的事件注册和分发机制，支持在应用的不同位置触发和监听事件。

- **命名空间**: `kernel\Foundation`
- **文件位置**: `kernel/Foundation/Event.php`

## 方法列表

### `__construct($name, $subscriptions = [])`

注册事件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 事件名称 |
| `$subscriptions` | `array` | 订阅者类名数组 |

```php
new Event("user.registered", [
    SendWelcomeEmail::class,
    CreateDefaultSettings::class
]);
```

### `dispatch($name, ...$params)`

静态方法，触发事件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 事件名称 |
| `$params` | `mixed` | 传给订阅者的参数 |

返回值：`Event`

```php
Event::dispatch("user.registered", $userId, $userData);
```

### `distribute($name)`

静态方法，获取事件分发闭包。

| 参数 | 类型 | 说明 |
|------|------|------|
| `$name` | `string` | 事件名称 |

返回值：`callable` — 调用该闭包时触发事件

```php
$onUserRegistered = Event::distribute("user.registered");
$onUserRegistered($userId, $userData);
```

## 使用方式

### 1. 注册事件

在 `Events/` 目录下创建文件，App 启动时自动加载：

```php
<?php
// Events/user.php
use kernel\Foundation\Event;

new Event("user.registered", [
    \myapp\Event\SendWelcomeEmail::class,
    \myapp\Event\CreateDefaultProfile::class,
]);

new Event("order.created", [
    \myapp\Event\SendOrderNotification::class,
    \myapp\Event\UpdateInventory::class,
]);
```

### 2. 创建订阅者

```php
<?php
// Event/SendWelcomeEmail.php
namespace myapp\Event;

class SendWelcomeEmail
{
    public function __construct($userId, $userData)
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

## 与其他类的协作

| 类 | 关系 | 说明 |
|------|------|------|
| [App](./app.md) | 加载事件 | App 启动时自动加载 Events 目录 |
