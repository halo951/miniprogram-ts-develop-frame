const COS = require("cos-nodejs-sdk-v5");
const fs = require("fs");
const nodePath = require("path");
const { Transform } = require("readable-stream");
const { log, colors } = require("gulp-util");
const PluginError = require("plugin-error");
const tinifySDK = require("tinify");

const { ProgressBar } = require("../utils/progress-bar");

/** 地柜创建文件夹 */
let mkdir = folder => {
  try {
    if (!folder) return false;
    folder = nodePath.normalize(folder);
    let folders = folder.split(/\\/);
    let current = ``;
    for (let f of folders) {
      current += `${f}\\`;
      if (!fs.existsSync(current)) fs.mkdirSync(current);
    }
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
/** 压缩图片插件 */
let uglifyPng = async (file, opt = { uglify: false, key: false, tinifyPathFactory: null }) => {
  const { uglify, key, tinifyPathFactory } = opt;
  const { path } = file;
  tinifySDK.key = key;
  let tinifyedPath = tinifyPathFactory ? tinifyPathFactory(path) : path;
  let isTinifyed = fs.existsSync(tinifyedPath);
  if (isTinifyed) return tinifyedPath;
  else if (!uglify) return path;
  // 压缩 - 如果次数用完了,换账号
  console.time("[uglify-up-time]");
  const source = tinifySDK.fromFile(path);
  console.timeEnd("[uglify-up-time]");
  let dirName = nodePath.dirname(tinifyedPath);
  let r = mkdir(dirName);
  if (r) console.log(`target path:`, tinifyedPath);
  try {
    console.time("[uglify-time]");
    await source.toFile(tinifyedPath);
    console.timeEnd("[uglify-time]");
    log(`[tinify] success. path:[${path}]`);
    return tinifyedPath;
  } catch (error) {
    log(`[tinify] 压缩图片出错. path:[${path}]`, error);
    return path;
  }
};
/** 生成对象存储的文件信息 */
const generateFileInfo = (filePath, opt = { rootPath: null, ignore: [], replaceKeyFactory: null }) => {
  let { rootPath, ignore, replaceKeyFactory } = opt;
  let originPath = nodePath.relative(rootPath, filePath);
  // check file is ignore
  if (ignore) {
    if (typeof ignore == "string" && originPath == ignore) return null;
    else if (ignore instanceof Array && ignore.indexOf(originPath) !== -1) return null;
    else if (ignore instanceof RegExp && ignore.test(originPath)) return null;
  }
  let Key = originPath;
  // replace key
  if (typeof replaceKeyFactory == "function") Key = replaceKeyFactory(originPath);
  Key = Key.replace(/\\/g, "/").replace(/\/$/, "");
  return { originPath, Key };
};
/**
 * 检查文件是否存在云上
 * @param {*} file
 */
const checkFileIsExistsOnCloud = async (cos, options, Key) => {
  return new Promise(resolve => {
    cos.headObject({ ...options, Key }, (err, data) => {
      if (err) {
        if (options.debug) log(`[cloud] : ${Key} not existed`, err);
        resolve(false);
      } else {
        let isExisted = 200 == data.statusCode;
        if (options.debug) log(`[cloud] : ${Key} ${isExisted ? "is" : "not"} existed`);
        resolve(isExisted);
      }
    });
  });
};

/**
 * 上传文件
 * @param {*} file
 */
const uploadFile = (cos, options, vinylFile, fileObject) => {
  return new Promise((resolve, reject) => {
    let pb = null;
    let imgReg = /([/|\\])(img)([/|\\])/;
    let { base, path } = vinylFile;
    let relative = nodePath.relative(base, path);
    // 进度条
    if (options.progress) pb = new ProgressBar(`[upload] : ${colors.blue(relative)}`, 20);
    // png压缩资源提交
    if (fs.existsSync(path.replace(imgReg, "$1tinifyed$3"))) path = path.replace(imgReg, "$1tinifyed$3");
    cos.putObject(
      {
        ...options,
        ...fileObject,
        ContentLength: fs.statSync(path).size,
        Body: fs.createReadStream(path),
        onProgress: info => options.progress && pb.render({ completed: Math.floor(info.percent * 100), total: 100 })
      },
      err => {
        if (options.progress) console.log();
        return err ? reject(err) : resolve();
      }
    );
  });
};
/**
 * 同步流到腾讯云
 * @param {
 *  qcloud options
 *
 * } conf 腾讯云链接参数
 *
 */
exports.tenantCloudUploadPlugin = options => {
  /**
   * 合并配置项
   *
   */
  options = {
    // 原始参数 - qcloud
    SecretId: null,
    SecretKey: null,
    Bucket: null,
    Region: null,
    Headers: {}, // 请求头
    // 文件参数
    rootPath: "", // 必填, 否则会造成根目录下文件无法删除的情况
    forceUpload: false, // 是否强制提交
    replaceKeyFactory: false, // 是否替换key (originPath) => string
    ignore: [], // 忽略文件 Array | string | Regex
    progress: false, // 是否打印上传进度
    debug: false, // 调试
    ...options
  };
  if (!options.SecretId || !options.SecretKey || !options.Bucket || !options.Region) {
    throw PluginError(`tenantCloudUploadPlugin`, "腾讯云参数配置不全");
  }
  /** 创建 cos 链接 */
  let cos = new COS({ ...options });
  /** transform */
  return new Transform({
    objectMode: true,
    async transform(file, encoding, callback) {
      if (file.isNull() || !file.isBuffer()) return callback(null, file);
      let { base, path } = file;
      // 生成操作文件信息
      let fileInfo = generateFileInfo(path, {
        rootPath: options.rootPath,
        ignore: options.ignore,
        replaceKeyFactory: options.replaceKeyFactory
      });
      if (!fileInfo) return callback(null, file); // check skip by ignore
      // 检查文件是否存在云上
      let isExistd = await checkFileIsExistsOnCloud(cos, options, fileInfo.Key);
      if (!options.forceUploa && isExistd) return callback(null, file); // check skip by exists
      // 图片压缩处理
      if ([".png", ".jpg"].find(ext => ext == nodePath.extname(path))) {
        let tinifyedPath = await uglifyPng(file, {
          uglify: options.uglify,
          key: options.tinifyKey,
          tinifyPathFactory: options.tinifyPathFactory
        });
        // 替换原始路径
        fileInfo.originPath = nodePath.relative(base, tinifyedPath);
      }
      try {
        await uploadFile(cos, options, file, fileInfo);
        if (options.debug) log(colors.green(`uploaded: ${fileInfo.Key} success`));
      } catch (e) {
        console.error(`[upload error] ${fileInfo.Key}`, e);
      } finally {
        callback(null, file);
      }
    }
  });
};
