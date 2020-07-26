const fs = require("fs");
const nodePath = require("path");
const readline = require("readline");
const moment = require("moment");
const { src, dest } = require("gulp");
const rename = require("gulp-rename");
const notify = require("gulp-notify");
const replace = require("gulp-replace");
const { Transform } = require("readable-stream");

const { parseOptions } = require("../builder/parse");
/**
 * 转换变量
 */
let { type, name, help } = require("cmd-argvs").argv.alias("-t", "type").alias("-n", "name").alias("-q", "help");

/**
 * 命名格式化 驼峰转 -
 * @param {*} name
 */
const nameFix = originName => {
  return originName
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
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

const printHelp = () => {
  return console.log(`
    --------------  use params  --------------
    -t: type [page|layer|module]
    -n: name [string] * 驼峰命名将转化 html - 分割 , “ - ” 命名 需要加双引号
    -q: question 问题帮助
    ------------------------------------------
  `);
};
const pushToProjectConfig = opt => {
  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      if (file.isNull() || !file.isBuffer() || nodePath.extname(file.path) != ".wxml") return cb(null, file);
      let appJsonPath = `${opt.src}/app.json`;
      // 更新 app.json -> pages
      let app = JSON.parse(fs.readFileSync(appJsonPath, { encoding: "utf-8" }));
      app.pages = [...fs.readdirSync(`${opt.src}/pages`).map(c => `pages/${c}/${c}`)];
      fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2), { encoding: "utf-8" });
      return cb(null, file);
    }
  });
};
const basicMap = {
  date: moment().format("yyyy-MM-DD"),
  name(params) {
    return nameFix(nodePath.basename(params.path, nodePath.extname(params.path)));
  }
};
const upperKeyMap = {
  FILE_BASIC_NAME_UPPER: chunk => nameFix(nodePath.basename(chunk.path, nodePath.extname(chunk.path))),
  BASE_FILENAME: chunk => nodePath.basename(chunk.path, nodePath.extname(chunk.path))
};
const replaceTemplateProperties = opt => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      let map = { ...basicMap, ...opt.templateString };
      let content = String(chunk.contents);
      for (let key in map) {
        if (typeof map[key] == "string") content = content.replace(new RegExp(`\\$\\$\\{${key}\\}`, "gim"), map[key]);
        if (typeof map[key] == "function") {
          content = content.replace(
            new RegExp(`\\$\\$\\{${key}\\}`, "gim"),
            map[key]({ ...map, content, path: chunk.path })
          );
        }
      }
      // time:2020年7月17日 02:45:48 新增替换class name 操作
      for (let k in upperKeyMap) content = content.replace(k, upperKeyMap[k](chunk));
      content = content.replace(/\$\$\{.+?}/gim, "");
      chunk.contents = Buffer.from(content);
      return cb(null, chunk);
    }
  });
};
/** 模板文件创建工具 */
exports.create = () => async () => {
  if (help) return printHelp();
  if (!type || !name) throw `Error: 缺少生成必要参数 - -t:${type} -n:${name}`;
  let options = parseOptions();
  let templatePath = `${options.template}/${type}`;
  let out = fs.readFileSync(`${options.template}/out.json`, { encoding: "utf-8" });
  out = JSON.parse(out);
  let destPath = nodePath.normalize(`${out[type]}/${nameFix(name)}`);
  if (!fs.existsSync(templatePath)) throw `Error: 未找到 [${type}] 模板`;
  if (fs.existsSync(destPath)) {
    let r = await readSyncByRl(`[${type}:'${destPath}'] 已存在. 是否覆盖?(y/n)`);
    if (r.toLowerCase() !== "y") return; // skip
  }
  switch (type) {
    case `page`:
      return src(`${templatePath}/**/*`)
        .pipe(rename({ basename: nameFix(name) }))
        .pipe(replaceTemplateProperties(options))
        .pipe(dest(`${options.src}/pages/${nameFix(name)}`))
        .pipe(pushToProjectConfig(options))
        .pipe(notify());
    default:
      return src(`${templatePath}/**/*`)
        .pipe(rename({ basename: nameFix(name) }))
        .pipe(replaceTemplateProperties(options))
        .pipe(replace("/* eslint-disable */", ""))
        .pipe(dest(destPath))
        .pipe(notify());
  }
};
