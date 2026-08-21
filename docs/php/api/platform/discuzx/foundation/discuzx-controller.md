# DiscuzXController — Discuz!X 认证控制器基类

- **文件位置**: `kernel/Platform/DiscuzX/Foundation/DiscuzXController.php`
- **命名空间**: `kernel\Platform\DiscuzX\Foundation`
- **继承**: `extends AuthController` → `extends Controller`
- **是否可继承**: 是（DiscuzX 插件控制器基类）

Discuz!X 场景下的认证控制器基类，在 `AuthController` 基础上提供 Discuz!X 的 `formhash`（表单防伪哈希）校验能力。

## 属性

| 可见性 | 名称 | 类型 | 默认值 | 说明 |
|--------|------|------|--------|------|
| public | `$Formhash` | bool | `false` | 是否启用 formhash 校验 |

## 继承属性

继承自 `Controller` 的 `$request`、`$response` 等（详见 [Controller](../../foundation/controller/controller.md)、[AuthController](../../foundation/controller/auth-controller.md)）。

## 方法

### `verifyFormhash` — 校验 formhash（final）

```php
final public function verifyFormhash()
```

校验请求中的 Discuz!X `formhash`。

**逻辑**

1. 若 `self::$Formhash` 为 `true` 且 `FORMHASH` 常量未定义，则 `define("FORMHASH", 1)`。
2. 校验 `$this->request->query->get("formhash")` 或 `$this->request->body->get("formhash")` 是否等于 `FORMHASH`；不匹配则抛 `Exception("非法访问", 403, 403, "formhash")`。

> `self::$Formhash` 为静态继承访问，子类可将自身的 `$Formhash` 置为 `true` 以启用校验。

## 使用

```php
use kernel\Platform\DiscuzX\Foundation\DiscuzXController;

class MyController extends DiscuzXController
{
  public $Formhash = true; // 启用 formhash 校验

  public function save()
  {
    $this->verifyFormhash(); // 校验失败会抛 403 异常
    // ...
  }
}
```
