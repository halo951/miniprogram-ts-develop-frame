import { WithdrawalService, IWithdrawalCount } from "./../../services/WithdrawalService";
import { PageOptions, page, data, using } from "@/library/lib";
import { api } from "@/utils/api";
import { UserService } from "@/services/UserService";
import { $withdrawalSuccess } from "@/utils/components-proxy";
import { logger } from "@/utils/logger";

/**
 * Page - user
 * @create 2020-07-10
 * @author Halo
 * @description 用户 - 钱包页
 */
@page
export default class extends PageOptions {
  // 是否授权过用户信息
  @data authorized: boolean = false;

  @data user: any;

  @data count: IWithdrawalCount;

  @using("WithdrawalService") withdrawalService: WithdrawalService;

  @using("UserService") userService: UserService;

  @data stay: number = 0;

  onHide() {
    // logger.cloud({ type: "stay", page: "user", time: new Date().getTime() - this.data.stay || 0 });
  }

  // 导出page
  async onShow() {
    if (new Date().getTime() - new Date("2020/07/21 17:00:00").getTime() < 0) this.setData({ hide: true });
    else this.setData({ hide: false });
    this.data.stay = new Date().getTime();
    // 检查用户授权
    let authorized = api.validUserAuthorizate("scope.userInfo");
    if (!authorized) return;
    // 加载用户信息
    let user = null;
    user = await this.userService.get();
    if (!user) user = (await api.getUserInfo()).userInfo;
    this.setData({ authorized, user });
    this.loadCountData();
  }
  async loadCountData() {
    let data: IWithdrawalCount;
    try {
      // 加载小程序提现统计数据
      data = await this.withdrawalService.count();
    } catch (err) {
      data = { count: 0, list: [] };
    } finally {
      this.setData({ count: data });
    }
  }
  /** 提现 */
  withdrawal() {
    wx.navigateTo({ url: "/pages/withdrawal/withdrawal" });
  }
  /** 个人资料 */
  detail() {
    wx.navigateTo({ url: "/pages/detail/detail" });
  }
}
