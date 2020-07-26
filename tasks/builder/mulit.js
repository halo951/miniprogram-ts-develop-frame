/** npm util */
const { src, series } = require("gulp");
const vinylPaths = require("vinyl-paths");
const del = require("del");
const fs = require("fs");
const { version, env } = require("./utils/parse-sc");
const MP_BUILD_CONFIG = require("../../mp-build.config");
const parse = require("./parse");
const { build } = require("./build");
const { releaseTask } = require("./release");
const MULIT_RELEASE_TEMP_PATH = `./dist/mulit/`;
const packageData = require("../../package.json");
const { quit } = require("../utils/quit");
/** 清理批量发布的临时目录 */
const clearTempPath = () => {
  return src(`${MULIT_RELEASE_TEMP_PATH}/**/${env}/*`, { allowEmpty: true, ignore: [] }).pipe(vinylPaths(del));
};

/* 批量发布 */
exports.mulit = () => {
  if (process.argv.findIndex(arg => arg == "mulit") == -1) return async () => {}; // skip
  if (!MP_BUILD_CONFIG.mulit) throw new Error(`[mp-build.config.js] 缺少 'mulit' 配置参数`);
  if (!env) throw new Error(`需要指定 [-e:env] 参数,可选值[wx,tt,qq]`);
  if (!version) throw new Error(`需要指定 [-t:target version]参数,上一版本:${packageData.version || "1.0.1"}`);
  // merge task
  let { basic, tasks } = MP_BUILD_CONFIG.mulit;
  tasks = tasks.map(t => ({ ...basic, ...t }));
  let queue = [];
  for (let t of tasks) {
    let origin = parse.parseOptions(t);
    let task = {
      ...origin,
      dest: `./dist/mulit/${t.proj}/${env || "wx"}`,
      assetsMulit: `./assets-mulit/${t.proj}`,
      minified: true,
      comments: true,
      clear: 0
    };
    // 挂载任务
    queue.push(series(build(task), releaseTask(task)));
    // 如果不是头条系小程序,则清理下进程.
    if (env != "tt") queue.push(quit());
  }
  // 添加清理任务
  queue.unshift(clearTempPath);
  queue.push(async () => {
    packageData.version = version;
    fs.writeFileSync("./package.json", JSON.stringify(packageData, null, 2), { encoding: "utf-8" });
    console.log(`[info] 版本号已更新为:${version}`);
  });
  return series(queue);
};
