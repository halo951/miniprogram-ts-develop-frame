import { $errTip } from "@/utils/error-handler";
import { ComponentOptions, component, data, using } from "@/library/lib";
import { api } from "@/utils/api";
import { RankService } from "@/services/RankService";
import { isNull } from "@/utils/utils";
import { $message } from "@/utils/components-proxy";

/**
 * Page - signin-valiation
 * @create 2020-07-10
 * @author Halo
 * @description 报名组件
 */
@component
export default class SigninValiation extends ComponentOptions {
  @data active: boolean = false;

  @data code: string = "";

  @using("RankService")
  rankService: RankService;

  open() {
    this.setData({ active: true, code: "" });
  }

  onInput(res: WechatMiniprogram.InputEvent) {
    this.data.code = res.detail.value;
  }

  async onTap(res) {
    let { method } = res.currentTarget.dataset;
    if (method == "close") return this.setData({ active: false });
    if (method == "confirm") {
      console.log(this.data.code);
      if (isNull(this.data.code)) return api.showToast(null, { title: "邀请码无效", duration: 1000 });
      try {
        console.log("ocde", this.data.code);
        await this.rankService.signin(this.data.code);
        $message.success("您成功参加了此次活动，快去体验吧！");
        this.triggerEvent("refresh");
        return this.setData({ active: false });
      } catch (err) {
        console.error(err);
        $errTip(err);
      }
    }
  }
}
