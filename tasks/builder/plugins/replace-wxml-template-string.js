const { Transform } = require("readable-stream");

/** 替换 wxml 模板字符串 */
exports.replaceWxmlTemplateString = () => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      let code = String(chunk.contents);
      code = code.replace(/\{\{.+?\}\}/gim, sub => {
        let w = (sub.match(/['"]/) || ["'"])[0];
        if (!/.+?(`).+?(\$\{.+?\}).+?(`)/.test(sub)) return sub;
        let q = sub.match(/`.+?`/gim);
        for (let i of q) {
          let r = i.replace(/`/g, w);
          r = r.replace(/\$\{(.+?)\}/gi, `${w} + ( $1 ) + ${w}`);
          sub = sub.replace(i, r);
        }
        return sub;
      });
      chunk.contents = Buffer.from(code, `utf8`);
      cb(null, chunk);
    }
  });
};
