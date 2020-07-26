const fs = require("fs");
const axios = require("axios");
const { path } = require("cmd-argvs").argv.alias("-p", "path");
let iconfontFile = path || "iconfont.wxss";
let less = fs.readFileSync(`./src/${iconfontFile}`, { encoding: "utf8" });

let version = less.match(/font_.+?\.ttf/)[0];
let fontface = less
  .replace(/\r\n/gim, "\t")
  .match(/@font-face \{.+?\}/)[0]
  .replace(/\t/gim, "\r\n")
  .replace(/\/\//gim, "https://");
if (!/^font_.+?\.ttf$/.test(version)) return console.log(`[warn] 检查 ${iconfontFile},缺少@font-face`);

(async () => {
  let res = await axios.get(`http://at.alicdn.com/t/${version.replace(".ttf", ".css")}`, {});
  let out = res.data
    .replace(/\n/gim, "\t")
    .replace(/@font-face \{.+?\}/gim, fontface)
    .replace(/\t/gim, "\r\n");
  fs.writeFileSync(`./src/${iconfontFile}`, out, { encoding: "utf-8" });
  console.log(`[update iconfont]`, iconfontFile);
})();
