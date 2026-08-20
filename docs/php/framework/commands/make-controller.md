# make:controller — 生成控制器

在应用 `Controller/` 目录下生成控制器骨架文件，继承 `Controller` 基类。

## 语法

```bash
php app/console make:controller <ControllerName> [--force]
```

- `<ControllerName>`：控制器名，支持 `目录/类名` 形式（如 `Admin/User`），子目录同时影响文件路径与命名空间
- `--force`：目标文件已存在时强制覆盖；未加该选项时文件已存在则报错并返回退出码 1

## 生成位置

- 文件：`{Path::root()}/Controller/<名称>.php`（如 `Controller/UserController.php`、`Controller/Admin/UserController.php`）
- 命名空间：`{App::id()}\Controller`，子目录追加在后（如 `{App::id()}\Controller\Admin`）

## 命名规则

- 类名：`<名称> + Controller`，如 `User` → `UserController`

## 生成骨架

```php
namespace app\Controller;

use kernel\Foundation\Controller\Controller;
use kernel\Foundation\HTTP\Request;

class UserController extends Controller
{
  public function __construct(Request $R)
  {
    parent::__construct($R);
  }

  /**
   * 业务处理入口
   *
   * @return mixed 响应数据、Response 或 ReturnResult 等
   */
  public function data()
  {

  }
}
```

- `__construct(Request $R)`：注入请求对象
- `data()`：业务处理入口，返回响应数据、`Response` 或 `ReturnResult` 等

## 示例

```bash
php app/console make:controller User            # 生成 Controller/UserController.php
php app/console make:controller Admin/User      # 生成 Controller/Admin/UserController.php，命名空间 app\Controller\Admin
php app/console make:controller User --force    # 覆盖已存在的 UserController
```

## 退出码

- `0`：生成成功
- `1`：缺少名称参数，或文件已存在且未加 `--force`
