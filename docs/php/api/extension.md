# Extension 扩展机制

- **目录位置**: `kernel/Foundation/Extension/`
- **命名空间**: `kernel\Foundation\Extension`

框架扩展机制，用于以插件/扩展方式增强内核能力。

## ExtensionMain — 扩展主类

- **文件位置**: `kernel/Foundation/Extension/ExtensionMain.php`
- **命名空间**: `kernel\Foundation\Extension`

扩展主类，扩展的入口。定义扩展的基础能力。

```php
use kernel\Foundation\Extension\ExtensionMain;

class MyExtension extends ExtensionMain
{
    public function boot()
    {
        // 扩展初始化
    }
}
```

## ExtensionProvisioner — 扩展供应器

- **文件位置**: `kernel/Foundation/Extension/ExtensionProvisioner.php`
- **命名空间**: `kernel\Foundation\Extension`

扩展的供应/加载器，负责解析扩展清单、实例化扩展。

```php
$provisioner = new ExtensionProvisioner($config);
$provisioner->load();   // 加载扩展
```

## Extensions — 扩展管理器

- **文件位置**: `kernel/Foundation/Extension/Extensions.php`
- **命名空间**: `kernel\Foundation\Extension`

扩展集合管理器。

```php
Extensions::register(MyExtension::class);
Extensions::boot();
```
