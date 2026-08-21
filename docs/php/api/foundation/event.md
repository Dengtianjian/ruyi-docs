# Event — 事件

- **文件位置**: `kernel/Foundation/Event.php`
- **命名空间**: `kernel\Foundation`
- **是否可继承**: 是

事件机制，用于解耦业务逻辑。通过 `Event::dispatch($name, ...$params)` 触发事件，事件订阅者在触发时执行。构造即注册到进程内注册表，同名事件重复注册会覆盖旧的订阅者列表。

订阅者支持三种形式：
- **类名字符串**（如 `"Foo"`）：触发时 `new Foo(...$params)` 实例化即处理
- **`[类名, 方法名]`**（如 `[Foo::class, "handle"]`）：实例化后调用指定方法
- **可调用**（闭包 / 函数 / `__invoke` 对象）：触发时直接调用

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$events` | `array<string, Event>` | `[]` | static private | 进程内已注册的事件实例注册表，键为事件名称 |
| `$name` | `string` | `""` | private | 事件名称 |
| `$subscriptions` | `array` | `[]` | private | 订阅者列表，每项为类名 / `[类名, 方法名]` / 可调用 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `__construct($name, $subscriptions)` | 注册事件（构造即入注册表） |
| `getName()` | 获取事件名称 |
| `getSubscriptions()` | 获取订阅者列表 |
| `Event::has($name)` | 检查事件是否已注册 |
| `Event::remove($name)` | 移除已注册的事件 |
| `Event::distribute($name)` | 获取事件分发闭包（延迟到调用时校验事件） |
| `Event::dispatch($name, ...$params)` | 触发事件 |
| `send($params)` | 依次执行订阅者（private，捕获单个异常） |
| `invokeSubscriber($item, $params)` | 执行单个订阅者（private） |
| `describeSubscriber($item)` | 描述订阅者用于日志（private） |

## 方法

### `__construct($name, $subscriptions = [])` — 注册事件

构造即注册到进程内注册表；同名事件重复注册会**覆盖**已存在的订阅者列表。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 事件名称 |
| `$subscriptions` | `array` | `[]` | 订阅者数组，每项为类名 / `[类名, 方法名]` / 可调用 |

**返回值**

- 无。

### `getName()` — 获取事件名称

**参数**

- 无。

**返回值**

- `string`：事件名称。

### `getSubscriptions()` — 获取订阅者列表

**参数**

- 无。

**返回值**

- `array`：订阅者列表。

### `Event::has($name)` — 检查事件是否已注册

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 事件名称 |

**返回值**

- `bool`：事件已注册返回 `true`，否则 `false`。

### `Event::remove($name)` — 移除已注册的事件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 事件名称 |

**返回值**

- `bool`：事件存在并移除成功返回 `true`；事件不存在返回 `false`。

### `Event::distribute($name)` — 获取事件分发闭包

返回一个闭包，调用该闭包时触发事件。事件是否存在的校验延迟到闭包被调用时，因此闭包可在事件注册前创建。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 事件名称 |

**返回值**

- `callable`：调用该闭包（`$closure(...$params)`）时触发对应事件。

### `Event::dispatch($name, ...$params)` — 触发事件

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 事件名称 |
| `$params` | `array` | 无 | 传给订阅者的可变参数列表 |

**返回值**

- `string`：事件类名（`kernel\Foundation\Event`）。

**示例**

```php
use kernel\Foundation\Event;

// 注册订阅者（构造即注册）
new Event("user.created", [
    function ($user) {
        // 处理用户创建
    },
    [SomeHandler::class, "handle"],
    SomeSubscriber::class,
]);

// 触发事件，参数会依次传给每个订阅者
Event::dispatch("user.created", $user);
```

### `send($params)` — 依次执行订阅者

> private。遍历订阅者列表逐个执行；单个订阅者抛出的异常会被捕获并记录日志，不影响其余订阅者执行。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$params` | `array` | 无 | 传给订阅者的参数 |

**返回值**

- 无。

### `invokeSubscriber($item, $params)` — 执行单个订阅者

> private。根据订阅者形式分派执行：数组 `[类名, 方法名]` 实例化后调用方法；可调用直接调用；类名字符串直接实例化。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$item` | `mixed` | 无 | 订阅者（类名 / `[类名, 方法名]` / 可调用） |
| `$params` | `array` | 无 | 传给订阅者的参数 |

**返回值**

- 无。

### `describeSubscriber($item)` — 描述订阅者用于日志

> private。将订阅者转为可读字符串：对象返回类名，数组返回 `类名::方法`，其余转字符串。

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$item` | `mixed` | 无 | 订阅者 |

**返回值**

- `string`：订阅者的可读描述。
