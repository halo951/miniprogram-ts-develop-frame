import { ComponentOptions, component, data } from "@/library/lib";
import { logger } from "@/utils/logger";
export interface IAuthorizationBody {
  content?: string;
  callback?: (res: WechatMiniprogram.GetUserInfoSuccessCallbackResult) => void;
}
/**
 * component - authorization
 * @create 2020-07-12
 * @author Halo
 *
 */
@component
export default class Authorization extends ComponentOptions {
  // 导出 Component
  @data active: boolean = false;
  @data content: string;
  callback: (res: WechatMiniprogram.GetUserInfoSuccessCallbackResult) => void;

  open(option: IAuthorizationBody) {
    let { content, callback } = option;
    this.setData({ active: true, content });
    this.callback = callback;
  }
  async close() {
    this.setData({ active: false }); // 关闭
    logger.count("authorization", { auth: false, res: null });
    try {
      await this.callback?.(null); // 执行回调
    } catch (err) {
      console.error(err);
    }
  }
  async auth(res) {
    this.setData({ active: false }); // 关闭
    logger.count("authorization", { auth: true, res });
    try {
      await this.callback?.(res); // 执行回调
    } catch (err) {
      console.error(err);
    }
  }
}
