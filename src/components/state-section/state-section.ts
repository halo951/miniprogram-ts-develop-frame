import { ComponentOptions, component, data } from "@/library/lib";

@component
export default class StateSection extends ComponentOptions {
  @data active: boolean = false;
  @data state: any = null;
  @data anim: string = "hide";
  @data timer: any = null;

  lifetimes = {
    // 生命周期函数 - 组件初始化完成后执行
    attached() {
      // 初次渲染
      this.clear();
    },
    detached() {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
      }
    }
  };

  observers = {
    state(state) {
      let render = {};
      if (state) {
        render = { anim: "fade-in-down" };
      } else if (this.data.state && !state) {
        render = { anim: "fade-out-down" };
      } else {
        render = { anim: "hide" };
      }
      this.setData(render);
    }
  };

  show(state, disableTimer = false) {
    // 更新渲染
    this.setData({ state });
    // 清理旧的计时器
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
    if (!disableTimer || this.data.timer) {
      // # 创建 timer 倒计时
      this.data.timer = setTimeout(() => {
        clearTimeout(this.data.timer);
        this.data.timer = null;
        this.clear();
      }, 3000);
    }
  }
  clear() {
    this.setData({ state: null });
  }
}
