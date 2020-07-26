import { ComponentOptions, component, data } from "@/library/lib";
import { IUserInfoModel } from "@/services/UserService";
import { api } from "@/utils/api";
/**
 * 自己获得奖励
 */
export interface IRedPacketsGettedAward {
  content: string;
}
/**
 * 给上级用户提供奖励
 */
export interface IRedPacketsParent {
  identity: "friend" | "root";
  target: IUserInfoModel;
  content: string;
}

/**
 * Page - red-packets
 * @create 2020-07-16
 * @author Halo
 *
 */
@component
export default class RedPackets extends ComponentOptions {
  queue: Array<any> = [];

  @data active: boolean;
  @data user: IUserInfoModel;
  @data target: IUserInfoModel;
  @data identity: "firend" | "root" | "me";
  @data type: "award" | "parend";

  async getUserInfo() {
    let res = await api.getUserInfo();
    let user = res.userInfo;
    (user as any).avatar = user.avatarUrl;
    return user;
  }
  async pushAward(msg: IRedPacketsGettedAward) {
    this.queue.push({
      type: "award",
      user: await this.getUserInfo(),
      target: null,
      identity: "me",
      content: msg.content
    });
    this.play();
  }
  async pushParent(msg: IRedPacketsParent) {
    let { identity, target, content } = msg;
    this.queue.push({ type: "parent", user: await this.getUserInfo(), target, identity, content });
    this.play();
  }
  play() {
    if (this.data.active) return;
    let msg = this.queue.shift();
    this.setData({ active: true, ...msg });
  }
  next() {
    this.setData({ active: false });
    if (this.queue.length > 0) this.play();
  }
}
