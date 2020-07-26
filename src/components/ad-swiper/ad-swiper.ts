import { ComponentOptions, component, data, property } from "@/library/lib";

/**
 * Page - ad-swiper
 * @create 2020-07-11
 * @author Halo
 *
 */
@component
export default class extends ComponentOptions {
  @data
  current: number = 1;
  @data
  integral: number = 0;

  lifetimes = {
    attached() {},
    ready() {},
    detached() {}
  };
  relations = {};
  // 导出 Component
  change(e) {
    this.setData({ current: e.detail.current + 1 });
  }
}
