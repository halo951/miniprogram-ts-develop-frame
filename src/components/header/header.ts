import { ComponentOptions, component, data, property } from "@/library/lib";
import { api } from "@/utils/api";

/**
 * Component - header
 * @create 2020-07-17
 * @author Halo
 *
 */
@component
export default class header extends ComponentOptions {
  // 导出 Component
  @data paddingTop: number = api.statusBarHeight;

  @property([String]) title: string;

  @property([String, Number]) to: string | number;

  @property([String]) method: "navigateBack" | "redirectTo" | "reLaunch" | "switchTab";

  back() {
    if (this.data.method == "navigateBack") return wx.navigateBack({ delta: this.data.to });
    else wx[this.data.method]?.({ url: this.data.to });
  }
}
