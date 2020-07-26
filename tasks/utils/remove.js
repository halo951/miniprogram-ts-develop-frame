const fs = require("fs");
const readline = require("readline");
const vinylPaths = require("vinyl-paths");
const del = require("del");
const { src } = require("gulp");
const notify = require("gulp-notify");
const { Transform } = require("readable-stream");
const { parseOptions } = require("../builder/parse");

let { type, name } = require("cmd-argvs").argv.alias("-t", "type").alias("-n", "name");

let readSyncByRl = tips => {
  tips = tips || "> ";
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(tips, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
};
const cleanUsing = opt => {
  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      let pcjPath = `${opt.src}/project.config.json`;
      let appJsonPath = `${opt.src}/app.json`;
      let pathName = `pages/${name}/${name}`;
      let app = JSON.parse(fs.readFileSync(appJsonPath, { encoding: "utf-8" }));
      app.pages = [...fs.readdirSync(`${opt.src}/pages`).map(n => `pages/${n}/${n}`)];
      fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2), { encoding: "utf-8" });
      let pcj = JSON.parse(fs.readFileSync(pcjPath, { encoding: "utf-8" }));
      pcj.condition.miniprogram.list = [...pcj.condition.miniprogram.list]
        .filter(item => item.pathName != pathName)
        .filter(item => fs.existsSync(`${opt.src}/${item.pathName}.wxml`));
      fs.writeFileSync(pcjPath, JSON.stringify(pcj, null, 2), { encoding: "utf-8" });
      return cb(null, file);
    }
  });
};
/** 项目组件删除工具 */
exports.remove = () => async () => {
  if (!type || !name) throw `Error: 缺少生成必要参数 - -t:${type} -n:${name}`;
  let options = parseOptions();
  let componentPath = `${options.src}/${type}s/${name}`;
  if (!fs.existsSync(componentPath)) throw `Error: [${type}] '${componentPath}' is not found.`;
  let r = await readSyncByRl(`[${type}:'${componentPath}'] 是否删除?(y/n)`);
  if (r.toLowerCase() !== "y") return; // skip
  return src(`${componentPath}`).pipe(vinylPaths(del)).pipe(cleanUsing(options)).pipe(notify()); // delete
};
