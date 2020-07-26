const { Transform } = require("readable-stream");
const path = require("path");
const fs = require("fs");
/**
 * 自定义增量编译过滤
 * @param {*} opt
 */
exports.valiFileChange = opt => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      // 生成生成结果路径
      let p = path.relative(process.cwd(), path.resolve(opt.src, chunk.path));
      p = path.normalize(`${opt.dest}/${p}`);
      if (!fs.existsSync(p)) return cb(null, chunk);
      let fi = fs.readFileSync(p, { encoding: "utf-8" });
      if (fi !== String(chunk.contents)) return cb(null, chunk);
      return cb(null, null);
    }
  });
};
