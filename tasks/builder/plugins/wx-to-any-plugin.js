const { Transform } = require("readable-stream");
const nodePath = require("path");

const nameSuffixMap = {
  ".wxml": {
    wx: ".wxml",
    qq: ".qml",
    tt: ".ttml"
  },
  ".wxss": {
    wx: ".wxss",
    qq: ".qss",
    tt: ".ttss"
  }
};
exports.wx2any = opt => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer()) return cb(null, chunk);
      let ext = nodePath.extname(chunk.path);
      let code = String(chunk.contents);
      if (ext == ".js" || ext == ".ts") {
        // wx.* to tt.*
        code = code.replace(/wx\./gim, `${opt.env}.`);
      }
      if (ext == ".wxml") {
        // wx:* to tt:* or qq:*
        code = code.replace(/wx:/gim, `${opt.env}:`);
        // change file name
        chunk.path = chunk.path.replace(".wxml", nameSuffixMap[".wxml"][opt.env]);
      }
      if (ext == ".wxss" || ext == ".less") {
        // change file name - 存在问题,暂不改写
        // chunk.path = chunk.path.replace(/(\.wxss|\.less)/, nameSuffixMap[".wxss"][opt.env]);
        // code = code.replace(/(\.wxss|\.less)/, nameSuffixMap[".wxss"][opt.env]);
      }
      chunk.contents = Buffer.from(code);
      return cb(null, chunk);
    }
  });
};
