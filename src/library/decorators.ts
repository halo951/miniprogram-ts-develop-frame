import { ComponentOptions } from "@/library/lib";
/** class 基类 */
export declare type MpClassIntf<T> = { new (...args: any[]): T };

/** data 变量装饰器
 * @description 用于标记 data变量,注意,属性写入通过 `@page` or `@component` 实现.
 * @param {T} value 参数初始值,会替代属性默认值
 * @example
 * 1. `@data(123) num:Number;` => `data:{ num:123 }`
 * 2. `@data(456) num:Number = 123;` => `data:{ num: 456 }`
 */
export function data(value: any): Function;
/** data 变量装饰器
 * @description 使默认值为null或者赋予初始值的data装饰器
 * @param {any} target [typescript decorator param] 所属对象
 * @param {string} attr [typescript decorator param] 属性名
 * @example
 * 1. `@data num:Number = 123;` => `data:{ num:123 }`
 * 2. `@data num:Number;` => `data:{ num:null }` //
 * @note
 * 1. 如果不给予默认值,data变量将赋值null,
 * 2. 传入的`undefined` 值,也会被赋值为 null. 请注意.
 */
export function data(target: any, attr: string): void;
export function data(): void | Function {
  if (arguments.length > 1) {
    let target = arguments[0];
    let attr = arguments[1];
    if (!target["__init__"]) target["__init__"] = [];
    target["__init__"].push({ target: "data", key: attr, value: undefined }); // push to `__init__`
  } else {
    let value = arguments[0];
    return function (target: any, attr: string) {
      if (!target["__init__"]) target["__init__"] = [];
      target["__init__"].push({ target: "data", key: attr, value }); // push to `__init__`
    };
  }
}

/** property 变量装饰器
 * @description 使用可选参数作为type 值,传入多个值时,除第一个type以外,其他type将写入到 `optionalTypes` 字段
 * @param {Array} type 类型
 * @note 对于使用 `@property(ShortProperty)` 对象而言,会将对应属性的初始值作为value,写入properties
 */
export function property<T extends WechatMiniprogram.Component.PropertyType>(
  arg0: Array<WechatMiniprogram.Component.ShortProperty> | WechatMiniprogram.Component.FullProperty<T>
): Function {
  return function (target: any, attr: string) {
    if (!target["__init__"]) target["__init__"] = [];
    if (arg0 instanceof Array) {
      target["__init__"].push({ target: "property", key: attr, type: arg0[0], value: null, optionalTypes: arg0 });
    } else if (typeof arg0 == "object") {
      target["__init__"].push({ target: "property", key: attr, value: null, ...arg0 });
    }
  };
}

/** App 装饰器
 * @description 将标记有 `@app` 的 class 转化为 App 对象
 */
export function app<T>(constructor: MpClassIntf<T>) {
  // 实例化 app class
  let target = new constructor();
  // 创建参数对象
  let options: WechatMiniprogram.App.Options<Record<string, any>> = {};
  for (let key of Object.getOwnPropertyNames(constructor.prototype)) {
    if (key != "constructor") options[key] = constructor.prototype[key];
  }
  for (let key in target) {
    if (key != "constructor") options[key] = (target as any)[key];
  }
  App(options);
}
/** Page 装饰器
 * @description 注意向页面渲染值,暂时还得用setData()
 */
export function page<T>(constructor: MpClassIntf<T>) {
  // 实例化 app class 用来移植对象
  let target: any = new constructor();
  // 创建参数对象
  let options: Record<string, any> = {};
  // 检索是否存在定义过的data变量
  options.data = target["data"] || {};
  // 初始化待写入初始值
  let __init__: Array<any> = target["__init__"] || [];
  // 成员变量,方法拷贝
  for (let key in target) {
    if (key == "constructor") continue; // skip
    // 复制非 `@data` 的 变量或方法
    if (!__init__.find(item => item.key == key)) options[key] = (target as any)[key];
  }
  // data变量拷贝
  for (let item of __init__) {
    let value = null;
    // find value
    if (item.value) value = item.value;
    else if (target[item.key] != undefined) value = target[item.key];
    // write to data
    options.data[item.key] = value;
  }
  // 复制方法
  for (let key of Object.getOwnPropertyNames(constructor.prototype)) {
    if (key !== "constructor") options[key] = constructor.prototype[key];
  }

  // 实例化 Page
  Page(options);
}
const inclouds = (arr: Array<any>, obj: any) => arr.indexOf(obj) != -1;
/**
 * 组件装饰器
 * @description 根据component 参数模型,筛选data,properties,function放置于合适位置《
 * 然后,将Component生命周期方法,等覆盖至对应的位置内
 * @param constructor
 */
export function component<T>(constructor: MpClassIntf<T>) {
  let originKeys = [
    "properties",
    "data",
    "observers",
    "methods",
    "behaviors",
    "created",
    "attached",
    "ready",
    "moved",
    "detached",
    "error",
    "lifetimes",
    "relations",
    "externalClasses",
    "options",
    "pageLifetimes",
    "definitionFilter",
    "__init__"
  ];
  // 实例化 app class[获取值部分]
  let target: any = new constructor();
  // 创建参数对象
  let options: any = new ComponentOptions(); // 创建基本实例, 然后将原始参数覆盖进去.
  let __init__: Array<any> = target["__init__"] || [];
  let optionsProperties = {};
  for (let key of [...Object.keys(target), ...Object.getOwnPropertyNames(target.__proto__)]) {
    if (inclouds(originKeys, key)) {
      // 原生对象
      options[key] = target[key] || target.__proto__[key];
      continue;
    } else if (typeof target[key] == "function") {
      // 自定义方法
      if (!options.methods) options.methods = {};
      options.methods[key] = target[key];
    } else {
      // 其他动态属性
      optionsProperties[key] = target[key];
    }
  }
  /** 由于封装变量关系,这里需要单独循环写入 */
  for (let item of __init__) {
    // 装饰器变量
    let value = null;
    // find value
    if (item.value != undefined) value = item.value;
    else if (target[item.key] !== undefined) value = target[item.key] || target.__proto__[item.key];
    // write to data
    if (item.target == "property") {
      let property = { ...item };
      delete property.target;
      delete property.key;
      // write to properties
      if (!options.properties) options.properties = {};
      options.properties[item.key] = property;
    } else if (item.target == "data") {
      if (!options.data) options.data = {};
      // write to data
      options.data[item.key] = value;
    }
  }
  // 通过 created() 事件,写入非正常变量值
  options.created = function () {
    for (let k in optionsProperties) this[k] = optionsProperties[k];
  };
  // 实例化
  Component(options);
}
