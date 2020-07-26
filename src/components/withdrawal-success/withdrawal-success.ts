import { ComponentOptions, component, data } from "@/library/lib";
export interface IMessageBody {
  code: string;
  content?: string;
  callback?: () => void;
}
/**
 * Page - message
 * @create 2020-07-12
 * @author Halo
 *
 */
@component
export default class WithdrawalSuccess extends ComponentOptions {
  // 导出 Component
  @data active: boolean = false;
  @data content: string;
  @data code: string;
  callback: () => void;
  query: Array<IMessageBody> = [];

  add(message: IMessageBody) {
    this.query.push(message);
    this.play();
  }
  play() {
    if (this.data.active || this.query.length <= 0) return; // skip by showed
    let msg = this.query.shift();
    this.setData({ active: true, content: msg.content, code: msg.code });
    this.callback = msg.callback;
  }
  async close() {
    this.setData({ active: false }); // 关闭
    try {
      await this.callback?.(); // 执行回调
    } catch (err) {
      console.error(err);
    }
    this.play(); // 检查下一个
  }
}
