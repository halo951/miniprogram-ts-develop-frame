import { WithdrawalService, IWithdrawalCount } from "./../../services/WithdrawalService";
import { PageOptions, page, data, using } from "@/library/lib";
import { api } from "@/utils/api";
import { $loading, $message, $withdrawalSuccess } from "@/utils/components-proxy";
import { UserService } from "@/services/UserService";
import { $errTip } from "@/utils/error-handler";
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

  @data current: number = -1;

  @using("WithdrawalService") withdrawalService: WithdrawalService;
  @using("UserService") userService: UserService;

  @data gear: Array<any> = [];
  @data logs: Array<any> = [];

  @data logPageOption: { page: number; pageIndex: number; pageSize: number; total?: number } = {
    page: 1,
    pageIndex: 1,
    pageSize: 5,
    total: null
  };
  @data stay: number = 0;

  onHide() {
    // logger.cloud({ type: "stay", page: "withdrawal", time: new Date().getTime() - this.data.stay || 0 });
  }

  // 导出page
  async onShow() {
    this.data.stay = new Date().getTime();
  }
  // 导出page
  async onLoad() {
    this.pull();
  }
  async pull() {
    wx.showLoading({ title: "loading" });
    this.setData({ gear: [], logs: [], logPageOption: { page: 1, pageIndex: 1, pageSize: 5, total: 0 } });
    let user = await this.userService.get();
    this.setData({ user });
    // 加载提现档位
    let gear = await this.withdrawalService.gear();
    this.setData({ gear });
    wx.hideLoading();
    this.log();
  }
  async log() {
    // 加载提现记录
    let logs = await this.withdrawalService.logs(this.data.logPageOption);
    this.setData({
      logs: [...this.data.logs, ...logs.logs]
    });
    this.data.logPageOption.total = logs.total;
    if (this.data.logs.length < this.data.logPageOption.total) {
      this.data.logPageOption.page += 1;
      this.data.logPageOption.pageIndex += 1;
      this.log();
    }
  }
  change(res: WechatMiniprogram.TapEvent) {
    let { index } = res.currentTarget.dataset;
    this.setData({ current: index });
  }
  /** 提现 */
  async withdrawal() {
    if (this.data.current < 0) return $message.msg("请选择提现档位");
    let gear = this.data.gear[this.data.current];
    if (gear.times > (gear.count || 0)) {
      try {
        let code = await this.withdrawalService.order(gear.id);
        $withdrawalSuccess.tip("已发起申请,请点击首页中的联系客服兑换!", code);
      } catch (err) {
        console.error(err);
        $errTip(err);
      } finally {
        this.pull();
      }
    }
  }

  /** 个人资料 */
  detail() {
    wx.navigateTo({ url: "/pages/detail/detail" });
  }
}
