# OrderModel — 订单模型

- **文件位置**: `kernel/Model/Admin/OrderModel.php`
- **命名空间**: `kernel\Model\Admin`
- **继承**: `extends Foundation\Database\PDO\Model`
- **表名**: `order`

订单模型示例，展示 `kernel\Model\Admin` 子命名空间的建模方式。`tableStructureSQL` 用于安装时建表。

## 使用

```php
use kernel\Model\Admin\OrderModel;

$order = new OrderModel();
$orders = $order->where("status", 1)->getAll();
```
