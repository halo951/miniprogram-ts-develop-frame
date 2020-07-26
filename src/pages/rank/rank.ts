import { PageOptions, page, data, using } from "@/library/lib";
import { Time } from "@/utils/time";
import { IRankState, RankService } from "@/services/RankService";
import { UserService, IUserInfoModel } from "@/services/UserService";
import { $scorllMessage, $awardRule } from "@/utils/components-proxy";
import { $errTip } from "@/utils/error-handler";
import { logger } from "@/utils/logger";

/**
 * Page - rank
 * @create 2020-07-10
 * @author Halo
 * @description 榜单
 */
@page
export default class extends PageOptions {
  @data running: boolean = false;
  @data waiting: boolean = false;

  @using("RankService") rankService: RankService;

  @using("UserService") userService: UserService;

  timer: any = null;
  @data stay: number = 0;
  async onHide() {
    let user = this.data.user || (await this.userService.get());
    logger.count("stay", { page: "index", in: this.data.stay, out: new Date().getTime(), user });
  }
  async onShow() {
    this.data.stay = new Date().getTime();
    try {
      let state = await this.rankService.state(); // 加载本期排行榜数据
      let user = await this.userService.get(); // 加载用户数据
      // 加载用户当前参赛数据
      this.countdown();
      this.setData({ state, user });
    } catch (error) {
      return $scorllMessage.msg("系统维护中", true);
    }
    this.countdown();
    this.ranklist();
  }
  countdown() {
    if (this.timer) return;
    let cd = 0;
    this.timer = setInterval(() => {
      if (this.data.unload) clearInterval(this.timer);
      cd++;
      if (cd > 0 && cd % 60 == 0) return this.ranklist();
      if (this.data.state) {
        // 更新倒计时
        let state = this.data.state as IRankState;
        let startTime = state?.lastRankStage?.startTime || 0;
        let endTime = state?.lastRankStage.endTime || 0;
        let user = this.data.user;
        if (Time.diff(startTime, Time.now) > 0) {
          // 活动未开始
          this.setData({
            signin: user?.rankUsers ? 2 : 1,
            executing: "wait",
            cd: Time.countDown(Time.toTimestamp(startTime))
          });
        } else if (Time.diff(startTime, Time.now) <= 0 && Time.diff(endTime, Time.now) >= 0) {
          // 活动进行中
          this.setData({
            signin: user?.rankUsers ? 2 : 1,
            executing: "running",
            cd: Time.countDown(Time.toTimestamp(endTime))
          });
        } else {
          // 活动结束
          this.setData({
            signin: null,
            executing: "end",
            cd: null
          });
        }
      }
    }, 1000);
  }
  async ranklist() {
    try {
      let rankList = await this.rankService.ranklist();
      let me = rankList.find(r => r.user?.openid == this.data.user.openid);
      rankList.forEach(r => {
        if (!r.user) return;
        r.user.nickname = r.user.nickname.replace(/^(\w{,8})(.+?)/, function () {
          let arg0 = arguments[1] || "";
          let arg1 = arguments[2] || "";
          if (`${arg1}`.trim() != "") return `${arg0}...`;
          return arg0;
        });
      });
      if (!me) {
        me = {} as any;
        me.user = this.data.user;
        me.score = (this.data.user as IUserInfoModel).rankUsers.score;
      }
      this.setData({ rankList, me });
      wx.nextTick(() => {
        $scorllMessage.msg(`凯菲发福利啦！谁是最铁粉丝万元现金红包送给你`, false);
      });
    } catch (error) {
      console.log(error);
      this.setData({ errMsg: error?.errMsg });
      $errTip(error);
    }
  }
  awardRule() {
    $awardRule.show();
  }
}
