import { Time } from "./time";

let log = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null;

/** 日志上报工具 */
export const logger = {
  info(...args: any) {
    console.info(arguments);
    log?.info.apply(log, Object.values(arguments));
  },
  warn(...args: any) {
    console.info(arguments);
    log?.warn.apply(log, Object.values(arguments));
  },
  error(...args: any) {
    console.info(arguments);
    log?.error.apply(log, Object.values(arguments));
  },
  setFilterMsg(msg: any) {
    // 从基础库2.7.3开始支持
    if (!log || !log.setFilterMsg) return;
    if (typeof msg !== "string") return;
    log.setFilterMsg(msg);
  },
  addFilterMsg(msg: any) {
    // 从基础库2.8.1开始支持
    if (!log || !log.addFilterMsg) return;
    if (typeof msg !== "string") return;
    console.log("add filter", log.addFilterMsg);
    log.addFilterMsg(msg);
  },
  cloud(data: any) {
    let db = wx.cloud.database();
    db.collection("count").add({ data: { data, time: Time.format(new Date(), "yyyy-MM-dd HH:mm:ss") } });
  },
  count(type: string, data: any) {
    let db = wx.cloud.database();
    db.collection("log").add({ data: { type, data } });
  }
};
