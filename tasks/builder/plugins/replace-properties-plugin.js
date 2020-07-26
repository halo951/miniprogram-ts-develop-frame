const { Transform } = require("readable-stream");
const babel = require("@babel/core");
const nodePath = require("path");

/** 替换配置 */
const replaceLibrary = (bundle, path, properties) => {
  let res = babel.transform(bundle, {
    filename: path,
    presets: ["@babel/preset-env"],
    plugins: ["@babel/plugin-transform-modules-commonjs"]
  });
  const m = new module.constructor();
  try {
    m._compile(res.code, "config.js");
  } catch (error) {
    console.error(`[config.js] 解析错误 - path:${path}`);
  }
  for (let key in m.exports) if (properties[key]) m.exports[key] = properties[key];
  if (m.exports.config) {
    for (let key in m.exports.config) if (properties[key]) m.exports.config[key] = properties[key];
  }
  let content = ``;
  if (nodePath.extname(path) == ".ts") {
    content = Object.keys(m.exports)
      .map(k => `export const ${k} = ${JSON.stringify(m.exports[k], null, 2)}`)
      .join("\n");
  } else {
    content = `module.exports = ${JSON.stringify(m.exports, null, 2)};`;
  }
  let fileHeader = bundle.match(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/im);
  content = `${fileHeader && fileHeader[0] ? fileHeader[0] : ""}\n${content}`.replace(/[\n]{1,}/gim, "\n");
  return content;
};
const replaceByString = (content, properties) => {
  for (let k in properties) {
    let valType = typeof properties[k];
    let jsonObj;
    switch (valType) {
      case "object": // object类型 忽略 $ 字符串变量
        jsonObj = JSON.stringify(properties[k]);
        content = content.replace(new RegExp(`ENV\\[['|"]${k}['|"]\\]`, "gm"), jsonObj);
        content = content.replace(new RegExp(`ENV\\.${k}`, "gm"), jsonObj);
        break;
      case "number":
      case "boolean":
        if (/[A-Z|_]/g.test(k)) {
          // 替换 "KEY" 'key' 将 结果转为对应类型
          content = content.replace(new RegExp(`['|"]${k}['|"]`, "g"), properties[k]);
          // 替换 " PROPERTIE " or  `PROPERTIES` 将模板变量作为字符串
          content = content.replace(new RegExp(`${k}`, "g"), properties[k]);
        } else {
          // 替换 ENV['KEY'] or ENV["key"] or ENV.key 3种类型变量
          content = content.replace(new RegExp(`ENV\\[['|"]${k}['|"]\\]`, "gm"), properties[k]);
          content = content.replace(new RegExp(`ENV\\.${k}`, "gm"), properties[k]);
        }
        break;
      case "string":
      default:
        if (/[A-Z|_]/g.test(k)) {
          // 替换模板变量,但是使用时 需要注意 不要将 KEY 作为变量写入
          content = content.replace(new RegExp(k, "g"), properties[k]);
        } else {
          // 替换 ENV['KEY'] or ENV["key"] or ENV.key 3种类型变量 , 并为结果增加 双引号 避免异常
          content = content.replace(new RegExp(`ENV\\[['|"]${k}['|"]\\]`, "gm"), `"${properties[k]}"`);
          content = content.replace(new RegExp(`ENV\\.${k}`, "gm"), `"${properties[k]}"`);
        }
        break;
    }
  }
  // 对于没有替换掉的选项,代码头加上 const ENV = {}; 避免报错
  if (/ENV\[['|"]['|"]\]/.test(content)) content = `const ENV = {};\n${content}`;
  return content;
};
/** 替换 wxml变量 */
const replaceWxml = (content, properties) => {
  for (let k in properties) {
    content = content.replace(new RegExp(`ENV\\[${k}\\]`, "gm"), properties[k]);
  }
  content = content.replace(/ENV\[.+?\]/gim, "");
  return content;
};
/** 替换环境变量插件
 * @usage ENV['property key'], env.[property key]
 * @target *.js
 */
exports.replacePropertiesPlugin = properties => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      let content = String(chunk.contents);
      if (nodePath.basename(chunk.path, nodePath.extname(chunk.path)) == "config") {
        content = replaceLibrary(content, chunk.path, properties);
      } else if (/const ENV = \{\}/.test(content)) content = replaceByString(content, properties);
      else if (nodePath.extname(chunk.path) == ".wxml") content = replaceWxml(content, properties);
      chunk.contents = Buffer.from(content);
      // 替换环境变量
      return cb(null, chunk);
    }
  });
};
