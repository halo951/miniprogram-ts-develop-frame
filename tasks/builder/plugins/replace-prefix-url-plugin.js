const { Transform } = require("readable-stream");

/** 替换js资源前缀 */
exports.replacePrxfixUrlPlugin = prefixUrl => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      let content = String(chunk.contents);
      content = content.replace(/\$assets/gim, prefixUrl);
      chunk.contents = Buffer.from(content);
      return cb(null, chunk);
    }
  });
};
