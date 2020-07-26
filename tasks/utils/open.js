const shell = require("gulp-shell");
const { devtools, parseOptions } = require("../builder/parse");
const { path } = require("cmd-argvs").argv.alias("-n", "path");

exports.open = opt => {
  opt = opt || parseOptions();
  console.log(`run:`, `${devtools[opt.env]} -o ${process.cwd()}\\dist\\mulit\\${path}\\${opt.env}`);
  return shell.task(`${devtools[opt.env]} -o ${process.cwd()}\\dist\\mulit\\${path}\\${opt.env}`, {
    cwd: process.cwd(),
    quiet: false,
    verbose: true
  });
};
