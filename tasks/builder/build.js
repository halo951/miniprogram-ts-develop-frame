/** npm util */
const { src, dest, series, parallel, lastRun, watch } = require("gulp");
const gulpif = require("gulp-if");
const shell = require("gulp-shell");
const rename = require("gulp-rename");
const appendPrepend = require("gulp-append-prepend");
const vinylPaths = require("vinyl-paths");
const del = require("del");
const ts = require("gulp-typescript");
const notify = require("gulp-notify");
/* 插件 */
// json 相关
const { copyMiniprogramEnvPlugin } = require("./plugins/copy-miniprogram-env-plugin"); // 复制小程序运行环境配置插件

// ts|js 相关
// const { babelJsPlugin } = require("./plugins/babel-js-plugin"); // babel js编译插件 - 已废弃
const { tsCompiledProcessingPlugin } = require("./plugins/ts-compiled-processing-plugin"); // ts编译结果处理流程
const { replacePropertiesPlugin } = require("./plugins/replace-properties-plugin"); // 替换环境变量插件
const { replacePrxfixUrlPlugin } = require("./plugins/replace-prefix-url-plugin"); // 替换前缀url插件
const { confusionJSPlugin } = require("./plugins/confusion-js-plugin"); // js混淆代码插件 - 插入垃圾方法
const { buildNpmModules, watchNpmUsingUpdate } = require("./plugins/build-npm-modules-plugin"); // 编译npm依赖
const { valiFileChange } = require("./plugins/vali-file-change-plugin");

//  less 相关
const { preParseLessPlugin } = require("./plugins/pre-parse-less-plugin"); // less文件预处理插件
const { unlifyLessPlugin } = require("./plugins/uglify-less-plugin"); // less 转义 wxss 插件

// wxml 相关
const { replaceWxmlTemplateString } = require("./plugins/replace-wxml-template-string"); // 替换 wxml 模板字符串插件
const { replaceWxmlUrlPlugin } = require("./plugins/replace-wxml-url-plugin"); // 替换wxml资源url插件
const { generateComponentUsingPlugin } = require("./plugins/generate-component-using-plugin"); // 生成组件引用插件
const { pushCustomClassToWxmlPlugin } = require("./plugins/push-custom-class-to-wxml-plugin"); // 添加自定义class到wxml插件
const { updateAppPagesPlugin } = require("./plugins/update-app-page-plugin"); // 更新 app.json pages引用
const { uglifyWxmlPlugin } = require("./plugins/uglify-wxml-plugin"); // 压缩wxml插件

// 其他

const { treeshakingPlugin } = require("./plugins/tree-shaking-plugin"); // 摇树优化插件

const { tenantCloudUploadPlugin } = require("./plugins/tenant-cloud-upload-plugin"); // 腾讯云cos资源提交插件

const { wx2any } = require("./plugins/wx-to-any-plugin"); // 项目编译其他平台插件

/* 启动参数 */
let { parseOptions, tenantCloudOptions } = require("./parse");

/** 生成任务封装 */
const generateTask = function (opt) {
  let project = ts.createProject(`${process.cwd()}/tsconfig.json`, { removeComments: !opt.comments });
  /** 清理输出目录 */
  const cleanDest = () => {
    return src(opt.clear == 2 ? `${opt.dest}` : `${opt.dest}/**/*`, {
      allowEmpty: true,
      ignore:
        opt.clear !== 2
          ? []
          : [`${opt.dest}/project.config.json`, `${opt.dest}/package.json`, `${opt.dest}/node_modules`]
    }).pipe(gulpif(() => opt.clear, vinylPaths(del)));
  };
  /**
   * 复制项目json文件
   */
  const copyMiniprogramJson = () => {
    return src([`${opt.src}/**/*.json`, "./package.json", `./project.config.${opt.env}.json`], {
      allowEmpty: true,
      since: opt.watch ? lastRun(copyMiniprogramJson) : null
    })
      .pipe(copyMiniprogramEnvPlugin(opt.config))
      .pipe(dest(opt.dest));
  };

  const buildTs = () => {
    return project
      .src()
      .pipe(gulpif(() => opt.env == "mulit", confusionJSPlugin())) // 混淆代码插件
      .pipe(replacePrxfixUrlPlugin(opt.prefix)) // 替换前缀url
      .pipe(replacePropertiesPlugin({ ...opt, ...opt.config })) // 替换配置数据
      .pipe(wx2any(opt)) // 构建其他来源项目
      .pipe(project()) // 编译 ts
      .js // 获取js 流输出
      .pipe(tsCompiledProcessingPlugin(opt, project.config)) // ts编译结果处理 [符号路径替换,代码压缩]
      .pipe(valiFileChange(opt))
      .pipe(dest(opt.dest));
  };
  /** 编译wxml */
  const buildWxml = () => {
    return (
      src(`${opt.src}/**/*.wxml`, { since: opt.watch ? lastRun(buildWxml) : null })
        .pipe(replaceWxmlTemplateString())
        .pipe(
          replaceWxmlUrlPlugin(pt => {
            if (/^\{\{.+?\}\}$/.test(pt)) return pt;
            return pt.replace(/\/assets\//gim, opt.prefix);
          })
        ) // 替换 wxml url
        .pipe(replacePropertiesPlugin({ ...opt, ...opt.config })) // 替换配置数据
        .pipe(generateComponentUsingPlugin([`${opt.src}/pages/**/*.wxml`, `${opt.src}/components/**/*.wxml`])) // 更新组件引用
        .pipe(updateAppPagesPlugin(opt)) // 更新 app.json pages
        .pipe(pushCustomClassToWxmlPlugin(opt.proj, true)) // 添加 proj 到 wxml顶级class中
        // .pipe(uglifyWxmlPlugin(opt.minified)) // 压缩 wxml
        .pipe(wx2any(opt))
        .pipe(dest(opt.dest))
    );
  };
  /** 编译less */
  const buildLess = () => {
    return src(`${opt.src}/**/*.less`, { since: opt.watch ? lastRun(buildLess) : null })
      .pipe(appendPrepend.prependText(`@import (css) "/animate.min.wxss";`)) // 引用 animate.min.wxss
      .pipe(preParseLessPlugin(opt.config)) // 预处理less
      .pipe(
        unlifyLessPlugin(opt.prefix, u => (u.match(/^\/assets/) ? u.replace(/\/assets\//, "/") : false), true, opt.src)
      ) // 编译并压缩less
      .pipe(rename({ extname: ".wxss" })) // rename file
      .pipe(wx2any(opt))
      .pipe(dest(opt.dest));
  };
  /** 复制原生wxss样式 */
  const copyWxss = () => {
    return src(`${opt.src}/**/*.wxss`, { since: opt.watch ? lastRun(copyWxss) : null })
      .pipe(
        unlifyLessPlugin(opt.prefix, u => (u.match(/^\/assets/) ? u.replace(/\/assets\//, "/") : false), true, opt.src)
      ) // 编译并压缩less
      .pipe(wx2any(opt))
      .pipe(dest(opt.dest));
  };

  /** 组件摇树优化任务 */
  const treeShakingTask = () => {
    return src(`${opt.dest}/components/**/*.wxml`).pipe(gulpif(!opt.watch, treeshakingPlugin()));
  };
  /** 上传资源 */
  const uploadAssetsToCloud = (() => {
    let uploadAssetsTask = (taskName, rootPath) => {
      let task = () => {
        return src([`${rootPath}/**/*`], { ignore: [`${rootPath}/tinifyeds/**/*`] }).pipe(
          tenantCloudUploadPlugin({
            // 上传文件根目录
            rootPath,
            replaceKeyFactory: origin => `${opt.relative}/${origin}/`, // 替换key方法
            tinifyPathFactory: path => path.replace("imgs", "tinifyeds"), // 指定压缩图片路径
            // 腾讯cos配置
            ...tenantCloudOptions
          })
        );
      };
      return { [taskName]: () => task() };
    };
    if (!opt.disableUpload || !tenantCloudOptions) {
      return series(
        uploadAssetsTask(`uploadAssets`, opt.assets).uploadAssets,
        uploadAssetsTask(`uploadMulitReplaceAssets`, opt.assetsMulit).uploadMulitReplaceAssets
      );
    }
    return async function disableUpload() {};
  })();

  const copyOriginFile = () => {
    return src(`${opt.src}/static/**/*`, { allowEmpty: true }).pipe(dest(`${opt.dest}/static`));
  };

  return {
    cleanDest,
    copyMiniprogramJson,
    buildTs,
    buildLess,
    copyWxss,
    buildWxml,
    treeShakingTask,
    uploadAssetsToCloud,
    copyOriginFile
  };
};
/** 编译任务 */
exports.build = opt => {
  /** 解析配置项 */
  opt = opt || parseOptions();
  /** 封装任务 */
  let {
    cleanDest,
    copyMiniprogramJson,
    buildTs,
    buildLess,
    copyWxss,
    buildWxml,
    treeShakingTask,
    uploadAssetsToCloud,
    copyOriginFile
  } = generateTask(opt);

  let listener = async () => {
    let options = { delay: 100, queue: true };
    watch(
      `${opt.src}/**/*.ts`,
      options,
      series(buildTs, () => watchNpmUsingUpdate(opt.dest))
    );
    watch(`${opt.src}/**/*.wxml`, options, buildWxml);
    watch(`${opt.src}/**/*.less`, options, buildLess);
    watch(`${opt.src}/**/*.wxss`, options, copyWxss);
    watch([`${opt.src}/**/*.json`], options, copyMiniprogramJson);
    watch(`${opt.assets}/**/*`, { ...options, delay: 5000 }, uploadAssetsToCloud);
    watch(`${opt.dest}/package.json`, { delay: 100, queue: true, ignored: [] }, buildNpmModules(opt.dest));
    watch(`${opt.src}/static/**/*`, { delay: 100 }, copyOriginFile);
  };
  let tasks = [
    cleanDest, // 清理输出目录
    series(copyMiniprogramJson), // 复制 mp json
    series(copyOriginFile), // 复制原始资源
    parallel(buildTs, buildLess, copyWxss, buildWxml), // 编译 ts, less,wxml, 复制wxss
    buildNpmModules(opt.dest), // 编译npm依赖
    treeShakingTask, // 组件摇树优化
    uploadAssetsToCloud // 提交资源到腾讯云
  ];
  if (opt.clear == 2) tasks.unshift(shell.task(`yarn kill & echo 1`));
  if (opt.watch) tasks.push(listener);
  /** 导出编译任务 */
  return series(tasks);
};
