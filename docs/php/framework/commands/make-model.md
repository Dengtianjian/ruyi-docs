# make:model — 生成模型

在应用 `Model/` 目录下生成模型骨架文件，继承 PDO `Model` 基类。

## 语法

```bash
php app/console make:model <ModelName> [--force]
```

- `<ModelName>`：模型名，支持 `目录/类名` 形式（如 `Admin/User`），子目录同时影响文件路径与命名空间
- `--force`：目标文件已存在时强制覆盖；未加该选项时文件已存在则报错并返回退出码 1

## 生成位置

- 文件：`{Path::root()}/Model/<名称>.php`（如 `Model/UserModel.php`、`Model/Admin/UserModel.php`）
- 命名空间：`{App::id()}\Model`，子目录追加在后（如 `{App::id()}\Model\Admin`）

## 命名规则

- 类名：`<名称> + Model`，如 `User` → `UserModel`
- 数据表名：由类名自动推断，规则与 `Model::getDefaultTableName()` 一致

| 类名 | 表名 |
|------|------|
| `UserModel` | `user` |
| `OrderItemModel` | `order_item` |

## 生成骨架

```php
namespace app\Model;

use kernel\Foundation\Database\PDO\Model;

class UserModel extends Model
{
  /** @var string 数据表名 */
  public $tableName = "user";

  /** @var string 建表 SQL，用于安装流程创建表 */
  public $tableStructureSQL = "";

  public function __construct()
  {
    parent::__construct($this->tableName);
  }
}
```

- `$tableName`：数据表名，已按命名规则预填
- `$tableStructureSQL`：建表 SQL，供 Provisioner 等安装流程创建表时使用，生成后可补充

## 示例

```bash
php app/console make:model User            # 生成 Model/UserModel.php，表名 user
php app/console make:model Admin/User      # 生成 Model/Admin/UserModel.php，命名空间 app\Model\Admin
php app/console make:model User --force    # 覆盖已存在的 UserModel
```

## 退出码

- `0`：生成成功
- `1`：缺少名称参数，或文件已存在且未加 `--force`
