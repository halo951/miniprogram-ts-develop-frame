const { Transform } = require("readable-stream");
const nodePath = require("path");
const globs = require("globs");
const { log, colors } = require("gulp-util");
const miniprogramTags = [
  "wxs",
  "slot",
  "block",
  "cover-image",
  "cover-view",
  "movable-area",
  "movable-view",
  "scroll-view",
  "swiper",
  "swiper-item",
  "view",
  "icon",
  "progress",
  "rich-text",
  "text",
  "button",
  "checkbox",
  "checkbox-group",
  "editor",
  "form",
  "input",
  "label",
  "picker",
  "picker-view",
  "picker-view-column",
  "radio",
  "radio-group",
  "slider",
  "switch",
  "textarea",
  "functional-page-navigator",
  "navigator",
  "audio",
  "camera",
  "image",
  "live-player",
  "live-pusher",
  "video",
  "map",
  "canvas",
  "ad",
  "official-account",
  "open-data",
  "web-view",
  "native-component",
  "aria-component",
  "navigation-bar",
  "page-meta"
];
/**
 * 根据路径判断是否是组件
 * @param {*} path
 */
const isComponent = path => {
  let arr = path.replace(/\//g, "\\").split("\\");
  let index = arr.findIndex(a => -1 !== ["components", "pages"].indexOf(a));
  return "components" == arr[index];
};
/**
 * 生成模块引用路径
 * @param {string} path
 */
const generateModuleUsingPath = path => {
  let arr = path.replace(/\//g, "\\").split("\\");
  let index = arr.findIndex(a => -1 !== ["components", "pages"].indexOf(a));
  let usingPath = ["", ...arr.slice(index, arr.length)].join("/");
  usingPath = usingPath.replace(nodePath.extname(usingPath), "");
  return usingPath;
};
/**
 * 提取wxml标签
 * @param {*} fileInfo
 * @param {*} ignore
 */
const extractWxmlTag = (fileInfo, ignore) => {
  let tags = fileInfo.match(/<([a-z|A-Z|0-9]{1,})(.*)(>??|\/[a-z|A-Z|0-9]>)/gim);
  // 清理标签
  tags = tags
    .map(t => {
      // 忽略由于缺少空格导致的检索到成对标签
      t = t.match(/^(<{1}?)(.+?)(>{1}?)/)[0];
      // 清理标签头
      t = t.replace(/<|>|\/>/gim, "").trim();
      // 按空格分割,取第一位
      t = t.split(" ")[0];
      t = t.replace(/([a-z|A-Z|0-9]{1,})/, "$1");
      return t;
    })
    .filter(t => -1 == ignore.indexOf(t));
  return tags;
};
/** 驼峰命名转 小写 + 横杠 命名 */
const nameFix = originName => {
  return originName.replace(/([A-Z])/g, "-$1").toLowerCase();
};
/** 生成组件引用的json文件 */
exports.generateComponentUsingPlugin = wxmlPath => {
  let transformStream = new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      let matches = globs.sync(wxmlPath, {});
      let manifest = [...matches];
      // 获取wxml内容
      let content = String(chunk.contents);
      // 提取自定义标签
      let customTags = extractWxmlTag(content, [...miniprogramTags]);
      // 检查组件引用(抛出未找到的组件错误)
      let failed = [];
      let usingComponents = {};
      /**
       * 检索
       */
      for (let tag of customTags) {
        let modulePath = manifest.find(m => {
          let moduleName = nodePath.basename(nodePath.normalize(m)).split(".")[0];
          return nameFix(moduleName) == tag && isComponent(nodePath.normalize(m));
        });
        // 写入自定义标签路径
        if (modulePath) usingComponents[tag] = generateModuleUsingPath(modulePath);
        // 记录无效项
        else failed.push(tag);
      }
      /**
       * log 打印标签未定义异常
       */
      if (failed && 0 < failed.length) {
        let componentPath = colors.blue(nodePath.relative(chunk.base, chunk.path));
        let tags = colors.red(JSON.stringify(failed));
        log(`Error: 标签未定义 -path ${componentPath} - not defined tags ${tags}`);
      }
      let component = isComponent(nodePath.relative(chunk.base, chunk.path));
      let usingJson = { component, usingComponents };
      if (["user.wxml", "detail.wxml", "withdrawal.wxml"].includes(nodePath.basename(chunk.path))) {
        usingJson = { ...usingJson, disableScroll: true, disableSwipeBack: true };
      }
      // clone wxml vinyl
      let vinyl = chunk.clone();
      vinyl.path = chunk.path.replace(".wxml", ".json");
      vinyl.contents = Buffer.from(JSON.stringify(usingJson));
      transformStream.push(vinyl);
      return cb(null, chunk);
    }
  });
  return transformStream;
};
