const glob = require("globs");
const { Transform } = require("readable-stream");
const nodePath = require("path");
const fs = require("fs");
/**
 * 更新 app.json pages引用
 */
exports.updateAppPagesPlugin = opt => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      let wxmls = glob.sync(`${opt.src}/pages/**/*.wxml`);
      let cut = wxmls.map(w => {
        let dir = nodePath.dirname(nodePath.relative(opt.src, w));
        let base = nodePath.basename(nodePath.relative(opt.src, w), nodePath.extname(w));
        return `${dir}\\${base}`.replace(/[\\\\|\\]/g, "/");
      });
      let appJsonFI = fs.readFileSync(`${opt.dest}/app.json`, { encoding: "utf-8" });
      let app = JSON.parse(appJsonFI);
      let origin = [...app.pages];
      // 消除app.pages 差集
      app.pages = app.pages.filter(p => cut.find(w => p == w));
      // 补充app.pages 未添加项
      app.pages = [...app.pages, ...cut.filter(w => !app.pages.find(p => p == w))];
      let diff = origin.concat(app.pages).filter(v => !origin.includes(v) || !app.pages.includes(v)).length;
      if (diff > 0) fs.writeFileSync(`${opt.dest}/app.json`, JSON.stringify(app, null, 2), { encoding: "utf-8" }); // write
      return cb(null, chunk);
    }
  });
};
