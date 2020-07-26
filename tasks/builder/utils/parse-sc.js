let argv = require("cmd-argvs").argv;
module.exports = argv
  .alias("-w", "watch")
  .alias("-e", "env") // 环境
  .alias("-c", "clear") // 清理
  .alias("-a", "clearAll") // 清理所有
  .alias("-du", "disableUpload") // 禁用文件上传
  .alias("-t", "version"); // 指定版本号
