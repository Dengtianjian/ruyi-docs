# MakeMiddlewareCommand — 创建中间件命令

- **文件位置**: `kernel/Commands/MakeMiddlewareCommand.php`
- **命名空间**: `kernel\Commands`
- **命令名**: `make:middleware`
- **继承**: `MakeCommand`

创建新中间件类。

## 用法

```bash
php kernel/console make:middleware <MiddlewareName>
php kernel/console make:middleware Auth
php kernel/console make:middleware Admin/Auth
php kernel/console make:middleware Auth --force
```

## 参数

| 参数 | 说明 |
|------|------|
| `$args[0]` | 中间件名（如 `"Auth"` 或 `"Admin/Auth"`） |
| `--force` | 覆盖已存在文件 |

## 生成内容

生成到 `{root}/Middleware/`：

| 输入 | 生成路径 |
|------|----------|
| `Auth` | `Middleware/AuthMiddleware.php` |
| `Admin/Auth` | `Middleware/Admin/AuthMiddleware.php` |

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 解析参数 → 生成中间件骨架 → 输出结果 |
