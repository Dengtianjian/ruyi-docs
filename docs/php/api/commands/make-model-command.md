# MakeModelCommand — 创建模型命令

- **文件位置**: `kernel/Commands/MakeModelCommand.php`
- **命名空间**: `kernel\Commands`
- **命令名**: `make:model`
- **继承**: `MakeCommand`

创建新模型类。

## 用法

```bash
php kernel/console make:model <ModelName>
php kernel/console make:model User
php kernel/console make:model Admin/User
php kernel/console make:model User --table=users
php kernel/console make:model User --force
```

## 参数

| 参数 | 说明 |
|------|------|
| `$args[0]` | 模型名（如 `"User"` 或 `"Admin/User"`） |
| `--table` | 指定数据表名（默认从类名推断：`UserModel → user`） |
| `--force` | 覆盖已存在文件 |

## 生成内容

生成到 `{root}/Model/`：

| 输入 | 生成路径 |
|------|----------|
| `User` | `Model/UserModel.php` |
| `Admin/User` | `Model/Admin/UserModel.php` |

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 解析参数 → 生成模型骨架 → 输出结果 |
