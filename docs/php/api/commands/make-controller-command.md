# MakeControllerCommand — 创建控制器命令

- **文件位置**: `kernel/Commands/MakeControllerCommand.php`
- **命名空间**: `kernel\Commands`
- **命令名**: `make:controller`
- **继承**: `MakeCommand`

创建新控制器类。

## 用法

```bash
php kernel/console make:controller <ControllerName>
php kernel/console make:controller User
php kernel/console make:controller Admin/User
php kernel/console make:controller User --force
```

## 参数

| 参数 | 说明 |
|------|------|
| `$args[0]` | 控制器名（如 `"User"` 或 `"Admin/User"`） |
| `--force` | 覆盖已存在文件 |

## 生成内容

生成到 `{root}/Controller/`：

| 输入 | 生成路径 |
|------|----------|
| `User` | `Controller/UserController.php` |
| `Admin/User` | `Controller/Admin/UserController.php` |

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 解析参数 → 生成控制器骨架 → 输出结果 |
