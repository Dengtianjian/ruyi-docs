# MakeMiddlewareCommand — 生成中间件命令

- **文件位置**: `kernel/Controller/Commands/MakeMiddlewareCommand.php`
- **命名空间**: `kernel\Controller\Commands`
- **继承**: `extends MakeCommand`
- **命令名**: `make:middleware`

生成中间件骨架的命令，支持子命名空间。

## 用法

```bash
php kernel/console make:middleware Auth            # 生成 AuthMiddleware
php kernel/console make:middleware Admin/Auth      # 生成 Admin/AuthMiddleware
php kernel/console make:middleware Auth --force    # 覆盖已存在文件
```

## 生成骨架

```php
class AuthMiddleware extends MiddlewareBase
{
    public function data(Request $R)
    {
        // 返回 null 放行，返回 Response/Result 中断
    }
}
```

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 解析名称 → 生成骨架 → 写入 |
