const shell = require("gulp-shell");
const { devtools, parseOptions } = require("../builder/parse");
const { path } = require("cmd-argvs").argv.alias("-n", "path");

exports.upload = opt => {
  opt = opt || parseOptions();
  return shell.task(
    `${devtools[opt.env]} -u 1.0.1@${process.cwd()}\\dist\\mulit\\${path}\\${opt.env} --upload-desc='temp upload'`,
    {
      cwd: process.cwd(),
      quiet: false,
      verbose: true
    }
  );
};
