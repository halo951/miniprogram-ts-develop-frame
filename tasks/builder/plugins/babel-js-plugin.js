const path = require("path");
const { Transform } = require("readable-stream");

const PluginError = require("plugin-error");
const applySourceMap = require("vinyl-sourcemaps-apply");
const replaceExt = require("replace-ext");
const babel = require("@babel/core");
const nodePath = require("path");

/** 替换文件后缀名 */
let replaceExtension = fp => {
  return path.extname(fp) ? replaceExt(fp, ".js") : fp;
};
/** babel 版本检查 */
let supportsCallerOptionFlag;
let supportsCallerOption = () => {
  if (typeof supportsCallerOptionFlag === "undefined") {
    try {
      // Rather than try to match the Babel version, we just see if it throws
      // when passed a 'caller' flag, and use that to decide if it is supported.
      babel.loadPartialConfig({
        // eslint-disable-next-line no-undefined
        caller: undefined,
        babelrc: false,
        configFile: false
      });
      supportsCallerOptionFlag = true;
    } catch (_) {
      supportsCallerOptionFlag = false;
    }
  }
  return supportsCallerOptionFlag;
};
exports.babelJsPlugin = (
  opts = {
    minified: false,
    comments: true
  }
) => {
  if (!supportsCallerOption()) throw new PluginError("gulp-babel", "@babel/core@^7.0.0 is required");
  return new Transform({
    objectMode: true,
    async transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer() || nodePath.extname(chunk.path) !== ".js") return cb(null, chunk);
      const fileOpts = {
        ...opts,
        filename: chunk.path,
        filenameRelative: chunk.relative,
        sourceMap: Boolean(chunk.sourceMap),
        sourceFileName: chunk.relative,
        caller: Object.assign({ name: "babel-gulp" }, opts.caller)
      };
      try {
        let res = await babel.transformAsync(chunk.contents.toString(), fileOpts);
        if (res) {
          if (chunk.sourceMap && res.map) {
            res.map.chunk = replaceExtension(chunk.relative);
            applySourceMap(chunk, res.map);
          }
          chunk.contents = Buffer.from(res.code);
          chunk.path = replaceExtension(chunk.path);
          chunk.babel = res.metadata;
        }
      } catch (error) {
        this.emit("error", new PluginError("babel-js-plugin", error, { fileName: chunk.path, showProperties: true }));
      } finally {
        cb(null, chunk);
      }
    }
  });
};
