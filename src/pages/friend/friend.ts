import { $errTip } from "@/utils/error-handler";
import { PageOptions, page, data, using } from "@/library/lib";
import { $message, $loading, $scorllMessage } from "@/utils/components-proxy";
import { RankService } from "@/services/RankService";
import { Time } from "@/utils/time";
import { IUserInfoModel, UserService } from "@/services/UserService";
import { logger } from "@/utils/logger";

/**
 * Page - friend
 * @create 2020-07-10
 * @author Halo
 * @description 好友页
 */
@page
export default class Friend extends PageOptions {
  // 导出page
  @data nav = [
    {
      title: "我的记录",
      val: 0
    }
  ];
  @data current: number = 0;

  @data loaded: any = null;

  @data user: any = null;
  @data root: any = null;

  @data dataset: {
    pageNum: number;
    pageSize: number;
    pages: number;
    size: number;
    total: number;
    list: Array<{
      awardInfo: number;
      awardNumber: any;
      id: number;
      issued: number;
      time: string;
      uuid: any;
    }>;
  };

  @using("RankService") rankService: RankService;

  @using("UserService") userService: UserService;

  async onShow() {
    this.data.stay = new Date().getTime();
    let valid = await this.check();
    if (!valid) return;
    // 获取用户身份,过滤对应的导航菜单
    let user: IUserInfoModel = await this.userService.get();
    this.setData({ user });
    if (!user.rankUsers) {
      await $message.msg("本期活动报名用户已满,请您选择助力好友或耐心等待下期活动.");
      this.setData({ loaded: false }); // 未参赛展示
      return wx.switchTab({ url: "/pages/index/index" });
    }
    // 根据用户身份选择展示标签
    console.log(`user.rankUsers.identity`, user.rankUsers.identity);
    this.data.nav.forEach((n, i) => {
      if (!user.rankUsers) return (n.show = false);
      if (user.rankUsers.identity == 0) return (n.show = true);
      if (user.rankUsers.identity == 1 && i != 2) return (n.show = true);
      if (user.rankUsers.identity == 2 && i == 0) return (n.show = true);
    });
    this.setData({ loaded: true, nav: this.data.nav });
    await this.loadUserData();

    if (user.rankUsers.identity > 0) {
      let root = await this.userService.findUser(user.rankUsers.root);
      this.setData({ root });
    }
    console.log(this.data.root);
    // 加载数据
    try {
      await this.reload(0);
    } catch (error) {
      console.log(error);
    }
  }

  @data stay: number = 0;
  async onHide() {
    let user = this.data.user || (await this.userService.get());
    logger.count("stay", { page: "index", in: this.data.stay, out: new Date().getTime(), user });
  }
  async loadUserData() {
    for (let i = 0; i < this.data.nav.length; i++) {
      let n = this.data.nav[i];
      if (!n.show) continue;
      let res = await this.rankService.callLog(i, { page: 1, pageSize: 0 });
      n.val = res.total;
    }
    this.setData({ nav: this.data.nav });
  }
  async check() {
    let state = await this.rankService.state(); // 加载本期排行榜数据
    let running = Time.betweenIn(new Date().getTime(), {
      before: Time.strToDate(state.lastRankStage.startTime).getTime(),
      after: Time.strToDate(state.lastRankStage.endTime).getTime()
    });
    let waiting = Time.diff(Time.strToDate(state.lastRankStage.startTime).getTime(), new Date().getTime()) > 0;
    if (!running && !waiting) {
      await $message.msg("请耐心等待下期活动开始");
      return false;
    }
    if (waiting) {
      await $message.msg("请耐心等待活动开始");
      return false;
    }
    return true;
  }
  async reload(index: number) {
    if (this.data.lock) return;
    this.data.lock = true;
    // loading...
    wx.showLoading({ title: "loading..." });
    try {
      // load
      let res = await this.rankService.callLog(this.data.current, { page: index, pageSize: 10 });
      res.list = res.list.map(d => {
        let { user, current } = this.data;
        if (!d.nodes) {
          d.scoreSum = Math.floor(d.scoreSum);
          d.moneySum = Number(parseFloat(`${d.moneySum}`).toFixed(2));
          let blue = str => `<font style="color:#22ABE3;">${str}</font>`;
          if (user.rankUsers.identity == 0) {
            if (current == 0) {
              d.nodes = `<p class='p'>您已砸蛋${blue(d.helpCount)}次,获得总共获得${blue(d.scoreSum)}积分`;
            } else {
              d.nodes = `<p class='p'>${blue(d.nickname)}已为您助力${blue(d.helpCount)}次,贡献了${blue(
                d.scoreSum
              )}积分。</p>`;
            }
          } else {
            if (current == 0) {
              d.nodes = `<p class='p'>您已为${blue(this.data.root.nickname)}助力${blue(
                d.helpCount
              )}次,总共帮TA获得${blue(d.scoreSum)}积分</p>`;
            } else {
              d.nodes = `<p class='p'>您的好友${blue(d.nickname)}为${blue(this.data.root.nickname)}助力${
                d.helpCount
              }次<br/>总共贡献了<font color='#22ABE3'>${d.scoreSum}</font>积分</p>`;
            }
          }
        }
        return d;
      });
      if (index == 0) this.setData({ dataset: res, selection: -1 });
      else {
        res.list = [...this.data.dataset.list, ...res.list];
        this.setData({ dataset: res, selection: -1 });
      }
    } catch (error) {
      console.error(error);
      $errTip(error);
    } finally {
      wx.hideLoading();
      this.data.lock = false;
    }
  }
  onTap(res: WechatMiniprogram.TapEvent) {
    let { method, index, show } = res.currentTarget.dataset;
    if (!show) return;
    this.data.dataset.list = [];
    if (method == "reload") {
      this.setData({ current: parseInt(index) });
      this.reload(1);
    }
  }
  select(res: WechatMiniprogram.TapEvent) {
    let { selection } = res.currentTarget.dataset;
    this.setData({ selection });
  }
  loadMany() {
    if (this.data.dataset.list.length < this.data.dataset.total) this.reload(this.data.dataset.pageNum + 1);
  }
}
