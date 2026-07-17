---
title: 配置文件
---

# 读取
当接收到请求是，实例化 App类，会自动扫描 `Configs` 下的文件，并且按照如下顺序读取覆盖已读的配置  
> 存在才会读取以下文件，从当前列表上而下的顺序读取，后读取的配置文件会覆盖前面读取的配置
1. Config.php 默认配置
2. Config.development.php 开发模式
3. Config.local.php 本地
4. Config.production.php 生产
5. Config.release.php 生产发布

以上文件并不是 `Configs` 文件夹内必须要存在，按需创建。  
建议把`Config.development.php`、`Config.local.php` 两个文件添加到 Git 忽略文件（.gitignore）列表中的，这样部署时不会影响到生产环境的配置文件，或许生产环境也有这两文件中的其中一个呢

# 约定
每个文件需要返回一个关联数组，以读取文件的时候获取配置参数
```php [Config.php]
<?php
//* Config.php

return [
  "version"=>"1.0.0",
  "mode"=>"production"
];
```

# 合并规则
通过 `array_merge` 方法去合并读取到的配置数组以及先有的配置数组
::: code-group
```php [Config.php]
<?php

return [
  "version"=>"1.0.0",
  "mode"=>"production",
  "cors"=>[
    "maxAge"=>86400
    "allowOrigin"=>[
      "https://www.xxx.com",
      "https://xxx.com"
    ]
  ]
];
```
```php [Config.development.php]
<?php

return [
  "cors"=>[
    "allowOrigin"=>[
      "http://localhost:3000",
    ]
  ]
];
```
```php [合并后的]
<?php

return [
  "version"=>"1.0.0",
  "mode"=>"production",
  "cors"=>[
    "maxAge"=>86400
    "allowOrigin"=>[
      "http://localhost:3000",
      "https://www.xxx.com",
      "https://xxx.com"
    ]
  ]
];
```
:::

# 运行模式
目前运行模式只有两种，`development`和`production`  
- `development`：开发环境，当前环境如果运行时有报错会不抑制，直接抛出；如果是接口，会通过 `details` 字段返回错误堆栈
- `production` ：生产环境，会抑制未拦截的报错，显示 `500` 错误；并且接口 `details` 字段会是空

默认是 `production` 模式，**只有通过配置文件中的 `mode` 参数才可以修改当前运行模式**  
可以通过 `F_APP_MODE` 常亮获取当前的运行模式
```php
<?php 

print_r(F_APP_MODE);
```