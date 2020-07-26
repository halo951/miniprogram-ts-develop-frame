import { ComponentOptions, component, data, using } from "@/library/lib";
import { RankService } from "@/services/RankService";
import { AdService } from "@/services/AdService";

/**
 * Page - gift-anim
 * @create 2020-07-16
 * @author Halo
 * @description 砸金蛋提示
 */
@component
export default class GiftAnim extends ComponentOptions {
  // 导出 Component
  @data active: boolean = false;
  @data anim: boolean = false;
  @data callLog: Array<any> = [];
  @data count: number = -1;
  @data max: number = 10;
  @using("AdService") adSerivce: AdService;

  lifetimes = { attached() {}, ready() {}, detached() {} };

  async open() {
    this.setData({ active: true, anim: true });
    this.update();
  }
  async update() {
    let res = await this.adSerivce.count();
    this.setData({ count: res.count });
  }
  close() {
    this.setData({ active: false });
  }

  ad() {
    if (this.data.count < this.data.max) this.triggerEvent("ad", {});
  }
}
