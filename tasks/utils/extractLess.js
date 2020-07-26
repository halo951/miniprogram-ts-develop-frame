const fs = require("fs");
const prettier = require("prettier");
const nodePath = require("path");
const readline = require("readline");
const cheerio = require("cheerio");
const notify = require("gulp-notify");
const { src, dest } = require("gulp");
const { Transform } = require("readable-stream");
require("console_color");
/**
 * 转换变量
 */
let { path } = require("cmd-argvs").argv.alias("-p", "path");
/**
 * 格式化路径
 */
const formatPath = () => {
  if (!path) throw new Error(`缺少 ${` -p ${path}`.blue} 参数.`);
  if (nodePath.extname(path) != ".wxml") {
    throw new Error(`-p [${path.toString().blue}] 路径错误,需要复制[wxml]相对路径`);
  }
  return path;
};

const map = {
  ".container[| ]{": `
    .container {
      width: 100vw;
      height: 100vh;
   `,
  ".anchor-components[| ]{": `
    .anchor-components {
       position: fixed;
       width: 100vw;
       height: 100vh;
       top: 0;
       left: 0;
       z-index: 1;
    `,
  ".suspension-components[| ]{": `
    .suspension-components {
      & > .component {
        z-index: 2;
        position: fixed;
      }
     `
};
const replaceClassInfo = less => {
  for (let reg of Object.keys(map)) less = less.replace(new RegExp(reg), map[reg]);
  return less;
};
const extractionStyle = fileInfo => {
  fileInfo = fileInfo
    .replace(/<block>/g, "<block class=''>")
    .replace(/<view>/g, "<view class=''>")
    .replace(/\{\{.+?\}\}/gi, "");
  let getCls = function (node, fi) {
    let body = {};
    let $ = cheerio.load(fi);
    if (/^.+?{{.+?$/.test(node)) node = ` ${node} `.replace(/\{\{.+?\}\}/g, "");
    $(node)
      .children()
      // ! 注意 这里是 cheerio语法,不是数组
      .map((i, e) => {
        if (0 < Object.keys(e.attribs).length) {
          let cls = e.attribs.class;
          if (cls) {
            cls = cls.trim().replace(/ /g, " ");
            for (let c of cls.split(" ")) {
              if ($([node, `.${c}`].join(" ")).length > 0) body[`.${c}`] = getCls([node, `.${c}`].join(" "), fileInfo);
            }
          } else {
            body = getCls([node, e.name].join(" "), fileInfo);
          }
        }
      });
    return body;
  };
  let result = getCls("body", fileInfo);
  // 初次整理
  let less = JSON.stringify(result, null, 2).replace(/"/g, "").replace(/^\{/, "").trim().replace(/\}$/, "");
  // 再次整理
  less = less.replace(/,|:/g, "").replace(/#d/g, ",");
  less = replaceClassInfo(less);
  // 格式化
  return prettier.format(less, { filepath: "temp.less" });
};

function readSyncByRl(tips) {
  tips = tips || "> ";
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(tips, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
/** 通用样式附加 */
const addNormal = (file, lessContent) => {
  try {
    let normal = new Array(nodePath.relative(file.base, file.path).split("\\").length - 2).fill("..").join("/");
    lessContent = `@import (reference) "${normal}/normal.less";\n\n${lessContent}\n\n/* 动画相关 */`;
  } catch (e) {
    console.error(e);
  }
  return lessContent;
};
/** 提取less结构图插件 */
const extrachLessPlugin = () => {
  let transformStream = new Transform({
    objectMode: true,
    async transform(file, encoding, callback) {
      if (file.isNull() || nodePath.extname(file.path) != ".wxml" || !file.isBuffer()) return callback(null, file);
      let lessPath = file.path.replace(".wxml", ".less");
      if (fs.existsSync(lessPath)) {
        let r = await readSyncByRl(`[${nodePath.relative(process.cwd(), lessPath).lightblue}] 存在. 是否覆盖?(y/n)`);
        if (r.toLowerCase() !== "y") return callback(null, null); // skip
      }
      let content = String(file.contents);
      let lessContext = extractionStyle(content);
      lessContext = addNormal(file, lessContext);
      let vinyl = file.clone();
      vinyl.path = file.path.replace(".wxml", ".less");
      vinyl.contents = Buffer.from(lessContext);
      transformStream.push(vinyl);
      return callback(null, null);
    }
  });
  return transformStream;
};
const extractTask = async () => {
  console.log(nodePath.dirname(nodePath.resolve(path)), path);
  return src(path).pipe(extrachLessPlugin()).pipe(dest(`./`)).pipe(notify());
};
const exec = process.argv.find(a => a == "extractLess");
exports.extractLess = () => (exec && formatPath() ? extractTask : async () => {});
