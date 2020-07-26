module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true,
    worker: true
  },
  settings: {},
  extends: ["eslint:recommended"],
  plugins: ["import", "prettier"],
  parser: "babel-eslint",
  parserOptions: {
    allowImportExportEverywhere: true,
    ecmaVersion: 2020
  },
  globals: {
    // global function
    getApp: true,
    getCurrentPages: true,
    // global Object
    wx: true,
    App: true,
    Page: true,
    Component: true,
    Behavior: true,
    ENV: true,
    // system
    define: true,
    process: true,
    describe: true,
    afterAll: true,
    beforeAll: true,
    it: true,
    expect: true
  },
  rules: {
    // "prettier/prettier": 2,
    // 这些规则与 JavaScript 代码中可能的错误或逻辑错误有关
    "use-isnan": 2, // 要求使用 isNaN() 检查 NaN
    "block-scoped-var": 2, // 强制把变量的使用限制在其定义的作用域范围内
    complexity: [2, { max: 20 }], // 指定程序中允许的最大环路复杂度
    "no-script-url": 2, // 禁止使用 javascript：url
    "no-redeclare": 2, // 禁止多次声明同一变量
    "no-unsafe-negation": 2, // 禁止对关系运算符的左操作数使用否定操作符
    "valid-typeof": 2, // 强制 typeof 表达式与有效的字符串进行比较
    "no-empty-character-class": 2, // 禁止在正则表达式中使用空字符集
    "no-constant-condition": 2, // 禁止在条件中使用常量表达式
    "no-duplicate-case": 2, // 禁止出现重复的 case 标签
    "for-direction": 1, // 强制 “for” 循环中更新子句的计数器朝着正确的方向移动
    "no-cond-assign": 2, // 禁止条件表达式中出现赋值操作符
    "no-dupe-args": 2, // 禁止 function 定义中出现重名参数
    "no-dupe-keys": 2, // 禁止对象字面量中出现重复的 key
    "no-multi-str": 2, // 禁止使用多行字符串
    "no-label-var": 2, // 不允许标签与变量同名
    "vars-on-top": 1, // 要求所有的 var 声明出现在它们所在的作用域顶部
    "no-shadow": [2, { hoist: "functions" }], // 禁止变量声明与外层作用域的变量同名
    "no-unused-vars": 1, // 禁止出现未使用过的变量
    "no-undef": 2, // 禁用未声明的变量，除非它们在 /*global */ 注释中被提到
    // can fixed
    "no-extra-boolean-cast": 2, // 禁止不必要的布尔转换
    "no-extra-semi": 2, // 禁止不必要的分号
    "no-undefined": 2, // 禁止将 undefined 作为标识符
    "no-use-before-define": 2, // 禁止在变量定义之前使用它们
    "default-case": 2, // 要求 switch 语句中有 default 分支
    "no-else-return": [2, { allowElseIf: true }], // 禁止 if 语句中 return 语句之后有 else 块
    "no-extra-label": 2, // 禁用不必要的标签
    // "no-multi-spaces": 2, // 禁止使用多个空格
    "no-unused-labels": 1, // 禁用出现未使用过的标
    "wrap-iife": 2, // 要求 IIFE 使用括号括起来
    "no-undef-init": 2, // 禁止将变量初始化为 "undefined"
    // 关于风格指南的 (以下都是可以被eslint 格式化的修复的)
    camelcase: [2, { properties: "always" }], // 强制使用骆驼拼写法命名约定
    "comma-dangle": [
      2,
      {
        arrays: "never",
        objects: "never",
        imports: "never",
        exports: "never",
        functions: "ignore"
      }
    ], // 要求或禁止末尾逗号
    "implicit-arrow-linebreak": [2, "beside"], // 强制隐式返回的箭头函数体的位置
    "new-parens": 2, // 要求调用无参构造函数时有圆括号
    "no-unneeded-ternary": [2, { defaultAssignment: true }], // 禁止可以在有更简单的可替代的表达式时使用三元操作符
    "nonblock-statement-body-position": [2, "beside"], // 强制单个语句的位置
    "quote-props": [2, "as-needed"], // 要求对象字面量属性名称用引号括起来
    "sort-vars": [0, { ignoreCase: true }], // 要求同一个声明块中的变量按顺序排列
    "spaced-comment": [2, "always"], // 强制在注释中 // 或 /* 使用一致的空格
    "no-const-assign": 2, // 禁止修改 const 声明的变量
    "no-dupe-class-members": 2, // 禁止类成员中出现重复的名称
    "no-this-before-super": 2, // 禁止在构造函数中，在调用 super() 之前使用 this 或 "super"
    "no-var": 2, // 要求使用 let 或 const 而不是 "var"
    "object-shorthand": [2, "always", { avoidExplicitReturnArrows: true }], // 要求或禁止对象字面量中方法和属性使用简写语法
    "prefer-arrow-callback": [2, { allowNamedFunctions: false, allowUnboundThis: true }], // 要求回调函数使用箭头函数
    "prefer-template": 2 // 要求使用模板字面量而非字符串连接
  }
};
