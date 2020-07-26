import { BaseService } from "./BaseServices";
import { service } from "@/library/injector";
import { logger } from "@/utils/logger";
import { guid } from "@/utils/utils";

/**
 * 数据存储,传递相关service
 */
@service
export class StoreService extends BaseService {
  /* 读取接口 */
  private readonly API_GET: string = `/mp/cache/get`;
  /* 写入接口 */
  private readonly API_SET: string = `/mp/cache/set`;
  /* 删除接口 */
  private readonly API_DELETE: string = `/mp/cache/delete`;

  /**
   * 获取数据
   *
   * @author Halo
   * @date 2020-07-10
   * @param {string} key
   */
  async get(key: string): Promise<any> {
    if (!key) throw `invalid key`; // 抛出key无效异常
    try {
      let res = await this.request.get(this.API_GET, { key });
      let data = res.data.result;
      if (!data) return null;
      // parse to object
      if (typeof data == "string") data = JSON.parse(data);
      return data;
    } catch (err) {
      logger.error(`[fail] - StoreService.get()`, err);
      throw err?.errMsg || this.ERR_REQUST_FAIL;
    }
  }
  /**
   * 写入缓存数据
   *
   * @author Halo
   * @date 2020-07-10
   * @param {*} data
   * @returns {Promise<string>}
   */
  set(data: any): string {
    try {
      let key = guid();
      this.request.post(this.API_SET, { key, data: JSON.stringify(data) });
      return key;
    } catch (err) {
      logger.error(`[fail] - StoreService.set()`, err);
      throw err?.errMsg || this.ERR_WRITE_CACHE_FAIL;
    }
  }
  /**
   * 异步删除已使用的key
   * @param key
   */
  async delete(key: string): Promise<any> {
    if (!key) return; // skip by null key
    this.request.post(this.API_DELETE, { key });
  }
}
