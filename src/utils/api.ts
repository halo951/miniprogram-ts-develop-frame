import { isVersionSupport } from "@/utils/wechat-version-diff";

/**
 * 微信 api 全局引用
 */
export const api: {
  store: {
    read: <T>(key: string, def?: T) => T;
    write: <T>(key: string, value?: any) => void;
  };
  showModal: (options: WechatMiniprogram.ShowModalOption) => Promise<WechatMiniprogram.ShowModalSuccessCallbackResult>;
  showToast: (title: string, options?: WechatMiniprogram.ShowToastOption) => Promise<void>;
  getSetting: () => Promise<Array<string>>;
  validUserAuthorizate: (scope: "scope.userInfo" | string) => Promise<Boolean>;
  getUserInfo: () => Promise<WechatMiniprogram.GetUserInfoSuccessCallbackResult | null>;
  isIos: () => boolean;
  restart: () => void;
  paddingTop: number;
  statusBarHeight: number;
} = {
  store: {
    read(key: string, def: any) {
      let r = null;
      try {
        if (!wx) return def;
        r = wx.getStorageSync(`${key}`);
      } catch (err) {
        console.warn(`[info] 未获取到[${key}]的缓存数据`);
        return def;
      }
      return r ? r : def;
    },
    write(key: string, value: any) {
      if (!value) wx.removeStorageSync(`${key}`);
      wx.setStorageSync(`${key}`, value);
    }
  },
  /**
   * @description 微信自带对话框
   * @author Halo
   * @date 2019-12-25
   * @param {*} options
   * @returns
   */
  showModal(options: WechatMiniprogram.ShowModalOption) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: `消息`,
        content: ``,
        showCancel: false,
        confirmText: "确定",
        confirmColor: "#3CC51F",
        ...options,
        success: res => resolve(res),
        fail: () => reject()
      });
    });
  },
  showToast(title: string, options?: WechatMiniprogram.ShowToastOption) {
    return new Promise(resolve => {
      wx.showToast({
        title: title || "",
        icon: "none",
        mask: true,
        duration: 3000,
        complete: () => resolve(),
        ...options
      });
    });
  },
  /**
   * @description 获取用户授权状态
   * @author Halo
   * @date 2019-12-10
   */
  getSetting(): Promise<Array<string>> {
    return new Promise(resolve => {
      wx.getSetting({
        success(res) {
          const { authSetting } = res;
          let authorizated = Object.keys(authSetting).filter(k => (authSetting as any)[k]);
          resolve(authorizated);
        },
        fail: () => resolve([])
      });
    });
  },
  /**
   * @description 验证用户是否授权
   * @author Halo
   * @date 2019-12-10
   * @param {*} scope
   */
  async validUserAuthorizate(scope: string) {
    let authorizated = await this.getSetting();
    for (let n = 0, len = authorizated.length; n < len; n++) if (authorizated[n] == scope) return true;
    return false;
  },
  /**
   * @description 获取用户信息
   * @author Halo
   * @date 2019-12-10
   */
  async getUserInfo(): Promise<WechatMiniprogram.GetUserInfoSuccessCallbackResult | null> {
    let scope = await this.validUserAuthorizate(`scope.userInfo`);
    if (scope) {
      return new Promise(resolve => {
        wx.getUserInfo({
          withCredentials: true,
          success(res) {
            console.info(`api.getUserInfo():success`, res);
            resolve(res);
          },
          fail(err) {
            console.error(`api.getUserInfo():fail`, err);
            resolve(null);
          }
        });
      });
    }
    console.error(`api.getUserInfo():skip by scope`, scope);
    return null;
  },
  isIos() {
    let res = wx.getSystemInfoSync();
    return /ios/gim.test(res.system);
  },
  /**
   * @description 小程序重启
   * @author Halo
   * @date 2020-01-07
   */
  restart() {
    let result = isVersionSupport("1.9.90");
    if (!result) {
      console.warn(`当前版本小程序不支持重启操作`);
      return false;
    }
    const manager = wx.getUpdateManager();
    console.log("更新");
    this.showModal({ content: `xxxx` });
    manager.applyUpdate();
  },
  /** 小程序padding top */
  get paddingTop() {
    let jn = wx.getMenuButtonBoundingClientRect();
    return jn.height + jn.top;
  },
  get statusBarHeight() {
    return wx.getSystemInfoSync().statusBarHeight;
  }
};
