const argv = require("cmd-argvs").argv;
const packageJSON = require("./package.json");
const { env, version } = argv.alias("-v", "version").alias("-e", "env");

/** appid转化工具 */
const appid = conf => (env == "qq" ? { qqappid: conf["qq"] } : { appid: conf[env || "wx"] });

/** 开发者工具路径配置 */
exports.devtools = {
  wx: `"C:\\Program Files (x86)\\Tencent\\wxdev\\cli.bat" `,
  qq: `"D:\\workspace\\QQ小程序开发者工具\\cli.bat" `,
  tt: "C:\\Users\\Halo\\AppData\\Local\\Programs\\bytedanceide\\resources\\app.asar.unpacked\\bytecli.bat "
};
/** 环境变量 */
exports.config = {
  /* 基础配置 */
  proj: "proj", // * 必填
  projectname: "projectname", // * 必填
  version: version || packageJSON.version || undefined, // * 必填
  env: env || "wx",
  /* 项目自定义配置 */
  baseUrl: "",
  ...appid({ wx: "" }) // * 必选
};
/** 批量发布配置 : 批量发布考虑单独做脚本处理,不走统一gulp */
exports.mulit = {
  basic: {
    version: version || packageJSON.version || undefined, // * 必填
    baseUrl: "https://mulit-api.mynatapp.cc/"
  },
  tasks: []
};
