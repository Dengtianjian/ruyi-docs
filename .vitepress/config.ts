import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "如意技术库文档",
  lang: 'zh-Hans',
  description: "如意技术库文档",
  lastUpdated: true,
  srcDir: "docs",
  ignoreDeadLinks: true,
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/favicon.png'
      }
    ]
  ],
  markdown: {
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    },
    lineNumbers: true,
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Vue', link: '/vue/index' },
      { text: 'PHP', link: '/php/getting-started' },
      { text: '微信小程序', link: '/wechat_miniProgram/token/index.html' }
    ],

    sidebar: {
      '/vue/': [
        {
          text: "介绍",
          link: "/vue/index"
        }
      ],
      '/php/': [
        {
          text: "入门指南",
          link: "/php/getting-started"
        },
        {
          text: "框架核心",
          collapsed: false,
          items: [
            {
              text: "App 应用入口",
              link: "/php/framework/app"
            },
            {
              text: "Common 全局函数",
              link: "/php/framework/common"
            },
            {
              text: "Output 输出工具",
              link: "/php/framework/output"
            },
            {
              text: "Router 路由",
              link: "/php/framework/router"
            },
            {
              text: "Controller 控制器",
              link: "/php/framework/controller"
            },
            {
              text: "AuthController 认证控制器",
              link: "/php/framework/auth-controller"
            },
            {
              text: "Middleware 中间件",
              link: "/php/framework/middleware"
            },
            {
              text: "异常体系 Exception",
              link: "/php/framework/exception"
            }
          ]
        },
        {
          text: "请求与响应",
          collapsed: false,
          items: [
            {
              text: "Request 请求",
              link: "/php/framework/request"
            },
            {
              text: "Response 响应",
              link: "/php/framework/response"
            },
            {
              text: "Result 返回结果",
              link: "/php/framework/result"
            },
            {
              text: "Config 配置",
              link: "/php/framework/config"
            },
            {
              text: "Cache 缓存",
              link: "/php/framework/cache"
            }
          ]
        },
        {
          text: "校验 Validation",
          collapsed: false,
          items: [
            {
              text: "Validator 校验器",
              link: "/php/framework/validator"
            },
            {
              text: "校验规则详解",
              link: "/php/framework/validation/rules"
            },
            {
              text: "关联数组校验",
              link: "/php/framework/validation/array-rules"
            },
            {
              text: "使用场景示例",
              link: "/php/framework/validation/examples"
            }
          ]
        },
        {
          text: "事件与日志",
          collapsed: false,
          items: [
            {
              text: "Event 事件",
              link: "/php/framework/event"
            },
            {
              text: "Log 日志",
              link: "/php/framework/log"
            }
          ]
        },
        {
          text: "数据处理",
          collapsed: false,
          items: [
            {
              text: "Str 字符串工具",
              link: "/php/framework/str"
            },
            {
              text: "Numeric 数值工具",
              link: "/php/framework/numeric"
            },
            {
              text: "Money 货币工具",
              link: "/php/framework/money"
            },
            {
              text: "Date 时间工具",
              link: "/php/framework/date"
            },
            {
              text: "Arr 数组工具",
              link: "/php/framework/arr"
            },
            {
              text: "Transform 数据转换器",
              link: "/php/framework/transform"
            },
            {
              text: "Mutator 数据突变器",
              link: "/php/framework/mutator"
            },
            {
              text: "Serializer 序列化",
              link: "/php/framework/serializer"
            }
          ]
        },
        {
          text: "文件系统",
          collapsed: false,
          items: [
            {
              text: "File 文件操作",
              link: "/php/framework/file",
              collapsed: true,
              items: [
                {
                  text: "Filesystem 文件管理",
                  link: "/php/framework/filesystem"
                },
                {
                  text: "FileHelper 文件辅助",
                  link: "/php/framework/file-helper"
                }
              ]
            },
            {
              text: "Zip 压缩解压",
              link: "/php/framework/zip"
            }
          ]
        },
        {
          text: "基础设施",
          collapsed: false,
          items: [
            {
              text: "Provisioner 生命周期编排器",
              link: "/php/framework/provisioner"
            }
          ]
        },
        {
          text: "对象",
          collapsed: false,
          items: [
            {
              text: "BaseObject 基对象",
              link: "/php/framework/base-object"
            },
            {
              text: "AbilityBaseObject 能力基对象",
              link: "/php/framework/ability-base-object"
            },
            {
              text: "DataObject 数据对象",
              link: "/php/framework/data-object"
            }
          ]
        },
        {
          text: "控制台",
          collapsed: false,
          items: [
            {
              text: "Console 控制台与命令执行",
              link: "/php/framework/console"
            },
            {
              text: "内置命令",
              collapsed: false,
              items: [
                {
                  text: "make:app 创建应用",
                  link: "/php/framework/commands/make-app"
                },
                {
                  text: "make:model 生成模型",
                  link: "/php/framework/commands/make-model"
                },
                {
                  text: "make:controller 生成控制器",
                  link: "/php/framework/commands/make-controller"
                },
                {
                  text: "make:middleware 生成中间件",
                  link: "/php/framework/commands/make-middleware"
                },
                {
                  text: "schedule:run 定时任务",
                  link: "/php/framework/commands/schedule-run"
                }
              ]
            }
          ]
        },
        {
          text: "依赖管理",
          collapsed: false,
          items: [
            {
              text: "依赖按需安装",
              link: "/php/framework/dependencies"
            }
          ]
        },
        {
          text: "数据库",
          link: "/php/database",
          collapsed: false,
          items: [
            {
              text: "使用指南",
              link: "/php/database/usage"
            },
            {
              text: "核心 API",
              collapsed: false,
              items: [
                {
                  text: "DB 门面",
                  link: "/php/database/db"
                },
                {
                  text: "Query Builder",
                  link: "/php/database/query"
                },
                {
                  text: "Model 模型",
                  link: "/php/database/model"
                },
                {
                  text: "Relation 关联查询",
                  link: "/php/database/relation"
                }
              ]
            },
            {
              text: "底层组件",
              collapsed: true,
              items: [
                {
                  text: "Driver 驱动",
                  link: "/php/database/driver"
                },
                {
                  text: "Connections 连接管理器",
                  link: "/php/database/connections"
                },
                {
                  text: "Statement SQL 生成器",
                  link: "/php/database/statement"
                }
              ]
            },
            {
              text: "表结构与辅助",
              collapsed: true,
              items: [
                {
                  text: "Table",
                  link: "/php/database/table"
                },
                {
                  text: "Schema",
                  link: "/php/database/schema"
                },
                {
                  text: "Paginator 分页器",
                  link: "/php/database/paginator"
                }
              ]
            },
            {
              text: "其他数据库",
              collapsed: true,
              items: [
                {
                  text: "MongoDB",
                  link: "/php/database/mongodb"
                },
                {
                  text: "SQLite",
                  link: "/php/database/sqlite"
                }
              ]
            }
          ]
        },
        {
          text: "应用层",
          collapsed: false,
          items: [
            {
              text: "应用概览",
              link: "/php/application/overview"
            }
          ]
        },
        {
          text: "API 参考",
          collapsed: false,
          items: [
  {
    text: "总览",
    link: "/php/api/index",
  },
  {
    text: "Foundation",
    collapsed: false,
    items: [
      {
        text: "App 应用入口",
        link: "/php/api/foundation/app",
      },
      {
        text: "Cache 缓存",
        link: "/php/api/foundation/cache",
      },
      {
        text: "Config 配置",
        link: "/php/api/foundation/config",
      },
      {
        text: "Event 事件",
        link: "/php/api/foundation/event",
      },
      {
        text: "Lifecycle 生命周期",
        link: "/php/api/foundation/lifecycle",
      },
      {
        text: "Log 日志",
        link: "/php/api/foundation/log",
      },
      {
        text: "Output 输出",
        link: "/php/api/foundation/output",
      },
      {
        text: "Provisioner 编排器",
        link: "/php/api/foundation/provisioner",
      },
      {
        text: "Result 返回结果",
        link: "/php/api/foundation/result",
      },
      {
        text: "Router 路由",
        link: "/php/api/foundation/router",
      },
      {
        text: "Service 服务基类",
        link: "/php/api/foundation/service",
      },
      {
        text: "URL 统一地址",
        link: "/php/api/foundation/url",
      },
      {
        text: "Common 全局函数",
        link: "/php/api/foundation/common",
      },
      {
        text: "console",
        collapsed: true,
        items: [
          {
            text: "Console",
            link: "/php/api/foundation/console/console",
          },
          {
            text: "Command",
            link: "/php/api/foundation/console/command",
          },
        ],
      },
      {
        text: "controller",
        collapsed: true,
        items: [
          {
            text: "Controller",
            link: "/php/api/foundation/controller/controller",
          },
          {
            text: "AuthController",
            link: "/php/api/foundation/controller/auth-controller",
          },
          {
            text: "ControllerQuery",
            link: "/php/api/foundation/controller/controller-query",
          },
          {
            text: "ControllerBody",
            link: "/php/api/foundation/controller/controller-body",
          },
          {
            text: "ControllerResponse",
            link: "/php/api/foundation/controller/controller-response",
          },
        ],
      },
      {
        text: "data",
        collapsed: true,
        items: [
          {
            text: "Arr 数组",
            link: "/php/api/foundation/data/arr",
          },
          {
            text: "Str 字符串",
            link: "/php/api/foundation/data/str",
          },
          {
            text: "Numeric 数值",
            link: "/php/api/foundation/data/numeric",
          },
          {
            text: "Date 时间",
            link: "/php/api/foundation/data/date",
          },
          {
            text: "Money 货币",
            link: "/php/api/foundation/data/money",
          },
          {
            text: "Mutator 突变器",
            link: "/php/api/foundation/data/mutator",
          },
          {
            text: "Serializer 序列化",
            link: "/php/api/foundation/data/serializer",
          },
          {
            text: "Transform 转换器",
            link: "/php/api/foundation/data/transform",
          },
        ],
      },
      {
        text: "exception",
        collapsed: true,
        items: [
          {
            text: "Error",
            link: "/php/api/foundation/exception/error",
          },
          {
            text: "ErrorCode",
            link: "/php/api/foundation/exception/error-code",
          },
          {
            text: "ExceptionHandler",
            link: "/php/api/foundation/exception/exception-handler",
          },
        ],
      },
      {
        text: "extension",
        collapsed: true,
        items: [
          {
            text: "ExtensionMain",
            link: "/php/api/foundation/extension/extension-main",
          },
          {
            text: "ExtensionProvisioner",
            link: "/php/api/foundation/extension/extension-provisioner",
          },
          {
            text: "Extensions",
            link: "/php/api/foundation/extension/extensions",
          },
        ],
      },
      {
        text: "filesystem",
        collapsed: true,
        items: [
          {
            text: "FileSystem",
            link: "/php/api/foundation/filesystem/file-system",
          },
          {
            text: "FileHelper",
            link: "/php/api/foundation/filesystem/file-helper",
          },
          {
            text: "Path",
            link: "/php/api/foundation/filesystem/path",
          },
          {
            text: "Zip",
            link: "/php/api/foundation/filesystem/zip",
          },
          {
            text: "Storage 存储",
            collapsed: true,
            items: [
              {
                text: "AbstractStorage",
                link: "/php/api/foundation/filesystem/storage/abstract-storage",
              },
              {
                text: "LocalStorage",
                link: "/php/api/foundation/filesystem/storage/local-storage",
              },
              {
                text: "AbstractOSSStroage",
                link: "/php/api/foundation/filesystem/storage/abstract-oss-stroage",
              },
              {
                text: "StorageSignature",
                link: "/php/api/foundation/filesystem/storage/storage-signature",
              },
              {
                text: "StorageFileInfoData",
                link: "/php/api/foundation/filesystem/storage/storage-file-info-data",
              },
            ],
          },
        ],
      },
      {
        text: "http",
        collapsed: true,
        items: [
          {
            text: "Request",
            link: "/php/api/foundation/http/request",
          },
          {
            text: "Response",
            link: "/php/api/foundation/http/response",
          },
          {
            text: "URL",
            link: "/php/api/foundation/http/url",
          },
          {
            text: "Curl",
            link: "/php/api/foundation/http/curl",
          },
          {
            text: "Request 子类",
            collapsed: true,
            items: [
              {
                text: "RequestData",
                link: "/php/api/foundation/http/request/request-data",
              },
              {
                text: "RequestQuery",
                link: "/php/api/foundation/http/request/request-query",
              },
              {
                text: "RequestBody",
                link: "/php/api/foundation/http/request/request-body",
              },
              {
                text: "RequestHeader",
                link: "/php/api/foundation/http/request/request-header",
              },
              {
                text: "RequestParams",
                link: "/php/api/foundation/http/request/request-params",
              },
              {
                text: "RequestPagination",
                link: "/php/api/foundation/http/request/request-pagination",
              },
              {
                text: "RequestModelParams",
                link: "/php/api/foundation/http/request/request-model-params",
              },
            ],
          },
          {
            text: "Response 子类",
            collapsed: true,
            items: [
              {
                text: "ResponseError",
                link: "/php/api/foundation/http/response/response-error",
              },
              {
                text: "ResponseFile",
                link: "/php/api/foundation/http/response/response-file",
              },
              {
                text: "ResponseDownload",
                link: "/php/api/foundation/http/response/response-download",
              },
              {
                text: "ResponsePagination",
                link: "/php/api/foundation/http/response/response-pagination",
              },
              {
                text: "ResponseView",
                link: "/php/api/foundation/http/response/response-view",
              },
              {
                text: "ServerSentEvent",
                link: "/php/api/foundation/http/response/server-sent-event",
              },
            ],
          },
        ],
      },
      {
        text: "middleware",
        collapsed: true,
        items: [
          {
            text: "Middleware",
            link: "/php/api/foundation/middleware/middleware",
          },
          {
            text: "MiddlewareBase",
            link: "/php/api/foundation/middleware/middleware-base",
          },
        ],
      },
      {
        text: "network",
        collapsed: true,
        items: [
          {
            text: "Curl",
            link: "/php/api/foundation/network/curl",
          },
          {
            text: "Http",
            link: "/php/api/foundation/network/http",
          },
        ],
      },
      {
        text: "object",
        collapsed: true,
        items: [
          {
            text: "BaseObject",
            link: "/php/api/foundation/object/base-object",
          },
          {
            text: "AbilityBaseObject",
            link: "/php/api/foundation/object/ability-base-object",
          },
          {
            text: "DataObject",
            link: "/php/api/foundation/object/data-object",
          },
        ],
      },
      {
        text: "validation",
        collapsed: true,
        items: [
          {
            text: "RuleInterface",
            link: "/php/api/foundation/validation/rule-interface",
          },
          {
            text: "Rules",
            link: "/php/api/foundation/validation/rules",
          },
          {
            text: "Rule",
            link: "/php/api/foundation/validation/rule",
          },
          {
            text: "RuleBuilder",
            link: "/php/api/foundation/validation/rule-builder",
          },
          {
            text: "Validator",
            link: "/php/api/foundation/validation/validator",
          },
        ],
      },
      {
        text: "database",
        collapsed: true,
        items: [
          {
            text: "PDO",
            collapsed: true,
            items: [
              {
                text: "DB",
                link: "/php/api/foundation/database/pdo/db",
              },
              {
                text: "Query",
                link: "/php/api/foundation/database/pdo/query",
              },
              {
                text: "Model",
                link: "/php/api/foundation/database/pdo/model",
              },
              {
                text: "Schema",
                link: "/php/api/foundation/database/pdo/schema",
              },
              {
                text: "Table",
                link: "/php/api/foundation/database/pdo/table",
              },
              {
                text: "Connections",
                link: "/php/api/foundation/database/pdo/connections",
              },
              {
                text: "Driver",
                link: "/php/api/foundation/database/pdo/driver",
              },
              {
                text: "Statement",
                link: "/php/api/foundation/database/pdo/statement",
              },
              {
                text: "Paginator",
                link: "/php/api/foundation/database/pdo/paginator",
              },
              {
                text: "Relation 关联",
                collapsed: true,
                items: [
                  {
                    text: "Relation",
                    link: "/php/api/foundation/database/pdo/relation/relation",
                  },
                  {
                    text: "HasOne",
                    link: "/php/api/foundation/database/pdo/relation/has-one",
                  },
                  {
                    text: "HasMany",
                    link: "/php/api/foundation/database/pdo/relation/has-many",
                  },
                  {
                    text: "BelongsTo",
                    link: "/php/api/foundation/database/pdo/relation/belongs-to",
                  },
                ],
              },
            ],
          },
          {
            text: "MongoDB",
            collapsed: true,
            items: [
              {
                text: "Mongo",
                link: "/php/api/foundation/database/mongodb/mongo",
              },
              {
                text: "Driver",
                link: "/php/api/foundation/database/mongodb/driver",
              },
              {
                text: "Collection",
                link: "/php/api/foundation/database/mongodb/collection",
              },
            ],
          },
          {
            text: "SQLite",
            collapsed: true,
            items: [
              {
                text: "SQLite",
                link: "/php/api/foundation/database/sqlite/sqlite",
              },
              {
                text: "SQLiteModel",
                link: "/php/api/foundation/database/sqlite/sqlite-model",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    text: "Service",
    collapsed: true,
    items: [
      {
        text: "AuthService",
        link: "/php/api/service/auth-service",
      },
      {
        text: "LanguageService",
        link: "/php/api/service/language-service",
      },
      {
        text: "RedisService",
        link: "/php/api/service/redis-service",
      },
      {
        text: "StorageService",
        link: "/php/api/service/storage-service",
      },
    ],
  },
  {
    text: "Middleware",
    collapsed: true,
    items: [
      {
        text: "GlobalAuthMiddleware",
        link: "/php/api/middleware/global-auth-middleware",
      },
      {
        text: "GlobalCorsMiddleware",
        link: "/php/api/middleware/global-cors-middleware",
      },
      {
        text: "GlobalWechatOfficialAccountMiddleware",
        link: "/php/api/middleware/global-wechat-official-account-middleware",
      },
    ],
  },
  {
    text: "Model",
    collapsed: true,
    items: [
      {
        text: "AccessTokenModel",
        link: "/php/api/model/access-token-model",
      },
      {
        text: "FilesModel",
        link: "/php/api/model/files-model",
      },
      {
        text: "LoginsModel",
        link: "/php/api/model/logins-model",
      },
      {
        text: "AttachmentKeysModel",
        link: "/php/api/model/attachment-keys-model",
      },
      {
        text: "AttachmentsModel",
        link: "/php/api/model/attachments-model",
      },
      {
        text: "ExtensionsModel",
        link: "/php/api/model/extensions-model",
      },
      {
        text: "OrderModel",
        link: "/php/api/model/order-model",
      },
      {
        text: "SettingsModel",
        link: "/php/api/model/settings-model",
      },
      {
        text: "WechatUsersModel",
        link: "/php/api/model/wechat-users-model",
      },
    ],
  },
  {
    text: "Modules",
    collapsed: true,
    items: [
      {
        text: "SettingModuleBase",
        link: "/php/api/modules/setting-module/setting-module-base",
      },
      {
        text: "SettingService",
        link: "/php/api/modules/setting-module/setting-service",
      },
      {
        text: "SettingsModel",
        link: "/php/api/modules/setting-module/settings-model",
      },
    ],
  },
  {
    text: "Traits",
    collapsed: true,
    items: [
      {
        text: "FilesModelTrait",
        link: "/php/api/traits/model/files-model-trait",
      },
    ],
  },
  {
    text: "Controller",
    collapsed: true,
    items: [
      {
        text: "commands",
        collapsed: true,
        items: [
          {
            text: "MakeCommand",
            link: "/php/api/controller/commands/make-command",
          },
          {
            text: "MakeAppCommand",
            link: "/php/api/controller/commands/make-app-command",
          },
          {
            text: "MakeModelCommand",
            link: "/php/api/controller/commands/make-model-command",
          },
          {
            text: "MakeControllerCommand",
            link: "/php/api/controller/commands/make-controller-command",
          },
          {
            text: "MakeMiddlewareCommand",
            link: "/php/api/controller/commands/make-middleware-command",
          },
          {
            text: "ScheduleRunCommand",
            link: "/php/api/controller/commands/schedule-run-command",
          },
        ],
      },
      {
        text: "main",
        collapsed: true,
        items: [
          {
            text: "IndexController",
            link: "/php/api/controller/main/index-controller",
          },
          {
            text: "Files 文件控制器",
            collapsed: true,
            items: [
              {
                text: "FileBaseController",
                link: "/php/api/controller/main/files/file-base-controller",
              },
              {
                text: "GetFileController",
                link: "/php/api/controller/main/files/get-file-controller",
              },
              {
                text: "UploadFileController",
                link: "/php/api/controller/main/files/upload-file-controller",
              },
              {
                text: "DeleteFileController",
                link: "/php/api/controller/main/files/delete-file-controller",
              },
              {
                text: "DownloadFileController",
                link: "/php/api/controller/main/files/download-file-controller",
              },
              {
                text: "GetFileAuthController",
                link: "/php/api/controller/main/files/get-file-auth-controller",
              },
              {
                text: "PrewiewFileController",
                link: "/php/api/controller/main/files/prewiew-file-controller",
              },
              {
                text: "UpdateFileController",
                link: "/php/api/controller/main/files/update-file-controller",
              },
            ],
          },
          {
            text: "Extensions 扩展控制器",
            collapsed: true,
            items: [
              {
                text: "ExtensionListViewController",
                link: "/php/api/controller/main/extensions/extension-list-view-controller",
              },
              {
                text: "InstallExtensionController",
                link: "/php/api/controller/main/extensions/install-extension-controller",
              },
              {
                text: "OpenCloseExtensionController",
                link: "/php/api/controller/main/extensions/open-close-extension-controller",
              },
              {
                text: "UninstallExtensionController",
                link: "/php/api/controller/main/extensions/uninstall-extension-controller",
              },
              {
                text: "UpgradeExtensionController",
                link: "/php/api/controller/main/extensions/upgrade-extension-controller",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    text: "Platform",
    collapsed: true,
    items: [
      {
        text: "Wechat 微信",
        collapsed: true,
        items: [
          {
            text: "Wechat 基类",
            link: "/php/api/platform/wechat/wechat",
          },
          {
            text: "AccessToken",
            link: "/php/api/platform/wechat/access-token",
          },
          {
            text: "miniprogram 小程序",
            collapsed: true,
            items: [
              {
                text: "WechatMiniProgram",
                link: "/php/api/platform/wechat/miniprogram/wechat-mini-program",
              },
              {
                text: "SecretCheck",
                link: "/php/api/platform/wechat/miniprogram/secret-check",
              },
              {
                text: "User",
                link: "/php/api/platform/wechat/miniprogram/user",
              },
            ],
          },
          {
            text: "official-account 公众号",
            collapsed: true,
            items: [
              {
                text: "WechatOfficialAccount",
                link: "/php/api/platform/wechat/official-account/wechat-official-account",
              },
              {
                text: "AccountManagement",
                link: "/php/api/platform/wechat/official-account/account-management",
              },
              {
                text: "Menu",
                link: "/php/api/platform/wechat/official-account/menu",
              },
              {
                text: "ReplyMessage",
                link: "/php/api/platform/wechat/official-account/reply-message",
              },
              {
                text: "TemplateMessage",
                link: "/php/api/platform/wechat/official-account/template-message",
              },
              {
                text: "UserManagement",
                link: "/php/api/platform/wechat/official-account/user-management",
              },
              {
                text: "WebApp",
                link: "/php/api/platform/wechat/official-account/web-app",
              },
            ],
          },
          {
            text: "wechat-pay 支付",
            collapsed: true,
            items: [
              {
                text: "WechatPay",
                link: "/php/api/platform/wechat/wechat-pay/wechat-pay",
              },
              {
                text: "WechatPayV2",
                link: "/php/api/platform/wechat/wechat-pay/wechat-pay-v2",
              },
              {
                text: "v3",
                collapsed: true,
                items: [
                  {
                    text: "WechatPayV3",
                    link: "/php/api/platform/wechat/wechat-pay/v3/wechat-pay-v3",
                  },
                  {
                    text: "WechatPayJsapi",
                    link: "/php/api/platform/wechat/wechat-pay/v3/wechat-pay-jsapi",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        text: "Aliyun 阿里云",
        collapsed: true,
        items: [
          {
            text: "Aliyun 基类",
            link: "/php/api/platform/aliyun/aliyun",
          },
          {
            text: "AliyunRequest",
            link: "/php/api/platform/aliyun/aliyun-request",
          },
          {
            text: "AliyunSignature",
            link: "/php/api/platform/aliyun/aliyun-signature",
          },
          {
            text: "aliyun-oss 对象存储",
            collapsed: true,
            items: [
              {
                text: "AliyunOSSStorage",
                link: "/php/api/platform/aliyun/aliyun-oss/aliyun-oss-storage",
              },
              {
                text: "AliyunOSSCredentialsProvider",
                link: "/php/api/platform/aliyun/aliyun-oss/aliyun-oss-credentials-provider",
              },
            ],
          },
        ],
      },
      {
        text: "QCloud 腾讯云",
        collapsed: true,
        items: [
          {
            text: "QCloud 基类",
            link: "/php/api/platform/qcloud/qcloud",
          },
          {
            text: "QCloudFaceId",
            link: "/php/api/platform/qcloud/qcloud-face-id",
          },
          {
            text: "QCloudSTS",
            link: "/php/api/platform/qcloud/qcloud-sts",
          },
          {
            text: "qcloud-cos 对象存储",
            collapsed: true,
            items: [
              {
                text: "QCloudCOSSignature",
                link: "/php/api/platform/qcloud/qcloud-cos/qcloud-cos-signature",
              },
              {
                text: "QCloudCOSStorage",
                link: "/php/api/platform/qcloud/qcloud-cos/qcloud-cos-storage",
              },
            ],
          },
        ],
      },
      {
        text: "DiscuzX",
        collapsed: true,
        items: [
          {
            text: "DiscuzXForum",
            link: "/php/api/platform/discuzx/discuzx-forum",
          },
          {
            text: "DiscuzXPost",
            link: "/php/api/platform/discuzx/discuzx-post",
          },
          {
            text: "DiscuzXThread",
            link: "/php/api/platform/discuzx/discuzx-thread",
          },
          {
            text: "DiscuzXUrl",
            link: "/php/api/platform/discuzx/discuzx-url",
          },
          {
            text: "foundation 基础",
            collapsed: true,
            items: [
              {
                text: "DiscuzXApp",
                link: "/php/api/platform/discuzx/foundation/discuzx-app",
              },
              {
                text: "DiscuzXAutoload",
                link: "/php/api/platform/discuzx/foundation/discuzx-autoload",
              },
              {
                text: "DiscuzXAutoloadRegister",
                link: "/php/api/platform/discuzx/foundation/discuzx-autoload-register",
              },
              {
                text: "DiscuzXController",
                link: "/php/api/platform/discuzx/foundation/discuzx-controller",
              },
              {
                text: "DiscuzXExceptionHandler",
                link: "/php/api/platform/discuzx/foundation/discuzx-exception-handler",
              },
              {
                text: "DiscuzXGBKJsonResponse",
                link: "/php/api/platform/discuzx/foundation/discuzx-gbk-json-response",
              },
              {
                text: "DiscuzXHookApp",
                link: "/php/api/platform/discuzx/foundation/discuzx-hook-app",
              },
              {
                text: "DiscuzXLang",
                link: "/php/api/platform/discuzx/foundation/discuzx-lang",
              },
              {
                text: "DiscuzXProvisioner",
                link: "/php/api/platform/discuzx/foundation/discuzx-provisioner",
              },
              {
                text: "DiscuzXResponse",
                link: "/php/api/platform/discuzx/foundation/discuzx-response",
              },
              {
                text: "DiscuzXView",
                link: "/php/api/platform/discuzx/foundation/discuzx-view",
              },
              {
                text: "database 数据库",
                collapsed: true,
                items: [
                  {
                    text: "DiscuzXAddonModel",
                    link: "/php/api/platform/discuzx/foundation/database/discuzx-addon-model",
                  },
                  {
                    text: "DiscuzXDB",
                    link: "/php/api/platform/discuzx/foundation/database/discuzx-db",
                  },
                  {
                    text: "DiscuzXModel",
                    link: "/php/api/platform/discuzx/foundation/database/discuzx-model",
                  },
                  {
                    text: "DiscuzXQuery",
                    link: "/php/api/platform/discuzx/foundation/database/discuzx-query",
                  },
                ],
              },
              {
                text: "storage 存储",
                collapsed: true,
                items: [
                  {
                    text: "DiscuzXLocalStorage",
                    link: "/php/api/platform/discuzx/foundation/storage/discuzx-local-storage",
                  },
                  {
                    text: "DiscuzXQCloudCOS",
                    link: "/php/api/platform/discuzx/foundation/storage/discuzx-qcloud-cos",
                  },
                  {
                    text: "DiscuzXQCloudCOSStorage",
                    link: "/php/api/platform/discuzx/foundation/storage/discuzx-qcloud-cos-storage",
                  },
                  {
                    text: "DiscuzXQCloudStsBase",
                    link: "/php/api/platform/discuzx/foundation/storage/discuzx-qcloud-sts-base",
                  },
                  {
                    text: "DiscuzXQCloudSTS",
                    link: "/php/api/platform/discuzx/foundation/storage/discuzx-qcloud-sts",
                  },
                  {
                    text: "DiscuzXQCloudSTSScope",
                    link: "/php/api/platform/discuzx/foundation/storage/discuzx-qcloud-sts-scope",
                  },
                ],
              },
            ],
          },
          {
            text: "controller 控制器",
            collapsed: true,
            items: [
              {
                text: "attachment 附件",
                collapsed: true,
                items: [
                  {
                    text: "DeleteAttachmentController",
                    link: "/php/api/platform/discuzx/controller/attachment/delete-attachment-controller",
                  },
                  {
                    text: "GetAttachmentController",
                    link: "/php/api/platform/discuzx/controller/attachment/get-attachment-controller",
                  },
                  {
                    text: "UploadAttachmentController",
                    link: "/php/api/platform/discuzx/controller/attachment/upload-attachment-controller",
                  },
                ],
              },
              {
                text: "settings 设置",
                collapsed: true,
                items: [
                  {
                    text: "DiscuzXGetSettingsController",
                    link: "/php/api/platform/discuzx/controller/settings/discuzx-get-settings-controller",
                  },
                  {
                    text: "DiscuzXSaveSettingsController",
                    link: "/php/api/platform/discuzx/controller/settings/discuzx-save-settings-controller",
                  },
                ],
              },
            ],
          },
          {
            text: "member 会员",
            collapsed: true,
            items: [
              {
                text: "DiscuzXMember",
                link: "/php/api/platform/discuzx/member/discuzx-member",
              },
              {
                text: "DiscuzXMemberGroup",
                link: "/php/api/platform/discuzx/member/discuzx-member-group",
              },
            ],
          },
          {
            text: "middleware 中间件",
            collapsed: true,
            items: [
              {
                text: "GlobalDiscuzXAuthMiddleware",
                link: "/php/api/platform/discuzx/middleware/global-discuzx-auth-middleware",
              },
              {
                text: "GlobalDiscuzXMultipleEncodeMiddleware",
                link: "/php/api/platform/discuzx/middleware/global-discuzx-multiple-encode-middleware",
              },
              {
                text: "GlobalDiscuzXWechatOfficialAccountMiddleware",
                link: "/php/api/platform/discuzx/middleware/global-discuzx-wechat-official-account-middleware",
              },
            ],
          },
          {
            text: "model 模型",
            collapsed: true,
            items: [
              {
                text: "CommonSettingModel",
                link: "/php/api/platform/discuzx/model/common-setting-model",
              },
              {
                text: "CommonUserGroupModel",
                link: "/php/api/platform/discuzx/model/common-user-group-model",
              },
              {
                text: "DiscuzXAccessTokenModel",
                link: "/php/api/platform/discuzx/model/discuzx-access-token-model",
              },
              {
                text: "DiscuzXAttachmentKeysModel",
                link: "/php/api/platform/discuzx/model/discuzx-attachment-keys-model",
              },
              {
                text: "DiscuzXAttachmentsModel",
                link: "/php/api/platform/discuzx/model/discuzx-attachments-model",
              },
              {
                text: "DiscuzXExtensionsModel",
                link: "/php/api/platform/discuzx/model/discuzx-extensions-model",
              },
              {
                text: "DiscuzXFilesModel",
                link: "/php/api/platform/discuzx/model/discuzx-files-model",
              },
              {
                text: "DiscuzXLoginsModel",
                link: "/php/api/platform/discuzx/model/discuzx-logins-model",
              },
              {
                text: "DiscuzXSettingsModel",
                link: "/php/api/platform/discuzx/model/discuzx-settings-model",
              },
              {
                text: "DiscuzXWechatUsersModel",
                link: "/php/api/platform/discuzx/model/discuzx-wechat-users-model",
              },
              {
                text: "thread 主题",
                collapsed: true,
                items: [
                  {
                    text: "DiscuzXForumThreadModel",
                    link: "/php/api/platform/discuzx/model/thread/discuzx-forum-thread-model",
                  },
                ],
              },
            ],
          },
          {
            text: "modules 模块",
            collapsed: true,
            items: [
              {
                text: "setting-module 设置模块",
                collapsed: true,
                items: [
                  {
                    text: "DiscuzXSettingModuleBase",
                    link: "/php/api/platform/discuzx/modules/setting-module/discuzx-setting-module-base",
                  },
                  {
                    text: "DiscuzXSettingService",
                    link: "/php/api/platform/discuzx/modules/setting-module/discuzx-setting-service",
                  },
                  {
                    text: "DiscuzXSettingsModel",
                    link: "/php/api/platform/discuzx/modules/setting-module/discuzx-settings-model",
                  },
                ],
              },
            ],
          },
          {
            text: "DiscuzXAttachmentService",
            link: "/php/api/platform/discuzx/service/discuzx-attachment-service",
          },
          {
            text: "TemplateParser",
            link: "/php/api/platform/discuzx/template/template-parser",
          },
        ],
      },
    ],
  },
]
        }
      ],
      '/wechat_miniProgram/': [
        {
          text: "开发指南",
          items: [
            {
              text: "设计变量",
              link: "/wechat_miniProgram/token/index"
            },
            {
              text: "图标",
              link: "/wechat_miniProgram/icons/index"
            },
            {
              text: "组件",
              items: [
                {
                  text: "面板",
                  collapsed: false,
                  items: [
                    {
                      text: "面板列表",
                      link: "/wechat_miniProgram/components/panel/panelList"
                    },
                    {
                      text: "普通面板",
                      link: "/wechat_miniProgram/components/panel/panel"
                    },
                    {
                      text: "内嵌面板",
                      link: "/wechat_miniProgram/components/panel/innerPanel"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    }
  }
})
