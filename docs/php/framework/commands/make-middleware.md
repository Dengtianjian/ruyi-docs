# make:middleware — 生成中间件

在应用 `Middleware/` 目录下生成中间件骨架文件，继承 `Middleware` 基类。

## 语法

```bash
php app/console make:middleware <MiddlewareName> [--force]
```

- `<MiddlewareName>`：中间件名，支持 `目录/类名` 形式（如 `Admin/Auth`），子目录同时影响文件路径与命名空间
- `--force`：目标文件已存在时强制覆盖；未加该选项时文件已存在则报错并返回退出码 1

## 生成位置

- 文件：`{FileSystem::appRoot()}/Middleware/<名称>.php`（如 `Middleware/AuthMiddleware.php`、`Middleware/Admin/AuthMiddleware.php`）
- 命名空间：`{App::id()}\Middleware`，子目录追加在后（如 `{App::id()}\Middleware\Admin`）

## 命名规则

- 类名：`<名称> + Middleware`，如 `Auth` → `AuthMiddleware`

## 生成骨架

```php
namespace app\Middleware;

use kernel\Foundation\Middleware;

class AuthMiddleware extends Middleware
{
  /**
   * 中间件处理逻辑
   *
   * @param \Closure $next 下一个处理闭包
   * @return mixed 返回响应对象或调用 $next() 继续后续处理
   */
  public function handle(\Closure $next)
  {
    // TODO: 在此编写中间件逻辑

    return $next();
  }
}
```

- `handle(\Closure $next)`：中间件处理逻辑，返回响应对象或调用 `$next()` 继续后续处理

## 示例

```bash
php app/console make:middleware Auth            # 生成 Middleware/AuthMiddleware.php
php app/console make:middleware Admin/Auth      # 生成 Middleware/Admin/AuthMiddleware.php，命名空间 app\Middleware\Admin
php app/console make:middleware Auth --force    # 覆盖已存在的 AuthMiddleware
```

## 退出码

- `0`：生成成功
- `1`：缺少名称参数，或文件已存在且未加 `--force`
