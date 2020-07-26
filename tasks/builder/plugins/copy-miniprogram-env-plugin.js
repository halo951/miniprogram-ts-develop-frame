const { Transform } = require("readable-stream");
/** 复制小程序运行环境 */
exports.copyMiniprogramEnvPlugin = properties => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      if (/package.json/.test(chunk.path)) {
        let origin = JSON.parse(chunk.contents);
        let dest = {
          // 仅复制必要变量
          name: origin.name,
          version: origin.version,
          repository: origin.repository,
          dependencies: origin.dependencies,
          license: origin.license
        };
        chunk.contents = Buffer.from(JSON.stringify(dest, null, 2));
      } else {
        let origin = JSON.parse(chunk.contents);
        // 删除原有的 root,引用默认
        delete origin.miniprogramRoot;
        for (let k of Object.keys(properties || {})) {
          if (!origin[k]) continue;
          if (typeof origin[k] == "object" && !(origin[k] instanceof Array)) {
            origin[k] = { ...origin[k], ...properties[k] };
          } else origin[k] = properties[k];
        }
        let output = JSON.stringify(origin, null, 2);
        chunk.contents = Buffer.from(output);
      }
      if (/project\.config/.test(chunk.path)) {
        chunk.path = chunk.path.replace(/project\.config\.[a-z]{2}\.json/, "project.config.json");
      }
      return cb(null, chunk);
    }
  });
};
