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
              text: "ReturnResult 返回结果",
              link: "/php/framework/return-result"
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
            },
            {
              text: "BaseObject & DataObject",
              link: "/php/framework/base-object"
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
