/**
 * 做这个library 的原因, 是想 用 ts class 写法去搞小程序,yarn上面目前没找到合适的ts实现库,这里按我想法改出来一个
 * 这里
 * @author Halo
 */
/** class 基类 */
export declare type MpClassIntf<T> = { new (): T };

/** 小程序组件系统方法约束 */
export let InstanceMethods: MpClassIntf<WechatMiniprogram.Component.InstanceMethods<Record<string, any>>>;

// 这里给 小程序系统方法封装一个 空壳
InstanceMethods = class {} as any;

/* 下方options定义顺序参考 developers.weixin.qq.com 文档 */

/** 小程序组件约束 */
export class ComponentOptions extends InstanceMethods
  implements
    WechatMiniprogram.Component.Data<WechatMiniprogram.Component.DataOption>,
    WechatMiniprogram.Component.Property<WechatMiniprogram.Component.PropertyOption>,
    WechatMiniprogram.Component.OtherOption,
    WechatMiniprogram.Component.Lifetimes {
  /** 组件的对外属性，是属性名到属性设置的映射表 */
  properties: Record<string, WechatMiniprogram.Component.AllProperty> = {};
  /** 组件的内部数据，和 properties 一同用于组件的模板渲染 */
  data: Record<string, any> = {};
  /** 组件数据字段监听器，用于监听 properties 和 data 的变化，参见 数据监听器 */
  observers: Record<string, (...args: any[]) => any> = {};
  /** 组件的方法，包括事件响应函数和任意的自定义方法,此属性一般不用,直接正常写方法即可,@Component 会根据方法名,将方法移动至对应属性下 */
  methods: Record<string, Function> = {};
  /** 类似于mixins和traits的组件间代码复用机制，参见 behaviors */
  behaviors: string[] = [];
  /** 组件生命周期函数-在组件实例刚刚被创建时执行，注意此时不能调用 setData ) */
  created(): void {}
  /** 组件生命周期函数-在组件实例进入页面节点树时执行) */
  attached(): void {}
  /** 组件生命周期函数-在组件布局完成后执行) */
  ready(): void {}
  /**	组件生命周期函数-在组件实例被移动到节点树另一个位置时执行) */
  moved(): void {}
  /** 组件生命周期函数-在组件实例被从页面节点树移除时执行) */
  detached(): void {}
  /** 错误捕获 */
  error(err: Error): void {}
  /** 组件生命周期声明对象,上层属性定义将被lifetimes属性中的生命周期事件覆盖 */
  lifetimes: Partial<{
    /** 组件生命周期函数-在组件实例刚刚被创建时执行，注意此时不能调用 setData ) */
    created(): void;
    /** 组件生命周期函数-在组件实例进入页面节点树时执行) */
    attached(): void;
    /** 组件生命周期函数-在组件布局完成后执行) */
    ready(): void;
    /**	组件生命周期函数-在组件实例被移动到节点树另一个位置时执行) */
    moved(): void;
    /** 组件生命周期函数-在组件实例被从页面节点树移除时执行) */
    detached(): void;
    /** 错误捕获 */
    error(err: Error): void;
  }> = {};
  /** 组件间关系定义 */
  relations: { [componentName: string]: WechatMiniprogram.Component.RelationOption };
  /** 组件接受的外部样式类 */
  externalClasses?: string[];
  /** 一些选项 */
  options: WechatMiniprogram.Component.ComponentOptions;
  /** 组件所在页面的生命周期声明对象 */
  pageLifetimes?: Partial<WechatMiniprogram.Component.PageLifetimes>;
  /** 定义段过滤器，用于自定义组件扩展 */
  definitionFilter?: WechatMiniprogram.Component.DefinitionFilter;
}

/** 小程序Page约束
 * @description  此处由于 onShareAppMessage 作为分享开关的关系,
 * 仅在options中做了类型约束,不对 `WechatMiniprogram.Page.ILifetime` 进行 `implement`
 */
export class PageOptions extends InstanceMethods
  implements WechatMiniprogram.Page.Data<WechatMiniprogram.Component.DataOption> {
  /** 监听页面加载
   * @description 页面加载时触发。一个页面只会调用一次，可以在 onLoad 的参数中获取打开当前页面路径中的参数
   * @param {Record<string,string|undefined>} query 页面入参
   */
  onLoad(query: Record<string, string | undefined>): void {}
  /** 监听页面显示
   * @description 页面显示/切入前台时触发。
   */
  onShow(): void {}
  /** 监听页面初次渲染完成
   * @description 页面初次渲染完成时触发。一个页面只会调用一次，代表页面已经准备妥当，可以和视图层进行交互。
   * > 注意
   * - 对界面内容进行设置的 API 如`wx.setNavigationBarTitle`，请在`onReady`之后进行。
   */
  onReady(): void {}
  /** 监听页面隐藏
   * @description 页面隐藏/切入后台时触发。 如 `navigateTo` 或底部 `tab` 切换到其他页面，小程序切入后台等。
   */
  onHide(): void {}
  /** 监听页面卸载
   * @description 页面卸载时触发。如`redirectTo`或`navigateBack`到其他页面时。
   */
  onUnload(): void {}
  /** 监听用户下拉动作
   * @description 监听用户下拉刷新事件。
   * - 需要在`app.json`的`window`选项中或页面配置中开启`enablePullDownRefresh`。
   * - 可以通过`wx.startPullDownRefresh`触发下拉刷新，调用后触发下拉刷新动画，效果与用户手动下拉刷新一致。
   * - 当处理完数据刷新后，`wx.stopPullDownRefresh`可以停止当前页面的下拉刷新。
   */
  onPullDownRefresh(): void {}
  /** 页面上拉触底事件的处理函数
   * @description 监听用户上拉触底事件。
   * - 可以在`app.json`的`window`选项中或页面配置中设置触发距离`onReachBottomDistance`。
   * - 在触发距离内滑动期间，本事件只会被触发一次。
   */
  onReachBottom(): void {}
  /** 用户点击右上角转发
   * @description 监听用户点击页面内转发按钮（`<button>` 组件 `open-type="share"`）或右上角菜单“转发”按钮的行为，并自定义转发内容
   * > 注意
   * 1. 只有定义了此事件处理函数，右上角菜单才会显示“转发”按钮**
   * 2. 此事件需要 return 一个 Object，用于自定义转发内容
   */

  onShareAppMessage(res: any): WechatMiniprogram.Page.ICustomShareContent {
    let a = ["美女福利！现金大奖！help me ！！！", "万元大奖，只差一步，朋友快来帮我！！！"];
    return {
      title: a[Math.random() > 0.4 ? 1 : 0],
      path: "/pages/index/index",
      imageUrl: "$assets/imgs/ad-swiper/swiper-4.png"
    };
  }
  /** 页面滚动触发事件的处理函数
   * @description 监听用户滑动页面事件。
   */
  onPageScroll(options: WechatMiniprogram.Page.IPageScrollOption): void {}
  /** 当前是 tab 页时，点击 tab 时触发，最低基础库： `1.9.0` */
  onTabItemTap(options: WechatMiniprogram.Page.ITabItemTapOption): void {}
  /** 窗口尺寸改变时触发，最低基础库：`2.4.0` */
  onResize(options: WechatMiniprogram.Page.IResizeOption): void {}
  /** data 变量 */
  data: Record<string, any>;
}
/** 小程序 behavior(组件基类),不建议使用,使用 extends 继承更优 */
export class BehaviorOptions extends ComponentOptions {}

/** 小程序App约束 */
export class AppOptions implements WechatMiniprogram.App.Option {
  /** 依照小程序写法惯例,定义一个globalData供全局使用 */
  globalData: Record<string, any>;
  /** 监听小程序初始化 - 全局只触发一次 */
  onLaunch(options: WechatMiniprogram.App.LaunchShowOption): void {}
  /** 监听小程序显示 - 小程序启动，或从后台进入前台显示时 */
  onShow(options: WechatMiniprogram.App.LaunchShowOption): void {}
  /** 监听小程序隐藏 - 小程序从前台进入后台时 */
  onHide(): void {}
  /** 小程序脚本错误监听 */
  onError(error: string): void {}
  /** 页面不存在监听函数 */
  onPageNotFound(options: WechatMiniprogram.App.PageNotFoundOption): void {}
  /** 小程序有未处理的 Promise 拒绝时触发,也可以使用 [wx.onUnhandledRejection](https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onUnhandledRejection.html) */
  onUnhandledRejection: WechatMiniprogram.OnUnhandledRejectionCallback;
}
