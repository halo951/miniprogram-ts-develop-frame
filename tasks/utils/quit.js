const shell = require("gulp-shell");
const { devtools, parseOptions } = require("../builder/parse");

exports.quit = opt => {
  opt = opt || parseOptions();
  return shell.task(`${devtools[opt.env]} -q`, {
    cwd: process.cwd(),
    quiet: false,
    verbose: true
  });
};
