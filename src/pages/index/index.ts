import { $errTip } from "@/utils/error-handler";
import { AdService } from "./../../services/AdService";
import { TokenFactory } from "@/services/TokenFactory";
import { delayTask, random } from "@/utils/utils";
import { IRankState } from "./../../services/RankService";
import {
  $message,
  $scorllMessage,
  $authorization,
  $signinValiation,
  $loading,
  $callList,
  $giftAnim,
  $inviteConfirm,
  $redPackets,
  $tips
} from "@/utils/components-proxy";
import { PageOptions, page, data } from "@/library/lib";
import { using } from "@/library/injector";
import { UserService, IUserInfoModel } from "@/services/UserService";
import { api } from "@/utils/api";
import { StoreService } from "@/services/StoreService";
import { RankService } from "@/services/RankService";
import { Time } from "@/utils/time";
import { AD } from "@/ad";
import { logger } from "@/utils/logger";

const ruleContent = `
活动规则
1)  粉丝可以通过邀请码参与到【凯菲悬赏令】的活动中，本期累计奖金高达2万元。
2)  本期共有50份奖励回馈给广大粉丝，参赛者通过竞争积分排行榜形式来角逐名次（幸运儿还有机会获得神秘大奖哦）。
3)  参赛者每日有10次获得积分的机会（砸金蛋），每次可获得20-100不等的积分。
4)  参赛者也可邀请朋友作为助力嘉宾来帮助自己获得更高的积分，每成功邀请一名好友后，参赛者额外获得300积分。
5)  助力嘉宾每次获得积分后，全部给予邀请TA的参赛者，积分高达3倍哦！
6)  参赛者和助力嘉宾每次获得积分后，额外还会获得现金红包。
7)  活动时间以当期时间为准
8)  若有任何疑问可咨询客服
9)  活动最终解释权归主办方所有
`;
/**
 * Page - index
 * @create 2020-07-10 00:00:00
 * @author Halo
 *
 */
@page
export default class extends PageOptions {
  @using("RankService")
  rankService: RankService;

  @using("UserService")
  userService: UserService;

  @using("StoreService")
  storeService: StoreService;

  @using("AdService")
  adService: AdService;

  @data paddingTop: number = api.paddingTop;

  @data identity: number;

  @data running: boolean = false;
  @data waiting: boolean = false;

  @data timer: any = null;

  @data rule = ruleContent.trim().split(/\n/g);
  @data state: IRankState = null;
  @data user: IUserInfoModel = null;

  /* 页面加载回调 */
  async onLoad(query: Record<string, string | undefined>) {
    await delayTask(() => TokenFactory.accessToken, 1000, 20);
    if (!TokenFactory.accessToken) return $message.msg("系统维护中");
    if (this.rankService.cache.state) this.setData({ state: this.rankService.cache }); // 如果有缓存数据,先写入缓存备用.
    await this.render();
    this.handleHelpFriend(query); // 解析入参
  }

  @data stay: number = 0;

  async onShow() {
    this.data.stay = new Date().getTime();
    await delayTask(() => TokenFactory.accessToken, 1000, 20);
    this.render();
  }

  async onHide() {
    let user = this.data.user || (await this.userService.get());
    logger.count("stay", { page: "index", in: this.data.stay, out: new Date().getTime(), user });
  }
  /**
   * 渲染
   * @param state
   */
  async render() {
    if (this.data.rending) return;
    this.data.rending = true;
    try {
      let state = await this.rankService.state(); // 加载本期排行榜数据

      let running = Time.betweenIn(new Date().getTime(), {
        before: Time.strToDate(state.lastRankStage.startTime).getTime(),
        after: Time.strToDate(state.lastRankStage.endTime).getTime()
      });

      let waiting = Time.diff(Time.strToDate(state.lastRankStage.startTime).getTime(), new Date().getTime()) > 0;

      if (waiting) $scorllMessage.msg("活动尚未开始,请耐心等待活动开始", true);
      else $scorllMessage.msg("粉丝活动火爆进行中", false);
      let user = await this.userService.get(); // 加载用户数据
      // 加载用户当前参赛数据
      this.countdown();
      this.setData({ state, user, waiting, running });
      if (user?.rankUsers?.identity == 1) {
        let root = await this.userService.findUser(user.rankUsers.root);
        this.setData({ root });
      } else if (user.rankUsers) {
        this.setData({ root: user });
      }
      if (running && user.rankUsers) {
        let { count } = await this.adService.count();
        this.setData({ count });
      }
    } catch (error) {
      console.error(error);
      $scorllMessage.msg("系统维护中", false);
    } finally {
      this.data.rending = false;
    }
  }
  countdown() {
    if (this.data.timer) return;
    this.data.timer = setInterval(() => {
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
            signin: 2,
            executing: "end",
            cd: null
          });
        }
      } else {
        // 活动结束
        this.setData({
          signin: null,
          executing: "end",
          cd: null
        });
        clearInterval(this.data.timer);
      }
    }, 1000);
  }
  onUnload() {
    this.data.unload = true;
    clearInterval(this.data.timer);
  }
  /** 处理邀请好友 */
  async handleHelpFriend(query: Record<string, string | undefined>) {
    if (!query.key || this.data.user?.rankUsers) return; // skip
    let data = await this.storeService.get(query.key);
    console.log("read:", data);
    let { method, level, inviter, root, stage } = data;
    let isAgree = await $inviteConfirm.component.confirm({ inviter, root, level });
    if (!isAgree) return;
    let userInfoRes: WechatMiniprogram.GetUserInfoSuccessCallbackResult;
    // 验证用户授权
    let valid = await api.validUserAuthorizate("scope.userInfo");
    if (!valid) {
      userInfoRes = await $authorization.auth("参与比赛需要授权使用您的用户信息,请同意！");
      if (!userInfoRes) return;
    }
    $loading.show();
    userInfoRes = await api.getUserInfo();
    try {
      await this.userService.authorization(userInfoRes.userInfo); // 添加或更新用户数据
    } catch (error) {
      $loading.hide();
      return $errTip(error);
    }
    try {
      await this.rankService.join(inviter.id, root.id, level, stage);
    } catch (error) {
      return $errTip(error);
    } finally {
      $loading.hide();
    }
    this.storeService.delete(query.key);
    // msg
    $message.success(`您成功参与此次活动,成为${root.nickname || root.nickName || "???"}的助力嘉宾`);
    await this.render();
  }

  onShareAppMessage(res: any): WechatMiniprogram.Page.ICustomShareContent {
    let { method } = res.target.dataset;
    if (method == "invite" && this.data.user.rankUsers && this.data.root) {
      let root = this.data.user;
      if (this.data.root) root = this.data.root;
      root = { ...root };
      let query: Record<string, string | undefined> = {
        method: "invite-help",
        level: this.data.user.rankUsers.identity + 1,
        inviter: this.data.user,
        root,
        stage: this.data.state.lastRankStage.id
      };
      let key = this.storeService.set(query);
      console.log("share:", query);
      let a = ["美女福利！现金大奖！help me ！！！", "万元大奖，只差一步，朋友快来帮我！！！"];
      return {
        title: a[Math.random() > 0.4 ? 1 : 0],
        path: `/pages/index/index?key=${key}`,
        imageUrl: "$assets/imgs/ad-swiper/swiper-1.png"
      };
    }
    let a = ["美女福利！现金大奖！help me ！！！", "万元大奖，只差一步，朋友快来帮我！！！"];
    return {
      title: a[Math.random() > 0.4 ? 1 : 0],
      path: "/pages/index/index",
      imageUrl: "$assets/imgs/ad-swiper/swiper-1.png"
    };
  }
  /**
   * 点击事件捕获
   * @param res
   */
  async onTap(res: WechatMiniprogram.TapEvent) {
    let { method } = res.currentTarget.dataset;
    let userInfoRes: WechatMiniprogram.GetUserInfoSuccessCallbackResult;
    // 验证用户授权
    let valid = await api.validUserAuthorizate("scope.userInfo");
    if (!valid) {
      userInfoRes = await $authorization.auth("参与比赛需要授权使用您的用户信息,请同意！");
      if (!userInfoRes) return;
    }
    userInfoRes = await api.getUserInfo();
    try {
      let user = await this.userService.get();
      this.setData({ user });
    } catch (err) {
      console.warn(err);
    }
    await this.userService.authorization(userInfoRes.userInfo); // 添加或更新用户数据
    if (method == "join") {
      if ((this.data.user as IUserInfoModel).rankUsers) return $message.msg("您已报名本期活动,请耐心等待");
      $signinValiation.component.open(); // 打开报名弹窗
    }
    if (method == "call") {
      if (this.data.user.rankUsers) return $message.msg("您已参与活动,无需重复报名！");
      // 用户选择助力对象
      if (this.data.waiting) return $message.msg("抱歉,当前没有正在进行中的活动,让您失望了-_- !");
      if (!this.data.running) return $message.msg("助力要等待活动开始后进行!");
      await $tips.show(
        "zl",
        `
      1)分享好友助力，当场获得300活动积分！<br/>
      2)当助力嘉宾每次获得积分（砸金蛋）后，所获得的积分全部给予邀请TA的参赛者，获取的积分比参赛者自己砸蛋积分多达3倍！<br/>
      3)助力嘉宾也可以邀请别人，帮助TA支持的参赛者助力<br/>
      4)被助力嘉宾邀请的助力嘉宾获得积分后，全部给予TA们共同支持的参赛者，积分同样高达3倍哦！<br/>
      `.trim()
      );
      let r = await $callList.open(); // 打开助力选择
      if (!r) return;
      let q = await $inviteConfirm.component.confirm({
        inviter: r.rankItem.user as any,
        root: r.rankItem.user as any,
        level: 1
      });
      if (!q) return;
      try {
        console.log(this.data.state);
        await this.rankService.join(r.rankItem.user.id, r.rankItem.user.id, 1, this.data.state.lastRankStage.id);
        $message.success(`您已成为${r.rankItem.user.nickname} 的助力嘉宾`);
      } catch (e) {
        return $errTip(e);
      }
    }
    if (method == "ad") {
      if (this.data.executing != "running") return $message.msg("当前不在活动进行时间内.请您留意最新活动消息");
      // 弹出砸蛋界面
      $giftAnim.open();
    }
  }
  /**
   * 播放广告
   */
  async ad() {
    // 播放广告
    let play = null;
    try {
      play = await this.adService.check();
    } catch (error) {
      return $errTip(error);
    }
    if (!play.enable) return $scorllMessage.msg(`您点击过快,请${play.adMinPlayTime}秒后重试!`);
    let startTime = Time.now;
    AD.invoke.video(isEnded => {
      if (!isEnded) return $message.msg("您没有看完广告,无法获得奖励");
      $loading.show();
      logger.count("ad", { page: "index", startTime, endTime: Time.now, isEnded });
      this.adService
        .submit({ isEnded: isEnded ? 1 : 0, playTime: Time.now - startTime })
        .then(async res => {
          if (isEnded) {
            $loading.show({ word: "正在抽奖..." });
            let award = await this.adService.truntable(res.exchangeKey);
            console.log("award", award, this.data.user.identity);
            if (!this.data.user?.rankUsers) {
              try {
                let user = await this.userService.get();
                this.setData({ user });
              } catch (err) {
                console.warn(err);
              }
            }
            if (award.score) award.score = Math.floor(award.score);
            if (award.money) award.money = Number(award.money.toFixed(2));
            // 弹出奖励动画
            switch (this.data.user.rankUsers?.identity) {
              case 0: // 弹出获得积分或奖励
                if (award.score) $redPackets.show({ content: `恭喜获得${award.score}积分` });
                break;
              case 1: // 弹出给参赛者加多少奖励
              case 2:
                if (award.score) {
                  $redPackets.show({
                    identity: "root",
                    target: this.data.root,
                    content: `您为${this.data.root.nickname}贡献${award.score}(*3)积分`
                  });
                }
                break;
              default:
                break;
            }
          }
          $giftAnim.component.update();
          this.render();
        })
        .catch(e => {
          console.error(e);
          $errTip(e);
        })
        .finally(() => {
          $loading.hide();
        });
    });
  }
  /**
   * 切换tab页
   * @param res
   */
  onSwitch(res: WechatMiniprogram.TapEvent) {
    let { target } = res.currentTarget.dataset;
    wx.switchTab({ url: `/pages/${target}/${target}` });
  }
  async toSignin() {
    await $tips.show(
      "yy",
      `
    1)本期报名人数已满，如想参与活动，请预约报名下一期活动<br/>
    2)预约报名方式，请前往【咖菲真爱卡】小程序中，领取真爱卡<br/>
    3)联系客服获得报名方式
    `.trim()
    );

    wx.navigateToMiniProgram({
      /** 要打开的小程序 appId */
      appId: "wxd3234d4c8d4fc828",
      /** 接口调用失败的回调函数 */
      fail: () => $message.msg("打开报名小程序失败,请搜索‘咖菲粉真爱卡’进入")
    });
  }
}
