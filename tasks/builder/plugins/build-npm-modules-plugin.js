const globs = require("globs");
const path = require("path");
const shell = require("gulp-shell");
const Vinyl = require("vinyl");
const fs = require("fs");
const { src, dest, series } = require("gulp");
const { Transform } = require("readable-stream");
const packageJson = require("../../../package.json");
// 自定义一个 npm modules 路径
const MP_NPM_MOULDS_PATH = `mp-npm-modules/`;
/** 匹配引用的npm module正则 */
const moduleNameRegexp = [
  new RegExp(`import.+?from\\s{1,}['"\`](.+?)['"\`]`, "gim"),
  new RegExp(`require\\(['"\`](.+?)['"\`]\\)`, "gim")
];

/** 检查module是不是小程序module */
const isMpModule = (cwd, moduleName) => {
  let modulePackagePath = `${cwd}/node_modules/${moduleName}/package.json`;
  let packageData = JSON.parse(fs.readFileSync(modulePackagePath, { encoding: "utf-8" }));
  return !!packageData.miniprogram;
};
const readMainFromMpModule = (cwd, moduleName) => {
  let modulePackagePath = `${cwd}/node_modules/${moduleName}/package.json`;
  let packageData = JSON.parse(fs.readFileSync(modulePackagePath, { encoding: "utf-8" }));
  return path.normalize(packageData.main).replace(path.normalize(packageData.miniprogram), "") || "index.js";
};

/** 获取项目中使用的所有npm module */
const getUsedNpmModules = paths => {
  let moduleNames = [];
  for (let p of paths) {
    // search
    let fi = fs.readFileSync(p, { encoding: "utf-8" });
    let ms = moduleNameRegexp
      .map(reg => fi.match(reg) || [])
      .reduce((last, current) => {
        return [...last, ...current];
      }, [])
      .map(str => str.match(`['"\`](.+?)['"\`]`)[1])
      .filter(moduleName => moduleName) //
      .filter(mn => /^[a-zA-Z-_0-9.]+?$/.test(mn)); // 过滤非npm_modules
    moduleNames = [...moduleNames, ...ms];
  }
  // filter
  moduleNames = Array.from(new Set(moduleNames));
  return moduleNames;
};
/** 更新项目中使用的npm依赖前缀 */
const updateUsingNpmModulePrefix = (basePath, paths) => {
  for (let p of paths) {
    // search
    let fi = fs.readFileSync(p, { encoding: "utf-8" });
    let parent = new Array(path.relative(p, basePath).split("\\").length - 1).fill("..");
    let prefix = ``;
    if (parent.length > 0) prefix = `${parent.join("/")}/`;
    prefix += `${MP_NPM_MOULDS_PATH}/`;
    prefix = prefix.replace(/\/\//g, "/");
    // 获取使用到的npm依赖
    let using = moduleNameRegexp
      .map(reg => fi.match(reg) || [])
      .reduce((last, current) => {
        return [...last, ...current];
      }, []);
    // 替换
    for (let u of using) {
      let target = u.replace(/['"`]([a-zA-Z-_0-9.]+)['"`]/, (sub, mn) => {
        return `"${prefix}${mn}/${readMainFromMpModule(basePath, mn)}"`;
      });
      fi = fi.replace(u, target);
    }
    // write
    fs.writeFileSync(p, fi, { encoding: "utf-8" });
  }
};

/** glob 复制文件 */
const copyMpNpmModule = () => {
  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.isNull() || !chunk.isBuffer() || path.basename(chunk.path) != "package.json") return cb(null, chunk);
      // 判断当前是否未 mp module
      let packageData = JSON.parse(String(chunk.contents));
      if (packageData.miniprogram) {
        let mpOutPath = `${path.dirname(chunk.path)}/${packageData.miniprogram}`;
        for (let p of globs.sync(`${mpOutPath}/**`)) {
          if (fs.lstatSync(p).isDirectory()) continue;
          let { base, cwd } = chunk;
          let relativePath = path.normalize(p).split(path.normalize(mpOutPath))[1];
          let vinlyFile = new Vinyl({
            cwd,
            base,
            path: `${base}/${packageData.name}/${relativePath}`,
            contents: fs.createReadStream(p)
          });
          this.push(vinlyFile, "utf-8");
        }
      }
      return cb(null, chunk);
    }
  });
};
/**
 * 按微信规则替换npm,并更新项目内资源引用路径
 * 替换wx的build-npm
 * @param {String} projectPath 编译项目路径
 * @description 此方法仅用于编译时,执行. 监听需要执行 usingNpmListener
 */
exports.buildNpmModules = projectPath => {
  const checkUsingModule = async () => {
    // 获取待校验文件
    const paths = globs.sync([`${projectPath}/**/*.[tj]s`], {
      ignore: [`${projectPath}/${MP_NPM_MOULDS_PATH}/*`, `${projectPath}/node_modules/*`]
    });
    // 获取package.json 的 dependencies 字段
    const dependencies = packageJson.dependencies;
    // 获取当前ts|js内对 npm module 的引用
    let moduleNames = getUsedNpmModules(paths);
    // > 获取未安装的np module
    let uninstallModules = moduleNames.filter(m => !dependencies[m]);
    // ? is has throw error
    if (uninstallModules.length) {
      throw new Error(`module not found - 引用的以下几个模块未安装 ${JSON.stringify(uninstallModules)}`);
    }
  };
  /* 依赖属性检查(is mp module) */
  const checkMpModule = async () => {
    // 获取package.json 的 dependencies 字段
    const dependencies = packageJson.dependencies;
    // > 获取 非小程序 module
    let unMpModules = Object.keys(dependencies).filter(m => !isMpModule(projectPath, m));
    // ? is has throw error
    if (unMpModules.length) throw new Error(`module is not a miniprogram module. - ${JSON.stringify(unMpModules)}`);
  };
  /* 复制依赖 */
  const copyMPNomModule = () => {
    return src(`${projectPath}/node_modules/**/package.json`)
      .pipe(copyMpNpmModule())
      .pipe(dest(`${projectPath}/${MP_NPM_MOULDS_PATH}`));
  };
  /* 更新项目内npm依赖引用路径 */
  const updateUsingPath = async () => {
    // 获取待校验文件
    const paths = globs.sync([`${projectPath}/**/*.[tj]s`], { ignore: [`${projectPath}/${MP_NPM_MOULDS_PATH}/*`] });
    updateUsingNpmModulePrefix(projectPath, paths);
  };
  return series(
    checkUsingModule,
    shell.task(`yarn`, { cwd: projectPath, quiet: false, verbose: true }),
    checkMpModule,
    copyMPNomModule,
    updateUsingPath
  );
};
/** 监听 npm 引用更新 */
exports.watchNpmUsingUpdate = async destPath => {
  // 获取待校验文件
  const paths = globs.sync([`${destPath}/**/*.[tj]s`], {
    ignore: [`${destPath}/${MP_NPM_MOULDS_PATH}/*`, `${destPath}/node_modules/*`]
  });
  updateUsingNpmModulePrefix(destPath, paths);
};
