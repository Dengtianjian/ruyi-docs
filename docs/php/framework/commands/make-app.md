# make:app — 创建应用

在 kernel 同级目录（项目根目录）创建指定名称的应用骨架，自动生成目录结构与基础文件。

## 语法

```bash
php app/console make:app <AppName>
```

- `<AppName>`：应用名，即应用目录名 = 命名空间前缀 = AppId（如 `myapp` → `myapp\`），必须以字母开头，仅限字母、数字、下划线

目标目录已存在时拒绝创建，报错并返回退出码 1。

## 生成目录

在项目根目录（kernel 同级）创建 `<AppName>/`，包含以下目录：

| 目录 | 用途 |
|------|------|
| `Configs/` | 应用配置 |
| `Controller/` | 控制器 |
| `Middleware/` | 中间件 |
| `Model/` | 模型 |
| `Routes/` | 路由 |
| `Service/` | 服务 |
| `Storage/` | 存储（文件） |
| `Data/` | 数据（日志等） |

## 生成文件

| 文件 | 内容 |
|------|------|
| `console` | 应用 CLI 入口，自动发现内核与当前应用命令，已加可执行权限 |
| `Configs/Config.php` | 应用配置数组，包含 `version`、`mode` |
| `Controller/IndexController.php` | 示例控制器（继承 Controller 基类） |
| `Routes/index.php` | 路由入口，注册 `/` 指向 IndexController |
| `index.php` | 应用 HTTP 入口，引导 kernel 并运行 App |
| `README.md` | 项目说明与使用方式 |
| `install.key` | 安装密钥，随机生成的 16 位十六进制字符串 |
| `composer.json` | 自动写入 PSR-4 加载规则（`"<AppName>\\": ""`） |

## 配置数组

`Configs/Config.php` 返回数组：

```php
return [
  "version" => "0.1.0.<date>",
  "mode" => "production",
];
```

- `version`：应用版本，生成时按 `0.1.0.<yyyyMMdd.HHmm>` 自动生成
- `mode`：运行模式，默认 `production`；与 `F_APP_MODE` 及路由加载判断（`Config::get("mode")`）相关

## PSR-4 自动加载

`composer.json` 已写入 PSR-4 规则，应用内类名空间前缀为 `<AppName>\`：

```json
{
  "autoload": {
    "psr-4": {
      "myapp\\": ""
    }
  }
}
```

生成后在应用目录执行 `composer dump-autoload` 即可生效。

## 示例

```bash
php app/console make:app myapp
```

输出生成结果数组（app、version、mode、install_key、directories、files）。

## 退出码

- `0`：创建成功
- `1`：缺少或非法应用名，或目标目录已存在
