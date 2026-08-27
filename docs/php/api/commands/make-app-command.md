# MakeAppCommand — 创建应用命令

- **文件位置**: `kernel/Commands/MakeAppCommand.php`
- **命名空间**: `kernel\Commands`
- **命令名**: `make:app`

创建新应用骨架的命令。

## 用法

```bash
php kernel/console make:app <AppId>
php kernel/console make:app hello
```

## 生成内容

生成到 `{root}/{AppId}/`：

| 路径 | 说明 |
|------|------|
| `Setup/Bootstrap.php` | 应用装配类（手动 new Config/FileSystem/Cache + 生命周期注入） |
| `Setup/Bootup.php` / `Setup/Shutdown.php` | 生命周期装配类 |
| `Routes/index.php` | HTTP 路由 |
| `Controller/IndexController.php` | 默认控制器 |
| `index.php` | HTTP 入口 |
| `console` | CLI 入口（Console 子类） |
| `Controller/` `Data/` `Storage/` | 目录结构 |

## 参数

| 参数 | 说明 |
|------|------|
| `$args[0]` | 应用 ID（字母开头，仅字母数字下划线） |
| 选项 | 无 |

## 方法

| 方法 | 说明 |
|------|------|
| `handle($console, $args, $options): int` | 校验 AppId → 生成骨架 → 输出结果 |
