const nodePath = require("path");
const packageJSON = require("../../package.json");
const { ip } = require("./utils/ip");
const MP_BUILD_CONFIG = require("../../mp-build.config");
const { version, watch, env, clear, clearAll, disableUpload } = require("./utils/parse-sc");
/** 生成前缀url */
const generatePrefix = (opt, e, cdn) => {
  let proj = opt.proj || nodePath.basename(process.cwd());
  let v = opt.version ? `/${opt.version}` : ``;
  let relative = `/${proj}/${watch ? ip : e}${v}`;
  return { cdn: `${cdn}${relative}/`, relative };
};
/** 配置文件 */
const parse = {
  /* 源码目录 */
  src: `./src`,
  /* 导出文件目录 */
  dest: `./dist/${env || "wx"}`,
  /* 模板文件目录 */
  template: `./templates`,
  /* [图片,字体...] 静态资源目录 */
  assets: `./assets`,
  /* 批量替换资源目录 - 同级路径等价替换 */
  assetsMulit: `./assets-mulit/${env}`,
  /* 资源云端地址 */
  cdn: ``,
  /* 开发者工具地址 - 用于[打开,编译,上传]命令调用, 如果换成ci形式,需重写 命令行调用部分(主要是ci配置比较麻烦) */
  devtools: MP_BUILD_CONFIG.devtools || {
    wx: "echo 'wx is not found.'",
    qq: `echo 'qq is not found.'`,
    tt: `echo 'tt is not found.'`
  },
  /* 腾讯云参数 */
  tenantCloudOptions: {
    SecretId: "",
    SecretKey: "",
    Bucket: "",
    Region: "ap-beijing",
    FileParallelLimit: 10, // 同一个实例下上传的文件并发数，默认值3
    ChunkParallelLimit: 1, // 同一个上传文件的分片并发数，默认值3
    ChunkRetryTimes: 5, // 分片上传时，出错重试次数，默认值3（加第一次，请求共4次）
    Headers: {
      CacheControl: "max-age=31536000"
    },
    ignore: [], // 忽略文件 Array | string | Regex
    progress: true, // 进度条
    debug: false,
    forceUpload: true, // 是否强制提交
    uglify: true, // 是否压缩png图片
    tinifyKey: `pRNJ9kLNdMTWcDD4Jrwy4V6dhz7CGvgB`
  },

  /* 模板字符串 - 创建模块文件使用 */
  templateString: {
    author: "Halo"
  },
  /* 环境变量 - 原始配置项 */
  config: {
    proj: "xxxxy".replace(/[xy]/g, c => {
      let r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }),
    projectname: "[any]",
    version: version || packageJSON.version || "undefined",
    appid: {
      wx: "",
      tt: "",
      qq: ""
    }[env || "wx"],
    ...MP_BUILD_CONFIG.config
  },
  /** 配置解析 */
  parseOptions(config) {
    parse.config = config || parse.config;
    let res = {
      ...parse,
      prefix: generatePrefix(parse.config, env, parse.cdn).cdn,
      relative: generatePrefix(parse.config, env, parse.cdn).relative,
      env: env || "wx",
      watch: watch || false,
      minified: !watch || false,
      comments: watch || false,
      disableUpload: disableUpload || false,
      clear: clearAll ? 2 : clear ? 1 : 0
    };
    delete res.parseOptions;
    return res;
  }
};

module.exports = parse;
