# IndexController — 首页控制器

- **文件位置**: `kernel/Controller/Main/IndexController.php`
- **命名空间**: `kernel\Controller\Main`
- **继承**: `extends Foundation\Controller\Controller`

框架首页控制器示例，继承 `Controller`，展示 `data()` 业务入口的写法。

## 方法

| 方法 | 说明 |
|------|------|
| `__construct(Request $R)` | 构造，调用父类初始化参数解析与校验 |
| `data()` | 业务处理入口 |

## 使用

作为应用默认首页路由的控制器，通常在 `Routes/index.php` 中注册：

```php
Router::get("/", kernel\Controller\Main\IndexController::class);
```
