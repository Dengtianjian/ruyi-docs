# Http — HTTP 工具类

- **文件位置**: `kernel/Foundation/Network/Http.php`
- **命名空间**: `kernel\Foundation\Network`
- **类型**: 纯静态类
- **是否可继承**: 是

> **已废弃**：`@deprecated <0.3.5.20230218.1105`。推荐改用 `Request` 获取客户端信息。

提供用户真实 IP 获取的静态工具。

## 方法

### `realClientIp()` — 获取用户 IP 地址

依次尝试 `HTTP_CLIENT_IP`、`HTTP_X_FORWARDED_FOR`、`REMOTE_ADDR` 环境变量，返回第一个可用的 IP。

**参数**

- 无。

**返回值**

- `string\|null`：用户 IP 地址；均取不到时返回 `null`。
