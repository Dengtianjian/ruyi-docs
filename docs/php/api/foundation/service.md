# Service — 服务基础对象

- **文件位置**: `kernel/Foundation/Service.php`
- **命名空间**: `kernel\Foundation`
- **继承**: 继承 `kernel\Foundation\Object\AbilityBaseObject`
- **是否可继承**: 是

服务（Service）通常作为**无状态的静态功能类**使用：子类仅提供静态方法，直接以 `XxxService::method()` 调用，并可通过继承的 AbilityBaseObject 错误机制（`setError` / `break` / `forwardBreak` / `return`）返回错误结果。

本类**不持有实例状态**，也未定义构造逻辑；`bootstrap()` / `bootUp()` 是供子类覆盖的静态扩展点（钩子），基类为空实现。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| （本类无自身属性） | — | — | — | 继承自 `AbilityBaseObject`，无独立实例属性 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `bootstrap()` | 装配服务（静态扩展钩子，子类覆盖） |
| `bootUp()` | 启动就绪（静态扩展钩子，子类覆盖） |

## 方法

### `bootstrap()` — 装配服务

静态扩展钩子，供子类覆盖，例如注册服务所需的路由、注入依赖、装配 SDK、配置等。在应用启动阶段调用一次。基类为空实现，仅作为约定入口。

**参数**

- 无。

**返回值**

- 无（`void`）。

**示例**

```php
class SmsService extends Service
{
    public static function bootstrap()
    {
        // 注册短信服务所需的路由/配置
    }
}
```

### `bootUp()` — 启动就绪

静态扩展钩子，供子类覆盖，例如初始化存储结构、建立连接、加载配置等，在 `bootstrap()` 之后完成一次性的启动准备。基类为空实现，仅作为约定入口。

**参数**

- 无。

**返回值**

- 无（`void`）。

---

> **继承自 `AbilityBaseObject`**：错误机制方法 `setError($statusCode, $code, $message, $details, $data)`、`isError()`、`reset()`、`getError()`、`break(Result)`、`forwardBreak()`、`return()` 等均可用，详见《Object/AbilityBaseObject》页。
