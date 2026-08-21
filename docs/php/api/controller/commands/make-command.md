# MakeCommand — 生成类命令基类

- **文件位置**: `kernel/Controller/Commands/MakeCommand.php`
- **命名空间**: `kernel\Controller\Commands`
- **是否可继承**: 是（抽象基类）

为 `make:model` / `make:controller` / `make:middleware` 提供公共能力：子目录解析、命名空间拼接、骨架文件写入。**不定义 `$name`，不会被注册为命令。**

## 方法

| 方法 | 说明 |
|------|------|
| `split(string $arg): array` | 解析 `"Admin/User"` 为 `[子目录, 类短名]` |
| `joinNamespace(string $base, string $subDir): string` | 拼接命名空间 |
| `write(string $targetDir, string $className, string $namespace, string $body, bool $force, $console): bool` | 写入骨架（已存在保护，`--force` 覆盖） |
| `tableName(string $className): string` | `UserModel → user`、`OrderItemModel → order_item` |

## 使用

```php
use kernel\Controller\Commands\MakeCommand;

class MakeSomethingCommand extends MakeCommand
{
    public function handle($console, $args, $options): int
    {
        [$subDir, $shortName] = $this->split($args[0]);
        $namespace = $this->joinNamespace("app\Xxx", $subDir);
        return $this->write(Path::root() . "/Xxx", "$subDir/$shortName", $namespace, $body, !empty($options["force"]), $console) ? 0 : 1;
    }
}
```
