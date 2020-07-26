import { IUserInfoModel } from "./../../services/UserService";
import { ComponentOptions, component, data } from "@/library/lib";

/**
 * Page - invite-confirm
 * @create 2020-07-10
 * @author Halo
 *
 */
@component
export default class InviteConfirm extends ComponentOptions {
  // 导出 Component
  @data active: boolean;
  @data inviter: IUserInfoModel;
  @data root: IUserInfoModel;
  @data level: number;
  @data callback: (result: boolean) => void;
  /**
   * 打开确认弹窗
   * @param invite
   * @param level
   */
  confirm(options: { inviter: IUserInfoModel; root: IUserInfoModel; level: number }): Promise<boolean> {
    let { inviter, root, level } = options;
    return new Promise(resolve => this.setData({ active: true, inviter, root, level, callback: resolve }));
  }
  /**
   * 点击事件
   * @param res
   */
  onTap(res: WechatMiniprogram.TapEvent) {
    let { method } = res.currentTarget.dataset;
    this.data.callback?.(method == "confirm"); // callback
    this.setData({ active: false, callback: null });
  }
}
