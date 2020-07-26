import { IUserInfoModel } from "./UserService";
import { BaseService, PagingOption } from "./BaseServices";
import { service } from "@/library/injector";
import { logger } from "@/utils/logger";

/** 提现档位格式 */
export interface WithdrawalGear {
  id: number;
  times: number;
  val: number;
}
/** 提现记录格式 */
export interface WithdrawalLog {}

/** 提现统计数据 */
export interface IWithdrawalCount {
  count: number; // 总计
  list: Array<{
    user: IUserInfoModel;
    totalCall: number; // 助力人数
    totalMoney: number; // 总计提现金额
    lastTime: string; // 最后一次提现时间
  }>;
}

/**
 * 提现相关service
 *
 * @author Halo
 * @date 2020-07-10
 * @export
 * @class WithdrawalService
 * @extends {BaseService}
 */
@service
export class WithdrawalService extends BaseService {
  /* 获取提现档位 */
  private readonly API_GET_GEAR: string = `/mp/withdrawal/gear`;
  /* 创建提现订单 */
  private readonly API_POST_CREATE_ORDER: string = `/mp/withdrawal/create-order`;
  /* 获取提现记录 */
  private readonly API_GET_LOG: string = `/mp/withdrawal/log`;
  /** 获取提现统计数据 */
  private readonly API_GET_COUNT: string = `/mp/withdrawal/getTotalMoney`;

  /**
   * 获取提现档位
   *
   * @author Halo
   * @date 2020-07-10
   */
  async gear(): Promise<Array<WithdrawalGear>> {
    try {
      let res = await this.request.get(this.API_GET_GEAR, { delete: 0 });
      return res.data.result;
    } catch (err) {
      logger.error(`[fail] - WithdrawalService.gear()`, err);
      throw { errMsg: err?.errMsg || this.ERR_GET_WITHDRAWAL_GEAR_FAIL };
    }
  }
  /**
   * 创建提现订单
   *
   * @author Halo
   * @date 2020-07-10
   * @param {*} id 订单档位
   * @description 订单创建成功后,需要执行刷新用户数据和刷新订单记录方法
   */
  async order(id: any): Promise<any> {
    try {
      let res = await this.request.post(`${this.API_POST_CREATE_ORDER}?id=${id}`, { id });
      return res.data.result;
    } catch (err) {
      logger.error(`[fail] - WithdrawalService.order()`, err);
      throw err?.data || { errMsg: this.ERR_CREATE_WITHDWARAL_ORDER_FAIL };
    }
  }
  /**
   * 分页获取提现记录
   * @param option
   */
  async logs(option: any): Promise<{ total: Number; logs: Array<WithdrawalLog> }> {
    try {
      let res = await this.request.get(this.API_GET_LOG, { ...option, delete: 0 });
      let { total, list } = res.data.result;
      return { total, logs: list };
    } catch (err) {
      logger.error(`[fail] - WithdrawalService.logs()`, err);
      throw err?.errMsg || this.ERR_GET_WITHDRAWAL_LOG_FAIL;
    }
  }
  /**
   * 获取当前小程序提现统计数据
   */
  async count(): Promise<IWithdrawalCount> {
    let res = await this.request.post(this.API_GET_COUNT, { page: 1, pageSize: 5 });
    let result: IWithdrawalCount = { count: 0, list: [] };
    result.list = res.data.result.list;
    if (res.data.result.count) result.count = res.data.result.count;
    else result.count = (res.data.result.list as Array<any>).reduce((last, current) => last + current.totalMoeny, 0);
    result.list = result.list.filter(item => {
      return (item.totalMoney || (item as any).totalMoeny) > 0;
    });
    return result;
  }
}
