import { rankRequest } from "./../utils/request-impl";
import { TokenFactory } from "@/services/TokenFactory";
import { Request } from "wx-req";
import { api } from "@/utils/api";

/** 分页参数 */
export interface PagingOption {
  pageIndex: Number;
  pageSize: Number;
}

/**
 * service 抽象类
 */
export class BaseService {
  /** 错误描述 */
  protected readonly ERR_REQUST_FAIL: string = `请求出错`;
  protected readonly ERR_WRITE_CACHE_FAIL: string = `写入缓存数据出错`;
  protected readonly ERR_GET_USERINFO_FAIL: string = `获取用户信息出错`;
  protected readonly ERR_AD_SUBMIT_FAIL: string = `提交播放数据出错`;
  protected readonly ERR_AD_DISABLED: string = `功能未开放`; // 广告id未配置
  protected readonly ERR_GET_WITHDRAWAL_GEAR_FAIL: string = `获取提现档位出错`;
  protected readonly ERR_CREATE_WITHDWARAL_ORDER_FAIL: string = `创建提现订单出错`;
  protected readonly ERR_GET_WITHDRAWAL_LOG_FAIL: string = `获取提现记录出错`;

  /** 注入 request 引用 */
  protected request: Request = rankRequest;

  /** token过期全局处理 */
  protected async throwOpenidExpired() {
    await TokenFactory.refersh();
  }
  /** 参数异常统一处理 */
  protected throwParamIsException(errMsg?: string) {
    return api.showModal({ content: errMsg ?? "参数异常" });
  }
}
