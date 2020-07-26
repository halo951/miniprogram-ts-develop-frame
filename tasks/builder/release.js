const { series } = require("gulp");
const shell = require("gulp-shell");
const moment = require("moment");
const { build } = require("./build");
const { UNDEFINED_VERSION, TIME_STRING_FORMAT } = require("./default");
const { parseOptions, devtools } = require("./parse");
const nodePath = require("path");
const { quit } = require("../utils/quit");
require("colors");
/** 发布项目任务 */
exports.releaseTask = opt => {
  opt = opt || parseOptions();
  let version = opt.config?.version || UNDEFINED_VERSION;
  let projectPath = nodePath.resolve(opt.dest.replace(/\//gim, "\\"));
  let desc = `Time:${moment().format(TIME_STRING_FORMAT)},proj:${opt.config.proj}-${opt.env}`;
  let task = ``;
  if (opt.env == "wx") task = `${devtools["wx"]} -u ${version}@${projectPath} --upload-desc "${desc}"`;
  if (opt.env == "qq") task = `${devtools["qq"]} -u ${version}@${projectPath} --upload-desc "${desc}"`;
  if (opt.env == "tt") task = `${devtools["tt"]} -u ${version}@${projectPath} --upload-desc "${desc}"`;
  let queue = [];
  queue.push(shell.task(task, { cwd: process.cwd(), quiet: false, verbose: true }));
  if (opt.env != "tt") queue.push(quit());
  queue.push(async () => console.log(`[msg] ${opt.config.proj} is uploaded.`?.yellow));
  return series(queue);
};
/** 发布任务 */
exports.release = () => series(build(), this.releaseTask());
