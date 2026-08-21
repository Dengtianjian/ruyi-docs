# DiscuzXHookApp — Discuz!X 钩子应用类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXHookApp.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation`
- **继承**: `extends DiscuzXApp` → `extends App`
- **是否可继承**: 否

Discuz!X 插件钩子（hook）场景下的轻量应用类。在 `DiscuzXApp` 基础上简化装配，用于在 Discuz!X 钩子回调中快速注册当前 App、定义常量并初始化 FileSystem 与 Config，而不触发完整的路由分发。

## 构造

```php
public function __construct($appId)
```

- `$appId`（string）：应用（插件）ID

**逻辑**

1. 注册当前 App 实例：`App::$currentApp = $this`（供 `App::id()`/`App::kernelId()` 读取）。
2. 设置 `$this->appId = $appId`。
3. 设置 `$this->kernelId = "gstudio_kernel"`。
4. 调用 `defineConstants()` 定义路径常量。
5. `new FileSystem`（无参构造，路径在静态方法调用时自动计算）。
6. `new Config` 初始化配置。

> 与 `DiscuzXApp` 不同，本类不读取 `$_GET['uri']`，也不注册异常/错误处理器。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\DiscuzXHookApp;

// 在 Discuz!X 钩子回调中
new DiscuzXHookApp("your_plugin_id");
// App::id() 现在返回 your_plugin_id
```
