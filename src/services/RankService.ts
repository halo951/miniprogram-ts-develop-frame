import { BaseService } from "./BaseServices";
import { service } from "@/library/injector";
/** 排名数据 */
export interface IRank {
  id: number;
  rankIndex: number;
  rankingChange: number;
  score: number;
  stage: number;
  step: number;
  user: {
    addr: string;
    authTime: string;
    avatar: string;
    gender: number;
    id: number;
    nickname: string;
    openid: string;
    page: number;
    pageSize: number;
    property: number;
  };
  uuid: number;
}
export interface IRankState {
  running: boolean;
  configRankList: {
    id: number;
    mp: string;
    rankMax: number;
    adAwardToSorce: number;
    rankAllowJoin: number;
    exchangeLevel1: number;
    exchangeLevel2: number;
    exchangeLevel3: number;
    adLevel1: number;
    adLevel2: number;
    adLevel3: number;
  };
  lastRankStage: {
    id: number;
    mp: string;
    startTime: string;
    endTime: string;
    stage: any;
    step: string;
    lastStepTime: string;
    deleted: number;
  };
}
/**
 * 排行榜相关service
 *
 * @author Halo
 * @date 2020-07-10
 * @export
 * @class RankService
 * @extends {BaseService}
 */
@service
export class RankService extends BaseService {
  /** 获取排行榜状态 */
  private readonly API_GET_RANK_STATE: string = `/rankStage/state`;
  /** 提交用户报名接口 */
  private readonly API_POST_SIGNIN: string = `/rankUsers/mp/joinMatch`;
  private readonly API_POST_JOIN: string = `/mp/rankList/signin`;
  /** 获取排行榜数据 */
  private readonly API_GET_RANKLIST: string = `/mp/rankList/get`;
  /** 其他好友助力信息 */
  private readonly API_GET_OTHER_FRIEND_CALL_LOG: string = `/rankUsers/otherFriendListByPaging`;
  /** 亲密好友助力信息 */
  private readonly API_GET_LEVEL1_CALL_LOG: string = `/rankUsers/goodFriendListByPaging`;
  /** 获取自己的calllog */
  private readonly API_GET_ME_CALL_LOG: string = `/rankUsers/getStatisticAwardInfo`;
  cache = {
    state: null
  };
  /** 获取比赛状态 */
  async state(): Promise<IRankState> {
    try {
      let res = await this.request.get(this.API_GET_RANK_STATE, {});
      this.cache.state = res.data.result;
      return res.data.result;
    } catch (err) {
      throw err;
    }
  }

  /** 参赛报名 */
  async signin(code: string) {
    code = code.toLowerCase();
    return await this.request.post(this.API_POST_SIGNIN, { code });
  }
  /** 成为助力嘉宾 */
  async join(root: any, from: any, identity: number = 0, stage: any) {
    return await this.request.post(this.API_POST_JOIN, { from, root, identity, stage });
  }

  /** 获取排行榜 */
  async ranklist(): Promise<Array<IRank>> {
    try {
      let res = await this.request.get(this.API_GET_RANKLIST, {});
      return res.data.result;
    } catch (err) {
      throw err;
    }
  }
  /**
   * 获取calllog
   * @param level
   * @param page
   */
  async callLog(
    level: number,
    page: { page: number; pageSize: number }
  ): Promise<{
    pageNum: number;
    pageSize: number;
    pages: number;
    size: number;
    total: number;
    list: Array<{
      nodes: string;
      avatar: string;
      helpCount: number; // 助力次数
      moneySum: number; // 人民币收入
      nickname: string;
      scoreSum: number; // 积分
    }>;
  }> {
    let url = "";
    let method: "get" | "post";
    switch (level) {
      case 0:
        url = this.API_GET_ME_CALL_LOG;
        break;
      case 1:
        url = this.API_GET_LEVEL1_CALL_LOG;
        break;
      case 2:
        url = this.API_GET_OTHER_FRIEND_CALL_LOG;
        break;
      default:
        break;
    }
    try {
      let res = await this.request.post(url, { delete: 0, ...page });
      return res.data.result;
    } catch (err) {
      throw err;
    }
  }
}
