# MakeControllerCommand — 生成控制器命令

- **文件位置**: `kernel/Controller/Commands/MakeControllerCommand.php`
- **命名空间**: `kernel\Controller\Commands`
- **继承**: `extends MakeCommand`
- **命令名**: `make:controller`

生成控制器骨架的命令，支持子命名空间。

## 用法

```bash
php kernel/console make:controller User           # 生成 UserController
php kernel/console make:controller Admin/User     # 生成 Admin/UserController
php kernel/console make:controller User --force   # 覆盖已存在文件
```

## 生成骨架

```php
class UserController extends Controller
{
    public function __construct(Request $R)
    {
        parent::__construct($R);
    }

    public function data() { }
}
```

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 解析名称 → 生成骨架 → 写入 |
