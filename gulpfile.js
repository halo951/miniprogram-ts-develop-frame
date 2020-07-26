/** 编译 */
// exports.build = require("./tasks/builder/build").build();
// /** 发布 */
// exports.release = require("./tasks/builder/release").release();
// /** 编译运行 */
// exports.serve = require("./tasks/builder/serve").serve();
// /** 预览 */
// exports.preview = require("./tasks/builder/preview").preview();
// /** 创建组件 */
// exports.create = require("./tasks/utils/create").create;
// /** 销毁组件 */
// exports.remove = require("./tasks/utils/remove").remove;
// /** 提取样式 */
// exports.extractLess = require("./tasks/utils/extract-less").extractLess;
// /** lint */
// exports.lint = require("./tasks/utils/lint").lint;
// /** manifest */
// exports.manifest = require("./tasks/utils/manifest").manifest;

// /** ! 批量发布 */
// exports.mulit = require("./tasks/builder/mulit").mulit();

// exports.open = require("./tasks/builder/exec").open();

// exports.upload = require("./tasks/builder/exec").upload();

// exports.quit = require("./tasks/builder/exec").quit();
const fs = require("fs");
let method = process.argv[2];
let task = (() => {
  let dir = fs.readdirSync("./tasks/");
  for (let d of dir) if (fs.existsSync(`./tasks/${d}/${method}.js`)) return require(`./tasks/${d}/${method}`)[method]();
  return async () => {
    console.log(`未找到方法 ${method}`);
  };
})();
exports[method] = task;
