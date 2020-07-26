import { PageOptions, page, data } from "@/library/lib";
import { api } from "@/utils/api";
import { logger } from "@/utils/logger";

/**
 * Page - detail
 * @create 2020-07-17
 * @author Halo
 *
 */
@page
export default class $$detail extends PageOptions {
  @data user: any;
  // 导出page
  async onLoad() {
    let user = (await api.getUserInfo()).userInfo;
    this.setData({ user });
  }

  @data stay: number = 0;
  onShow() {
    this.data.stay = new Date().getTime();
  }
  onHide() {
    // logger.cloud({ type: "stay", page: "detail", time: new Date().getTime() - this.data.stay || 0 });
  }
}
