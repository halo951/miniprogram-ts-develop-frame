import { AppOptions } from "./library/options";
import { app } from "./library/decorators";
import { TokenFactory } from "./services/TokenFactory";
import { using } from "./library/injector";

/**
 * App()
 *
 * @author Halo
 * @date 2020-07-10
 * @export
 * @class
 * @extends {AppOptions}
 */
@app
export default class extends AppOptions {
  /**
   * 挂载装饰器工厂
   *
   * @type {TokenFactory}
   */
  @using("TokenFactory")
  tokenFactory: TokenFactory;
  /**
   * 小程序启动
   * @param res
   */
  onLaunch(res: WechatMiniprogram.App.LaunchShowOption) {
    wx.cloud.init({ env: "prod-bxryv" });
    /** 用户授权,等待后端返回标记用户的token */
    this.tokenFactory.oauth();
  }
}
