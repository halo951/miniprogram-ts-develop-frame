/** class 基类 */
export declare type ClassIntf = { new (...args: any[]): {} };
/** 注入缓存 */
export class Injector {
  private readonly cache: Map<string, any> = new Map();

  public get(key: string): any {
    if (this.cache.has(key)) return this.cache.get(key);
  }
  public set(key: string, value: any, allowReplace?: boolean) {
    if (this.cache.has(key) && !allowReplace) return;
    this.cache.set(key, value);
  }
  public remove(key: string) {
    if (this.cache.has(key)) this.cache.delete(key);
  }
  public clearAll() {
    let key;
    while ((key = this.cache.keys().next() && key)) this.cache.delete(key);
  }
  public map() {
    return this.cache;
  }
}
/** 实例化缓存 */
export const cache: Injector = new Injector();

/**
 * service 引用装饰器
 * @param name
 */
export function service<T extends ClassIntf>(constructor: T): void;
export function service(name: string): Function;
export function service<T>(): void | Function {
  let arg = arguments[0];
  if (typeof arg == "string") {
    let name = arg;
    return function (constructor: ClassIntf) {
      name = name ?? constructor.name;
      console.log(name, constructor);
      // 将service 实例化并缓存
      cache.set(name, new constructor());
    };
  } else {
    let constructor = <ClassIntf>arg;
    let name = constructor.name;
    // 将service 实例化并缓存
    cache.set(name, new constructor());
  }
}

/**
 * 对象 注入
 * @param name
 */
export function using(name: string): Function;
export function using(target: any, key: string): void;
export function using(arg0: any, key?: string): void | Function {
  if (typeof arg0 == "string") {
    return function (target: any, key: string) {
      let name = arg0;
      target[key] = cache.get(name);
    };
  } else {
    arg0[key] = cache.get(key);
  }
}
