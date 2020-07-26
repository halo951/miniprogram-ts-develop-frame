const { Transform } = require("readable-stream");

let random = (min, max) => parseInt(Math.random() * (max - min + 1) + min, 10);

/**
 * 预处理less插件
 */
exports.preParseLessPlugin = options => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      let { path, contents } = chunk;
      if (chunk.isNull() || !chunk.isBuffer() || !/\.less/.test(path)) return cb(null, chunk);
      let code = new String(contents);
      code = code
        .replace(/\r\n/gim, "\t")
        .replace(/\/\*\/\/\/.+?\/\/\/\*\//gim, sub => {
          sub = sub.replace(/\t/gim, "\r\n");
          // - 删除包裹注释
          sub = sub.replace("/*///", "").replace("///" + "*/", "");
          // - 替换字符串变量
          sub = sub.replace(/\[proj\]/, options.proj || "contianer");
          // - 输出函数结果
          sub = sub.replace(/\[random\((\d+),(\d+)\)\]/gim, (s, $1, $2) => {
            return random(parseInt($1), parseInt($2));
          });
          return sub;
        })
        .replace(/\t/gim, "\r\n");
      chunk.contents = Buffer.from(code);
      return cb(null, chunk);
    }
  });
};
