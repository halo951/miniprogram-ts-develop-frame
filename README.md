# 主播-ugg 小程序

## builder

- 基于微信小程序,多平台发布工具

## usage

1. `yarn serve` 编译运行 - 开发模式

   - 默认不带参数时: yarn serve -> yarn serve -e=wx
   - 携带参数 `-e` 指定运行环境
   - 携带参数 `-a` 清理运行,如果需要完全生成新的结果时使用。

2. `yarn release` 单一发布

   - **-e** 指定发布环境

3. `yarn preview` 发布预览版(开发版),参考 yarn relase

4. `yarn release:mulit` 批量发布

   - **-e** 指定发布环境
   - **-t** 指定最新版本,编译结果自动更新版本号

5. `yarn c` 创建 组件 或 页面

   - **-t** `[Page,Component,<custom template>]` 类型:自定义模板需要在 `./templates` 中,增加自定义模板,格式参考 `./templates/page`
   - **-n** [String] name 模块名

6. `yarn create:page` 对创建页面进行封装的一个快捷方法

7. `yarn remove` 删除一个 `[组件,页面]`

8. `yarn el` 提取 wxml 样式

   - **-p** [String] Path wxml 相对路径

9. `yarn lint` 代理清理 ,自动运行 prettier,eslint 对代码进行检查清理

10. `yarn mulit:open` 打开批量项目 ide

    - **-e** 环境名
    - **-n** proj

11. `yarn mulit:upload` 执行上传某个 ./dist/mulit/[project] 项目命令

    - **-e** 环境名
    - **-n** proj

12. `yarn quit` 关闭 ide,仅支持 qq,wx

    - **-e** 环境名

## 首次使用配置流程

1. 所有配置都要配置到 mulit-build.config.js

2. 首次拉取项目需要指定 `devtools path`

3. 批量换皮操作图片放在 `./assets-mulit/*/imgs` 目录下

4. 增加自定义配置

   - 必填参数: [proj,projectname,env]

## 环境变量替换方式

      **在js中**
            - 方法

      **在wxml中**
            - 方法示例
            ```
               <!-- example - 1 默认情况下,会将 ENV[key] 格式模板替换为配置字符串 -->
               <view>ENV[PROPERTY_KEY]</view>
               <!-- example - 2 放在渲染模板需要外置双引号,除非是Number类型 -->
               <view>{{"ENV[PROPERTY_KEY]"}}</view>
            ```
            - 备注: 如果ENV[key] 变量未被赋值,默认会将ENV[key] 删除,避免显示错误
