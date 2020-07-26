import RedPackets, { IRedPacketsParent, IRedPacketsGettedAward } from "@/components/red-packets/red-packets";
import Message from "@/components/message/message";
import Loading, { ILoadingBody } from "@/components/loading/loading";
import ScollMessage from "@/components/scroll-message/scroll-message";
import Authorization from "@/components/authorization/authorization";
import AwardRule from "@/components/award-rule/award-rule";
import CallList from "@/components/call-list/call-list";
import InviteConfirm from "@/components/invite-confirm/invite-confirm";
import SigninValiation from "@/components/signin-valiation/signin-valiation";
import GiftAnim from "@/components/gift-anim/gift-anim";
import Tips, { RichTextNode } from "@/components/tips/tips";
import WithdrawalSuccess from "@/components/withdrawal-success/withdrawal-success";

/**
 * 导出方法
 */
export const $loading = {
  className: ".loading",
  get component(): Loading {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($loading.className)) throw "<loading> is required for current page.";
    return (p.selectComponent($loading.className) as any) as Loading;
  },
  show(options?: ILoadingBody) {
    $loading.component.show({ ...options });
  },
  hide(wait: number = 500) {
    $loading.component.clear(wait);
  }
};

/**
 * 导出方法
 */
export const $message = {
  className: ".message",
  get component(): Message {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($message.className)) throw "<message> is required for current page.";
    return (p.selectComponent($message.className) as any) as Message;
  },
  /** 弹出一条消息 */
  async msg(content: string) {
    return new Promise(resolve => {
      // 添加一条消息进队列
      $message.component.add({ type: "msg", content, callback: () => resolve() });
    });
  },
  async success(content: string) {
    return new Promise(resolve => {
      // 添加一条消息进队列
      $message.component.add({ type: "success", content, callback: () => resolve() });
    });
  }
};

/**
 * 导出方法
 */
export const $scorllMessage = {
  className: ".scroll-message",
  get component(): ScollMessage {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($scorllMessage.className)) throw "<scroll-message> is required for current page.";
    return (p.selectComponent($scorllMessage.className) as any) as ScollMessage;
  },
  /** 弹出一条消息 */
  async msg(content: string, loop?: boolean) {
    // 添加一条消息进队列
    $scorllMessage.component.add({ content, loop });
  }
};

export const $authorization = {
  className: ".authorization",
  get component(): Authorization {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($authorization.className)) throw "<authorization> is required for current page.";
    return (p.selectComponent($authorization.className) as any) as Authorization;
  },
  /**
   * 用户授权
   *
   * @author Halo
   * @date 2020-07-16
   * @param {string} content
   * @returns {Promise<WechatMiniprogram.GetUserInfoSuccessCallbackResult>}
   */
  auth(content: string): Promise<WechatMiniprogram.GetUserInfoSuccessCallbackResult> {
    return new Promise(resolve => $authorization.component.open({ content, callback: resolve }));
  }
};

export const $redPackets = {
  className: ".red-packets",
  get component(): RedPackets {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($redPackets.className)) throw "<red-packets> is required for current page.";
    return (p.selectComponent($redPackets.className) as any) as RedPackets;
  },
  async show(msg: IRedPacketsParent | IRedPacketsGettedAward) {
    if ((msg as any).identity) return await $redPackets.component.pushParent(msg as IRedPacketsParent);
    else return await $redPackets.component.pushAward(msg);
  }
};

export const $awardRule = {
  className: ".award-rule",
  get component(): AwardRule {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($awardRule.className)) throw "<award-rule> is required for current page.";
    return (p.selectComponent($awardRule.className) as any) as AwardRule;
  },
  show() {
    $awardRule.component.show();
  }
};

export const $callList = {
  className: ".call-list",

  get component(): CallList {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($callList.className)) throw "<call-list> is required for current page.";
    return (p.selectComponent($callList.className) as any) as CallList;
  },
  open() {
    return $callList.component.open();
  }
};

/**
 * 导出方法
 */
export const $inviteConfirm = {
  className: ".invite-confirm",
  get component(): InviteConfirm {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($inviteConfirm.className)) throw "<invite-confirm> is required for current page.";
    return (p.selectComponent($inviteConfirm.className) as any) as InviteConfirm;
  }
};

export const $signinValiation = {
  className: ".signin-valiation",
  get component(): SigninValiation {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($signinValiation.className)) throw "<sign-in-valiation> is required for current page.";
    return (p.selectComponent($signinValiation.className) as any) as SigninValiation;
  }
};

export const $giftAnim = {
  className: ".gift-anim",
  get component(): GiftAnim {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($giftAnim.className)) throw "<gift-anim> is required for current page.";
    return (p.selectComponent($giftAnim.className) as any) as GiftAnim;
  },
  open() {
    $giftAnim.component.open();
  }
};

export const $tips = {
  className: ".tips",
  get component(): Tips {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($tips.className)) throw "<tips> is required for current page.";
    return (p.selectComponent($tips.className) as any) as Tips;
  },
  show(type: string, nodes: string | Array<RichTextNode>) {
    return $tips.component.show(type, nodes);
  }
};

/**
 * 导出方法
 */
export const $withdrawalSuccess = {
  className: ".withdrawal-success",
  get component(): WithdrawalSuccess {
    let currentPages = getCurrentPages();
    let p = currentPages[currentPages.length - 1];
    if (!p.selectComponent($withdrawalSuccess.className)) throw "<withdrawal-success> is required for current page.";
    return (p.selectComponent($withdrawalSuccess.className) as any) as WithdrawalSuccess;
  },
  /** 弹出一条消息 */
  async tip(content: string, code: any) {
    return new Promise(resolve => {
      // 添加一条消息进队列
      $withdrawalSuccess.component.add({ code, content, callback: () => resolve() });
    });
  }
};
