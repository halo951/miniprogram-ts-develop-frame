const filelist = require("gulp-filelist");
const { Transform } = require("readable-stream");
const { src, dest } = require("gulp");
const gulpif = require("gulp-if");
const Vinyl = require("vinyl");
const notify = require("gulp-notify");

/**
 * 生成manifest
 */
const generateManifest = () => {
  return src("./src/**/*")
    .pipe(filelist("manifest.json", {}))
    .pipe(
      new Transform({
        objectMode: true,
        transform(f, e, cb) {
          if (f.path != "manifest.json" || f.isNull()) return cb(null, f);
          let content = String(f.contents);
          let map = JSON.parse(content).map(p => p.replace("src/", "/"));
          content = JSON.stringify(map, null, 2);
          cb(null, new Vinyl({ path: "./manifest-list.json", contents: Buffer.from(content) }));
        }
      })
    )
    .pipe(gulpif(file => !file.isDirectory(), dest("./"), notify()));
};

exports.manifest = () => generateManifest;
