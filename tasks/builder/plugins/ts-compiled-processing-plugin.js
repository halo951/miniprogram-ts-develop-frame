const { Transform } = require("readable-stream");
const babel = require("@babel/core");
const PluginError = require("plugin-error");
const path = require("path");

/** ts编译结果后续处理 */
exports.tsCompiledProcessingPlugin = opt => {
  return new Transform({
    objectMode: true,
    async transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      if (/[a-z]/.test(path.relative(chunk.path, opt.src))) return cb(null, null);
      // 替换相对路径
      let relativePath = path.relative(opt.src, path.relative(chunk.base, chunk.path));
      chunk.path = `${chunk.base}/${relativePath}`;
      // 替换ts符号路径引用
      let code = String(chunk.contents);
      code = code.replace(/"(@\/).+?"/gims, (sub, replaceValue) => {
        return sub.replace(
          replaceValue,
          path.relative(chunk.path, chunk.base).replace(/\\/g, "/").replace(/\.\.$/, "")
        );
      });
      // 压缩
      if (opt.minified) {
        try {
          const fileOpts = {
            minified: opt.minified,
            filename: chunk.path,
            filenameRelative: chunk.relative,
            sourceMap: Boolean(chunk.sourceMap),
            sourceFileName: chunk.relative,
            caller: { name: "babel-gulp" }
          };
          let res = await babel.transformAsync(code, fileOpts);
          code = res ? res.code : code;
        } catch (error) {
          this.emit(
            "error",
            new PluginError("[tsCompiledProcessingPlugin] minified is fail.", error, {
              fileName: chunk.path,
              showProperties: true
            })
          );
        }
      }
      chunk.contents = Buffer.from(code);
      return cb(null, chunk);
    }
  });
};
