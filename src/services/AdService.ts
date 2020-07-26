import { globalUrl } from "./../config";
import { BaseService } from "./BaseServices";
import { service } from "@/library/injector";
import { proj, env } from "@/config";
import { logger } from "@/utils/logger";

/** 广告播放结果 */
export interface AdPlayResult {
  /** 广告是否播放完成 */
  isEnded: Boolean | number;
  /** 广告播放时间 */
  playTime: Number;
}
export interface IAdCheckResult {
  enable: boolean;
  adMinPlayTime: number;
  /** 今日播放次数 */
  todayPlayCount: number;
}
/**
 * 广告相关service
 *
 * @author Halo
 * @date 2020-07-10
 * @export
 * @class AdService
 * @extends {BaseService}
 */
@service
export class AdService extends BaseService {
  /* 获取广告id接口 */
  private readonly API_GET_VIDEO_ADUNITID: string = `${globalUrl}/moqi/video`;
  private readonly API_COUNT: string = `/mp/ad/getPlayCount`;
  /* 检查广可播放状态 */
  private readonly API_GET_CHECK_AD_STATE: string = `/mp/ad/check`;
  /* 提交广告播放结果 */
  private readonly API_POST_SUBMIT_AD_PLAY_RESULT: string = `/mp/ad/submit`;

  /* 缓存的激励视频广告id */
  videoAdUnitId: string = null;

  /**
   * 获取广告id
   */
  async video() {
    if (this.videoAdUnitId) return this.videoAdUnitId;
    let res = await this.request.get(this.API_GET_VIDEO_ADUNITID, { mp: proj, env });
    this.videoAdUnitId = res.data.result || null;
    return this.videoAdUnitId;
  }
  async count(): Promise<{ count: number; cd: number }> {
    try {
      let res = await this.request.get(this.API_COUNT, {});
      let result = res.data.result;
      return { count: (result.todayPlayCount as number) || 0, cd: 0 };
    } catch (err) {
      return { count: 0, cd: 0 };
    }
  }
  /**
   * 检查当前用户是否可以播放广告
   */
  async check(): Promise<IAdCheckResult> {
    try {
      let res = await this.request.get(this.API_GET_CHECK_AD_STATE, {});
      return res.data.result;
    } catch (err) {
      logger.error(`[fail] - AdService.check()`, err);
      throw err; // 此处考虑errCode,完全返回错误对象
    }
  }
  /**
   * 提交广告播放结果
   *
   * @author Halo
   * @date 2020-07-10
   * @param {AdPlayResult} result
   */
  async submit(result: AdPlayResult): Promise<{ exchangeKey: string }> {
    try {
      let res = await this.request.post(this.API_POST_SUBMIT_AD_PLAY_RESULT, {
        isended: result.isEnded,
        playTime: result.playTime
      });
      let { exchangeKey } = res.data.result;
      return exchangeKey;
    } catch (err) {
      logger.error(`[fail] - AdService.submit()`, err);
      throw err?.errMsg || this.ERR_AD_SUBMIT_FAIL;
    }
  }
  async truntable(
    exchangeKey: string
  ): Promise<{
    configRank: {
      adAwardToSorce: number;
      adLevel1: number;
      adLevel2: number;
      adLevel3: number;
      exchangeLevel1: number;
      exchangeLevel2: number;
      exchangeLevel3: number;
      id: number;
      rankAllowJoin: number;
      rankMax: number;
      stageDay: null;
      startDate: null;
      stepRefershTime: null;
    };
    money: number;
    score: number;
  }> {
    try {
      let res = await this.request.post(`/mp/turntable/execute`, { exchangeKey });
      return res.data.result;
    } catch (err) {
      throw err;
    }
  }
}
