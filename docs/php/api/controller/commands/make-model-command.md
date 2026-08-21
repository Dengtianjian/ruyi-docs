# MakeModelCommand — 生成模型命令

- **文件位置**: `kernel/Controller/Commands/MakeModelCommand.php`
- **命名空间**: `kernel\Controller\Commands`
- **继承**: `extends MakeCommand`
- **命令名**: `make:model`

生成模型骨架的命令，支持子命名空间与自定义表名。

## 用法

```bash
php kernel/console make:model User                # 生成 UserModel
php kernel/console make:model Admin/User          # 生成 Admin/UserModel
php kernel/console make:model User --table=xx     # 指定数据表
php kernel/console make:model User --force        # 覆盖已存在文件
```

## 参数

| 参数 | 说明 |
|------|------|
| `$args[0]` | 模型名（如 `User` 或 `Admin/User`） |
| `--table` | 数据表名（默认按类名推断 `UserModel → user`） |
| `--force` | 覆盖已存在文件 |

## 生成骨架

```php
class UserModel extends Model
{
    public static $tableName = "user";
    public static $timestamps = false;
}
```

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 解析名称 → 生成骨架 → 写入 |
