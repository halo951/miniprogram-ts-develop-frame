import { BaseService } from "./BaseServices";
import { service } from "@/library/lib";
import { logger } from "@/utils/logger";
/** 用户信息模型 */
export interface IUserInfoModel {
  /** 用户openid */
  openid?: string;
  /** 用户昵称 */
  nickname: string;
  /** 用户头像 */
  avatar: string;
  /** 用户性别 */
  gender: number;
  /** 用户地址 */
  addr: string;
  /** 用户资金 */
  property: number;
  /** 用户可用转盘次数 */
  truntableNumber: number;
  /** 授权日期 */
  authTime: string;
  /** 数据上次更新日期 */
  lastUpdateTime: string;
  rankUsers: {
    id: number;
    uuid: number; // userid
    identity: 0 | 1 | 2; // 用户身份
    score: number; // 当前得分
    stage: number; // 第几期活动
    root: any;
  };
  /** 注册来源 */
  registerSource: string;
}
/**
 * 用户数据处理类
 *
 * @author Halo
 * @date 2020-07-10
 * @export
 * @class UserService
 * @extends {BaseService}
 */
@service
export class UserService extends BaseService {
  /* 获取用户信息接口 */
  private readonly API_GET_USERINFO: string = `/mp/user/get`;
  /** 根据id获取用户信息 */
  private readonly API_FIND_USER: string = `/mp/user/find`;
  /* 添加或更新用户信息 */
  private readonly API_POST_USER_ADD_OR_UPDATE: string = `/mp/user/addOrUpdate`;

  /**
   * 获取用户信息
   */
  async get(): Promise<IUserInfoModel> {
    try {
      let res = await this.request.get(this.API_GET_USERINFO, {});
      return res.data.result;
    } catch (err) {
      throw err?.errMsg || this.ERR_GET_USERINFO_FAIL;
    }
  }

  /**
   * 用户授权接口
   * @description 添加或写入用户数据
   * @param {*} userDataInfo
   */
  async authorization(userinfo: WechatMiniprogram.UserInfo) {
    console.log("authorization", userinfo);
    userinfo = userinfo || <WechatMiniprogram.UserInfo>{}; // 防止空值
    try {
      // submit
      await this.request.post(this.API_POST_USER_ADD_OR_UPDATE, {
        nickname: userinfo.nickName || "***",
        avatar: userinfo.avatarUrl || "",
        gender: userinfo.gender || 0,
        addr: `${userinfo.province}-${userinfo.city}`
      });
    } catch (err) {
      // token 失效
      if (err?.errCode == 1004) await this.throwOpenidExpired();
      // 参数不全
      else if (err?.erCode == 1005) return this.throwParamIsException(err?.errMsg);
      else logger.error(err);
    }
  }
  /**
   *
   * @param id
   */
  async findUser(id: any) {
    let res = await this.request.get(this.API_FIND_USER, { id });
    return res.data.result;
  }
}
