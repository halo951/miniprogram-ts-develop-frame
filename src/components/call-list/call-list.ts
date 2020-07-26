import { $loading, $message } from "@/utils/components-proxy";
import { RankService, IRank } from "@/services/RankService";
import { ComponentOptions, component, data, using } from "@/library/lib";
import { $errTip } from "@/utils/error-handler";

/**
 * Page - call-list
 * @create 2020-07-12
 * @author Halo
 *
 */
@component
export default class CallList extends ComponentOptions {
  // 导出 Component
  @data rankList: Array<any> = [];

  @data active: boolean = false;

  callback: (commond: { type: string; rankItem: IRank }) => void;

  @using("RankService") rankService: RankService;

  async open(): Promise<{ type: string; rankItem: IRank } | null> {
    $loading.show();
    try {
      let rankList = await this.rankService.ranklist();
      if (!rankList.length) {
        $message.msg("活动报名火爆进行中!");
        return null;
      }
      this.setData({ active: true, rankList });
      return new Promise(resolve => (this.callback = resolve));
    } catch (err) {
      await $errTip(err);
      return null;
    } finally {
      $loading.hide();
    }
  }
  onTap(res: WechatMiniprogram.TapEvent) {
    let { method, item } = res.currentTarget.dataset;
    this.setData({ active: false });
    if (method == "choice") return this.callback?.({ type: "call", rankItem: (item as any) as IRank });
  }
}
