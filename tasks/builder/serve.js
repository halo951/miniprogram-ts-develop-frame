const { series } = require("gulp");
const shell = require("gulp-shell");
const { build } = require("./build");
const { parseOptions, devtools } = require("./parse");
const { env } = require("./utils/parse-sc");
const nodePath = require("path");

/** 导出 serve任务 */
let tasks = [];
/* 注:暂时写开,避免命令差异 */
if (env == "wx") tasks.push(`${devtools["wx"]} -o ${nodePath.resolve(parseOptions().dest)}`);
if (env == "qq") tasks.push(`${devtools["qq"]} -o ${nodePath.resolve(parseOptions().dest)}`);
if (env == "tt") tasks.push(`${devtools["tt"]} -o ${nodePath.resolve(parseOptions().dest)}`);
exports.serve = () => series(build(), shell.task(tasks, { cwd: process.cwd(), quiet: false, verbose: true }));
