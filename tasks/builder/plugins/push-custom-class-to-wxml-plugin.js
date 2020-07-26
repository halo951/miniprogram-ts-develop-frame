const { Transform } = require("readable-stream");
// format wxml
const pretty = require("pretty");

/**
 * 向wxml插入自定义class
 * @param {boolean} onlyAddToTop 仅添加到顶级节点
 */
exports.pushCustomClassToWxmlPlugin = (custom, onlyAddToTop) => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer() || !/\.wxml/.test(chunk.path)) return cb(null, chunk);
      let content = String(chunk.contents);
      content = pretty(content, { ocd: true });
      let reg = new RegExp(`class="(.+?)"`, onlyAddToTop ? "im" : "gim");
      content = content.replace(reg, function() {
        return `class="${custom || ""} ${arguments[1]}"`;
      });
      content = pretty(content, { ocd: true });
      chunk.contents = Buffer.from(content, `utf8`);
      // 替换环境变量
      cb(null, chunk);
    }
  });
};
