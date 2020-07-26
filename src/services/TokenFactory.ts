import { defaultRequest } from "./../utils/request-impl";
import { logger } from "@/utils/logger";
import { delayTask } from "@/utils/utils";
import { Request } from "wx-req";
import { service } from "@/library/lib";
/**
 * 小程序用户登录态处理工厂类
 *
 * @author Halo
 * @date 2020-07-10
 * @export
 * @class TokenFactory
 */
@service
export class TokenFactory {
  /** jwt - 当失效或数据状态刷新时,重新获取 */
  public static accessToken: String = null;

  /** 私有锁 */
  private static lock: Boolean = false;
  /**
   * 刷新token
   */
  public static async refersh() {
    if (!this.lock) {
      this.lock = true; // add a lock
      delete TokenFactory.accessToken; // destory old token
      // exec oauth
      try {
        await new TokenFactory().oauth();
      } finally {
        this.lock = false;
      }
    } else {
      await delayTask(() => !this.lock, 100, 1000);
    }
    // check result
    if (TokenFactory.accessToken) return;
    else throw `token is expired`;
  }

  /* 用户登录接口 */
  private readonly API_OAUTH: string = `/rank/mp/oauth`;

  /** 注入默认请求库引用 - 忽略accessToken检查 */
  defaultRequst: Request = defaultRequest;

  /**
   * oauth 异常处理
   * @param res
   */
  private throwOauthError(res: any) {
    logger.addFilterMsg(`catch wx.login() fail.`);
    logger.error(res);
    wx.showToast({ title: "网络环境异常!", icon: "none", duration: 10 * 1000, mask: true });
  }
  /**
   * 执行小程序登录,获取code
   */
  private async login(): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res: WechatMiniprogram.LoginSuccessCallbackResult) => resolve(res.code),
        fail: (res: WechatMiniprogram.GeneralCallbackResult) => reject(this.throwOauthError(res))
      });
    });
  }

  async oauth() {
    // get code with login()
    let code = await this.login();
    try {
      let res = await this.defaultRequst.get(this.API_OAUTH, { code });
      let { accessToken } = res.data?.result || {};
      if (!accessToken) throw `请求成功,但未获取到 'accessToken' `;
      TokenFactory.accessToken = accessToken;
    } catch (err) {
      console.error(err);
      this.throwOauthError(err);
    }
  }
}
