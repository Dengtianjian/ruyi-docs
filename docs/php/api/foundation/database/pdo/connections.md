# Connections — 多数据库连接管理器

- **文件位置**: `kernel/Foundation/Database/PDO/Connections.php`
- **命名空间**: `kernel\Foundation\Database\PDO`
- **继承自**: `AbilityBaseObject`
- **类型**: 纯静态类
- **是否可继承**: 是

数据库连接池的全局管理中心，通过静态属性维护所有 `Driver` 实例，支持在运行时动态注册和切换活跃数据库连接。所有方法均为静态方法，全局共享状态。

**核心概念**

```
drivers:     default → Driver(主库)
             slave   → Driver(只读从库)
             log     → Driver(日志库)
useDriver:   → Driver(主库)  ← 当前活跃连接
```

`getUseDriver()` 在无活跃连接时自动调用 `switchToDefaultDriver()`，回退优先级：`$defaultDriver` → 名为 `"default"` 的驱动 → 第一个注册的驱动。

## 属性

| 属性 | 类型 | 默认 | 可见性 | 说明 |
|------|------|------|--------|------|
| `$drivers` | `array` | `[]` | private static | 数据库驱动列表，键为驱动名，值为 `Driver` 实例 |
| `$useDriver` | `Driver` | `null` | private static | 当前使用的数据库驱动 |
| `$defaultDriver` | `Driver` | `null` | private static | 默认数据库驱动 |

## 方法速查表

| 方法 | 作用 |
|------|------|
| `addDriver($driver, $name, $isDefault)` | 添加驱动 |
| `useDriver($name)` | 切换使用指定驱动 |
| `getUseDriver()` | 获取当前使用的驱动 |
| `getDrivers()` | 获取驱动列表 |
| `setDefaultDriver($name)` | 设置默认驱动 |
| `getDefaultDriver()` | 获取默认驱动 |
| `switchToDefaultDriver()` | 切换回默认驱动 |

## 方法

### `addDriver($driver, $name = "default", $isDefault = false)` — 添加驱动

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$driver` | `Driver` | 无 | 驱动实例 |
| `$name` | `string` | `"default"` | 驱动在列表中的键名 |
| `$isDefault` | `bool` | `false` | 是否设为默认驱动，为 `true` 时同步 `setDefaultDriver()` |

**返回值**

- 无。

**示例**

```php
Connections::addDriver(new Driver($dsn, $user, $pass), 'master', true);
Connections::addDriver(new Driver($dsn2, $user2, $pass2), 'slave');
```

### `useDriver($name)` — 使用数据库驱动

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | 无 | 驱动列表键名 |

**返回值**

- `bool`：恒为 `true`。

**异常**

- `Error`：指定驱动不存在时抛出，错误码 `databaseStaticDriverNotExist:500`。

### `getUseDriver()` — 获取当前正在使用的驱动

无活跃连接时自动切换回默认驱动。

**参数**

- 无。

**返回值**

- `Driver`：当前驱动实例。

### `getDrivers()` — 获取数据库驱动列表

**参数**

- 无。

**返回值**

- `array`：全部驱动，键为驱动名。

### `setDefaultDriver($name = "default")` — 设置默认驱动

**参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `$name` | `string` | `"default"` | 驱动列表键名 |

**返回值**

- 无。

**异常**

- `Error`：指定驱动不存在时抛出，错误码 `setDefaultDatabaseDriverError:500`。

### `getDefaultDriver()` — 获取当前设置的默认驱动

**参数**

- 无。

**返回值**

- `Driver\|null`：默认驱动实例。

### `switchToDefaultDriver()` — 切换回默认驱动

回退优先级：`$defaultDriver` → 名为 `"default"` 的驱动 → 第一个注册的驱动。

**参数**

- 无。

**返回值**

- 无。

**异常**

- `Error`：没有任何已注册驱动时抛出，错误码 `switchToDefaultDatabaseDriverError:500`。

**示例**

```php
// 运行时切到从库读
Connections::useDriver('slave');
$users = DB::table('users')->get();

// 切回主库写
Connections::switchToDefaultDriver();
DB::table('users')->insert($data);
```
