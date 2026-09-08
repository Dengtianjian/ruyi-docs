# Setting — 设置模块门面（Facade，单例）

- **文件位置**: `kernel/Modules/Setting/Setting.php`
- **命名空间**: `kernel\Modules\Setting`
- **继承**: `extends Foundation\Facade`

设置模块的静态门面（单例）。所有静态调用经 `__callStatic` 转发到单例的 `SettingModule` 实例；底层实例由 `resolve()` 懒创建并缓存，全应用共享同一实例，无需手动构造。

> 底层业务逻辑与 `SettingModule` 完全一致；`Setting` 为通用门面，默认 `resolve()` 返回通用
> `SettingModule` 实例。Discuz!X 等平台专属逻辑由 `DiscuzXSettingModuleBase` 经控制器参数直接提供，
> 不改动本门面的默认实例。

## 单例解析

```php
// Facade::resolve() 中懒创建并缓存，全应用唯一
protected static function resolve(): object
{
  return new SettingModule(new SettingsModel());
}
```

## 转发的方法

| 静态方法 | 说明 |
|----------|------|
| `Setting::items(...$names)` | 获取多个设置项（返回 `["name" => value]`） |
| `Setting::item($name)` | 获取单个设置项值 |
| `Setting::exist($name)` | 设置项是否存在 |
| `Setting::add($name, $value = null, $serialization = true)` | 添加设置项 |
| `Setting::save($name, $value, $serialization = true)` | 保存单个设置项 |
| `Setting::saveItems($settings)` | 批量保存设置项（`["name" => value]`） |

## 使用

```php
use kernel\Modules\Setting\Setting;

Setting::save("site_name", "我的站点");
$name = Setting::item("site_name");
```
