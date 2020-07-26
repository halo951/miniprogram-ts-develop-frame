# mp-typescript-extends-library

`微信小程序typescript扩展库`

## usage

1. `yarn add mp-typescript-extends-library` 引入扩展,并执行 build-npm 命令

2. 改写 Page|Component|App|Behavior 结构,并加上对应装饰器

```
/* app 改写 */
App({...})

@app // app 装饰器
class extends AppOptions {
  // 这里需要继承 AppOptions 约束,一方面用于使用微信小程序自带方法,另一方面,是对方法使用的一个约束,避免使用错误方法.
}

/* page 改写 */

// origin

Page({...})

// to
@page
export default class extends PageOptions {

}

/* component 改写 */

// origin

Component({...})

// to
@component
export default class extends ComponentOptions {

}

/* Behavior 改写 */

// origin - 官方写法
module.exports = Behavior({});
// origin usage
import b from './Behavior';
Component({
  behaviors:[b]
})

// to
// Behavior 定义

export class CustomBehavior extends BehaviorOptions {

}

import { CustomBehavior } from "./CustomBehavior"
// usage
@component
export default class extends ComponentOptions {
  behaviors = [new CustomBehavior()]
}

// 建议写法
export class CustomBehavior1 extends ComponentOptions {
  // 对于构成Behavior的静态变量而言,使用 static 替代
  static param:any = {};
  // 对于生命周期事件,按Component 写即可,如
  attached(){ }
  // 对于 data, properties变量,则建议使用 @data、@property 注解
  @data
  d1:string = "asdasd";

  @property
  p1:number = 123;

}


```

3. 根据 ts 语法规范,class 写法可以用两种方式实现

```
// 建议写法
@page
export default class extends PageOptions {

}

// or
@page
class Index extends PageOptions {
  // 不太建议这种写法,可能导致class命名跟全局对象命名冲突
}

```

4. 其他装饰器(注解)

4.1 类装饰器 `@app`,`@page`,`@component`
4.2 属性装饰器 `@data` 和 `@property`

```
/* 以 Component举例 */
@Component
class


```

### 其他的语法糖

### 构成

- `index.ts` 封装导出
- `decorators.ts` 装饰器扩展
- `options.ts` 组件|页面|app.js|Behavior 约束
- `global.d.ts` 用来定义一个 any 类型的 global 变量

### 备注

1. 关于 `Behavior` 的使用,ts 的继承在这方面更优于 Behavior, 建议使用继承替代
2. `mixins` 可重用混入,help:(link)[https://www.tslang.cn/docs/handbook/mixins.html]
