const { Transform } = require("readable-stream");
/** 生成随机字符串 */
let randomString = len => {
  len = len || 32;
  let $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"; /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  let maxPos = $chars.length;
  let pwd = "";
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

/**
 * 替换环境变量
 * @usage js add `\/* build-confusion:[funcNumber] *\/` -> funcNumber > 0
 */
exports.confusionJSPlugin = () => {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, cb) {
      let { path, contents } = chunk;
      if (chunk.isNull() || !chunk.isBuffer() || !/\.js/.test(path)) return cb(null, chunk);
      let trashCode = [];
      let i = 0;
      let code = new String(contents);
      for (let n = 0; n < 100; n++) {
        let fun = `  fun${randomString(15)}(){\n    /* TODO */\n    /**\n     *${randomString(100)}\n     */\n  },\n`;
        if (trashCode.findIndex(c => c == fun) >= 0) {
          n--;
          continue;
        }
        trashCode.push(fun);
      }
      code = code.replace(/\/\* build-confusion:[0-9]{1,} \*\//gim, substring => {
        let z = substring.match(/\d+/)[0];
        substring = ``;
        for (let e = 0; e < parseInt(z); e++) {
          substring += trashCode[i];
          i++;
        }
        return substring;
      });
      chunk.contents = Buffer.from(code);
      return cb(null, chunk);
    }
  });
};
