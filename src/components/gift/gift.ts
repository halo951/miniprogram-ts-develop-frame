import { ComponentOptions, component, data } from "@/library/lib";

/**
 * Component - gift
 * @create 2020-07-17
 * @author Halo
 *
 */
@component
export default class gift extends ComponentOptions {
  // 导出 Component
  @data active: number = 1;
  @data timer: any = 0;
  lifetimes = {
    ready() {
      this.timer = setInterval(() => {
        this.setData({ active: this.data.active == 0 ? 1 : 0 });
      }, 1200);
    },
    detached() {
      clearInterval(this.timer);
    }
  };
}
