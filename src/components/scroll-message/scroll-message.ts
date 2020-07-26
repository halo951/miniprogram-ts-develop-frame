import { ComponentOptions, component, data, property } from "@/library/lib";
import { api } from "@/utils/api";
export interface IScorllMessageBody {
  content?: string;
  loop?: boolean;
}
/**
 * Page - message
 * @create 2020-07-12
 * @author Halo
 *
 */
@component
export default class ScollMessage extends ComponentOptions {
  // 导出 Component
  @data active: boolean = false;
  @data anim: boolean = false;
  @data width: string = ``;
  @data duration: string = ``;
  @data content: string;
  @data paddingTop: any = wx.getMenuButtonBoundingClientRect().top;

  @property({ type: Number, value: 0 }) top: number;
  step: number = 0.75;
  query: Array<IScorllMessageBody> = [];

  add(message: IScorllMessageBody) {
    this.query.push(message);
    this.play();
  }
  play() {
    if (this.data.anim || this.query.length <= 0) return; // skip by showed
    let msg = this.query.shift();
    if (msg.loop) this.query.push(msg);
    this.setData({
      active: true,
      anim: true,
      width: `${msg.content.length}`,
      duration: msg.content.length * this.step,
      content: msg.content
    });
  }
  async next() {
    if (!this.query.length) return this.setData({ active: false }); // 关闭
    this.setData({ anim: null, width: null, duration: null });
    wx.nextTick(() => this.play()); // 下一时间段,播放下一项
  }
}
