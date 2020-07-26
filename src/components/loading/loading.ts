import { ComponentOptions, component, data, property } from "@/library/lib";
import { delay } from "@/utils/utils";

export interface ILoadingBody {
  sleep?: number;
  show?: number;
  mask?: boolean;
  word?: string;
}

/**
 * loading
 *
 * @author Halo
 * @date 2020-07-16
 * @export
 * @class Loading
 * @extends {ComponentOptions}
 */
@component
export default class Loading extends ComponentOptions {
  @data active: boolean = false;
  @data timer: any = null;
  @data delayTimer: any = null;
  @data anim: string = "";
  @data word: string | string[] = "loading".split("");
  @data lock: boolean = false;
  @data count: number = 0;
  @property([Boolean]) mask: boolean = true;

  /**
   * @description 打开loading
   * @date 2019-12-06
   * @param {number} showTime 指定显示时间,不指定一直显示到用户执行clear,显示则
   */
  async show(options: ILoadingBody) {
    options = { sleep: 0, show: null, mask: true, word: "loading", ...options };
    let { sleep, show, mask, word } = options;
    this.data.count++;
    if (sleep) await delay(sleep);
    if (this.data.count > 0) {
      this.setData({ active: true, anim: "", mask, word: this.data.lock ? this.data.word : word });
      if (show) {
        await delay(show);
        await this.clear();
      }
    } else {
      await this.clear();
    }
  }
  locker(state) {
    this.data.lock = state;
  }
  /**
   * @description 清理loading
   * @date 2019-12-06
   */
  async clear(wait = 500) {
    this.data.count--;
    if (this.data.count > 0) return;
    this.data.count = 0;
    await delay(wait);
    this.setData({ anim: "loading-fade-out" });
  }
  /**
   * 强制关闭
   */
  forceClose() {
    this.setData({ anim: "", active: false, count: 0 });
  }
  onAnimationEnd() {
    this.setData({ anim: "", active: false });
  }
}
