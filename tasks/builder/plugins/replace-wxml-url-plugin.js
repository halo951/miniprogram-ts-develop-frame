const { Transform } = require("readable-stream");
// format wxml
const pretty = require("pretty");
/**
 * 替换字符串中的 path
 * @param {*} str
 * @param {*} replaceUrl
 */
const replacePathFromString = (str, replaceUrl) => {
  const hasQuote = /^\s*('|")/;
  return str.replace(/(\s*'|\s*")([^']+?)('|")/gi, (substring, quote1, path, quote2) => {
    let ret = replaceUrl(path, quote1);
    if (hasQuote.test(ret) && hasQuote.test(quote1)) quote1 = quote2 = "";
    return (quote1 + ret + quote2).replace(/(\w)(\/2)(\w)/g, "$1/$3");
  });
};
/** 替换环境变量 */
exports.replaceWxmlUrlPlugin = replaceUrl => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      let content = String(chunk.contents);
      content = pretty(content, { ocd: true });
      // 这里 对于wx表达式做特殊处理,解决箭头换行问题
      content = content.replace(/\n/gim, "");
      content = content.replace(/([ ]{2,})/gim, " ");
      content = content.replace(/\/>/gim, " />");
      content = content.replace(
        /<(audio|image|canvas|web-view|video).*?(src|data-src|data-url|style)=(".*?"|'.*?').+?\/>/gim,
        function () {
          // ? check has attr value and replace link
          if (arguments[3]) return arguments[0].replace(arguments[3], replacePathFromString(arguments[3], replaceUrl));
          return arguments[0];
        }
      );
      content = pretty(content, { ocd: true });
      chunk.contents = Buffer.from(content, `utf8`);
      // 替换环境变量
      cb(null, chunk);
    }
  });
};
