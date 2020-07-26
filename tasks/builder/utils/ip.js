/** 获取当前ip */
exports.ip = (() => {
  let interfaces = require("os").networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if ("IPv4" === alias.family && "127.0.0.1" !== alias.address && !alias.internal) return alias.address;
    }
  }
  return `0.0.0.0`;
})();
