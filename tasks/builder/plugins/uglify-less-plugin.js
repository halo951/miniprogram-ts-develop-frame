const { Transform } = require("readable-stream");
const less = require("less");
const autoprefixer = require("autoprefixer");
const globPlugin = require("less-plugin-glob");
const PluginError = require("plugin-error");
const nodePath = require("path");

/**
 * 替换css中url
 * @param {*} content
 * @param {*} replacePath
 */
const replacePathInCSS = (content, replacePath) => {
  const hasQuote = /^\s*('|")/;
  return content.replace(/(url\()(\s*'|\s*")([^']+?)('|")(\))/gi, (substring, start, quote1, path, quote2, last) => {
    let ret = replacePath(path, quote1);
    if (hasQuote.test(ret) && hasQuote.test(quote1)) quote1 = quote2 = "";
    return (start + quote1 + ret + quote2 + last).replace(/(\w)(\/2)(\w)/g, "$1/$3");
  });
};

exports.unlifyLessPlugin = (prefixUrl, checkAndReplacePath, isUglify, srcPath) => {
  return new Transform({
    objectMode: true,
    async transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      let lessInput = String(chunk.contents);
      // 忽略 less 库文件输出,如果文件作为 library 输入,则跳过编译
      if (/@libs/.test(lessInput)) return cb(null, null);
      // 替换作为css引入的less后缀
      lessInput = lessInput.replace(/@import \(css\) ['"](.+?)['"]/gim, sub => sub.replace(".less", ".wxss"));
      // 替换绝对路径
      lessInput = lessInput.replace(/['"](\/[\S]+\.[\S]+)['"];/gims, sub => {
        sub = sub.replace("/", `${nodePath.relative(chunk.path, srcPath).replace(/\\/g, "/").replace(/\.\.$/, "")}`);
        return sub;
      });
      // 编译并压缩less
      try {
        let output = await less.render(lessInput, {
          filename: chunk.path,
          strictUnits: true,
          urlArgs: `${new Date().getTime()}`,
          lint: true,
          compress: isUglify,
          insecure: true,
          sourceMap: false,
          plugins: [autoprefixer({ overrideBrowserslist: ["last 2 versions"] }), globPlugin]
        });
        // 重写url
        output.css = replacePathInCSS(output.css, path => {
          if (prefixUrl && !/^(\/\/|:\/\/|http)/.test(path) && checkAndReplacePath(path)) {
            let replacedUrl = `${prefixUrl.replace(/\/$/, "")}/${path.replace(/^[./|/]/, "")}`;
            // 验证结果
            // replacedUrl = checkAndReplacePath(replacedUrl);
            // console.log(replacedUrl, checkAndReplacePath(path));
            return replacedUrl;
          }
          return path;
        });
        chunk.contents = Buffer.from(output.css);
      } catch (error) {
        console.log(error);
        this.emit(
          "error",
          new PluginError("uglify-less-plugin", error, { fileName: chunk.path, showProperties: true })
        );
      } finally {
        cb(null, chunk);
      }
    }
  });
};
