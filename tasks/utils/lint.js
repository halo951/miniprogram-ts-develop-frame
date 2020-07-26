// gulp
const { src, dest, series } = require("gulp");
const { parseOptions } = require("../builder/parse");
const { Transform } = require("readable-stream");
const eslint = require("gulp-eslint");
const prettier = require("gulp-prettier");
const pretty = require("pretty");
const notify = require("gulp-notify");
let opt = parseOptions();
/**
 * lint js
 */
const lintJs = () => {
  return src(`${opt.src}/**/*.js`).pipe(eslint({})).pipe(eslint.format()).pipe(eslint.failAfterError()).pipe(notify());
};
/**
 * lint less
 */
const lintLess = () => {
  return src(`${opt.src}/**.less`).pipe(prettier({})).pipe(notify());
};
/**
 * lint json
 */
const lintJson = () => {
  return src(`${opt.src}/**.json`).pipe(prettier({})).pipe(prettier.check({})).pipe(notify());
};
const lintWxml = () => {
  return src(`${opt.src}/**/*.wxml`)
    .pipe(
      new Transform({
        objectMode: true,
        transform(file, encoding, callback) {
          if (file.isNull() || !file.isBuffer()) return callback(null, file);
          // format
          let content = pretty(String(file.contents), { ocd: true });
          // output
          file.contents = Buffer.from(content);
          return callback(null, file);
        }
      })
    )
    .pipe(dest(opt.src))
    .pipe(notify());
};
/**
 * 导出
 */
// lintLess
exports.lint = () => series(lintJs, lintLess, lintJson, lintWxml);
