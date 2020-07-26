const { Transform } = require("readable-stream");
const globs = require("globs");
const fs = require("fs");
const path = require("path");
let READED_USED_MAP = [];
/** 检索未使用的组件 */
const findMiniprogramComponentUsingMap = () => {
  if (READED_USED_MAP.length > 0) return READED_USED_MAP;
  let wxmls = globs.sync(`${process.cwd()}/dist/**/*.wxml`);
  wxmls
    .map(w => w.replace(".wxml", ".json"))
    .map(j => fs.readFileSync(j, { encoding: "utf-8" }))
    .filter(fi => fi && fi.trim() != "")
    .map(fi => Object.keys(JSON.parse(fi).usingComponents || []))
    .forEach(arr => (READED_USED_MAP = [...READED_USED_MAP, ...arr]));
  READED_USED_MAP = Array.from(new Set(READED_USED_MAP));
  return READED_USED_MAP;
};
/* 递归删除 */
const deletePath = p => {
  if (!fs.existsSync(p)) return; // skip
  if (!fs.statSync(p).isDirectory()) return fs.unlinkSync(p); // 删除文件
  for (let n of fs.readdirSync(p).map(fn => `${p}/${fn}`)) deletePath(n); // 递归删除
  fs.rmdirSync(p); // 删除空目录
};
/**
 * 小程序组件摇树优化插件
 */
exports.treeshakingPlugin = () => {
  return new Transform({
    objectMode: true,
    async transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      // search unuse componentf
      let usedComponents = findMiniprogramComponentUsingMap();
      let componentName = path.basename(chunk.path, ".wxml");
      // 移除未使用的组件
      if (usedComponents.indexOf(componentName) === -1) {
        console.log(`[remove]`, path.dirname(chunk.path));
        // delete unuse component
        deletePath(path.dirname(chunk.path));
      }
      return cb(null, chunk);
    }
  });
};
