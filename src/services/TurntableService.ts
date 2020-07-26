import { BaseService, PagingOption } from "./BaseServices";
import { service } from "@/library/lib";
/**
 * 转盘 数据处理类
 *
 * @author Halo
 * @date 2020-07-10
 * @export
 * @class TurntableService
 * @extends {BaseService}
 */
@service
export class TurntableService extends BaseService {
  /** 获取用户转盘抽奖记录 */
  private readonly API_GET_MP_TURNTABLE_LOG: string = `/mp/turntable/log`;
  /** 提交用户抽奖信息 */
  private readonly API_POST_SUBMIT_TURNTABLE: string = `/mp/turntable/execute`;
  /** 获取转盘奖励列表 */
  private readonly API_GET_TURNTABLE_AWARDS: string = `/mp/turntable/list/enable`;

  /** 获取用户提现记录 */
  async logs(pageOptions: PagingOption) {
    return await this.request.get(this.API_GET_MP_TURNTABLE_LOG, { ...pageOptions, delete: 0 });
  }
  /** 抽奖 */
  async turntable() {
    return await this.request.post(this.API_POST_SUBMIT_TURNTABLE, {});
  }
  /** 获取前端可用奖励列表 */
  async awards() {
    return await this.request.get(this.API_GET_TURNTABLE_AWARDS, {});
  }
}
