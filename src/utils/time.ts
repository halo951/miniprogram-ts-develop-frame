/**
 * single Time handle class
 */
export const Time = {
  get now() {
    return new Date().getTime();
  },
  get second() {
    return Math.round(this.now / 1000);
  },
  get day() {
    return new Date().getDate();
  },
  strToDate(timeStr: string): Date {
    return new Date(timeStr.replace(/-/g, "/"));
  },
  /**
   * 时间戳对比
   *
   * @param t1
   * @param t2
   * @returns t1 - t2 的时间差(毫秒)
   */
  diff(t1: number | string | Date, t2: number | string | Date) {
    let time1 = 0;
    let time2 = 0;
    if (typeof t1 == "number") time1 = t1;
    else if (typeof t1 == "string") time1 = Time.strToDate(t1).getTime();
    else if (t1 instanceof Date) time1 = t1.getTime();
    if (typeof t2 == "number") time2 = t2;
    else if (typeof t2 == "string") time2 = Time.strToDate(t2).getTime();
    else if (t2 instanceof Date) time2 = t2.getTime();

    // 判断2个时间是否是 毫秒,不是的话修正
    time1 = 10 == `${time1}`.length ? time1 * 1000 : time1;
    time2 = 10 == `${time2}`.length ? time2 * 1000 : time2;
    return time1 - time2;
  },
  toTimestamp(t1: number | string | Date) {
    let time1 = 0;
    if (typeof t1 == "number") time1 = t1;
    else if (typeof t1 == "string") time1 = Time.strToDate(t1).getTime();
    else if (t1 instanceof Date) time1 = t1.getTime();
    return time1;
  },
  timestampIsSecond(time: number) {
    return 10 == `${time}`.length;
  },
  /**
   * 检查时间是否子啊某一时间段内
   * @param time
   * @param timeSlot
   */
  betweenIn(time = new Date().getTime(), { before = new Date().getTime(), after = new Date().getTime() }) {
    // 格式化时间戳
    time = 10 == `${time}`.length ? time * 1000 : time;
    before = 10 == `${before}`.length ? before * 1000 : before;
    after = 10 == `${after}`.length ? after * 1000 : after;
    return time >= before && time <= after;
  },
  /**
   * 获取毫秒格式时间戳
   */
  getTimestamp(time = new Date().getTime()) {
    // type check
    if ("number" != typeof time) {
      time = parseInt(`${time}`);
    }
    // format
    time = 10 == `${time}`.length ? time * 1000 : time;
    return time;
  },
  /**
   * 倒计时
   */
  countDown(time: number) {
    // # check timestamp
    time = this.getTimestamp(time);
    // # clac count down
    let cd = time - Time.now;
    // ? 特例处理
    if (0 > cd) {
      return "00:00:00";
    } else if (cd >= 24 * 60 * 60 * 1000 * 9999) {
      // 超过一天的折合成一天
      return "永久";
    }
    const day = Math.floor(cd / (24 * 60 * 60 * 1000));
    cd = cd - day * (24 * 60 * 60 * 1000);
    const hour = Math.floor(cd / (1000 * 60 * 60));
    cd = cd - hour * (1000 * 60 * 60);
    const minute = Math.floor(cd / (1000 * 60));
    cd = cd - minute * (1000 * 60);
    const second = Math.floor(cd / 1000);
    const hourStr = 10 <= hour ? hour : `0${hour}`;
    const minuteStr = 10 <= minute ? minute : `0${minute}`;
    const secondStr = 10 <= second ? second : `0${second}`;
    if (1 <= day) {
      // ? 超过1天
      return `${day}天 ${hourStr}:${minuteStr}:${secondStr}`;
    }
    return `${hourStr}:${minuteStr}:${secondStr}`;
  },
  /**
   * 时间格式化
   *
   * @param time
   * @param format 时间转换格式 ,参考js通用日期格式
   *
   * > @libary  http://momentjs.cn/
   */
  format(time = new Date(), format = "yyyy-MM-dd HH:mm:ss") {
    // 日期参数检查
    if ("number" == typeof time) {
      // fix timestramp to Date()
      time = new Date(this.getTimestamp(time));
    }
    // 时间转换公式
    const timeConvertFormula = {
      yyyy(date: Date) {
        // 2019
        return date.getFullYear();
      },
      YY(date: Date) {
        // 19
        return `${date.getFullYear()}`.slice(2, 4);
      },
      MM(date: Date) {
        // 08
        if (10 <= date.getMonth() + 1) {
          return date.getMonth() + 1;
        }
        return `0${date.getMonth() + 1}`;
      },
      M(date: Date) {
        // 8
        return date.getMonth() + 1;
      },
      dd(date: Date) {
        const day = date.getDate();
        if (10 > day) {
          return `0${day}`;
        }
        return day;
      },
      d(date: Date) {
        return date.getDate();
      },
      dayCN(date: Date) {
        switch (date.getDay()) {
          case 0:
            return "星期天";
          case 1:
            return "星期一";
          case 2:
            return "星期二";
          case 3:
            return "星期三";
          case 4:
            return "星期四";
          case 5:
            return "星期五";
          case 6:
            return "星期六";
          default:
            return ``;
        }
      },
      HH(date: Date) {
        const hours = date.getHours();
        if (10 > hours) {
          return `0${hours}`;
        }
        return hours;
      },
      H12(date: Date) {
        const hours = date.getHours();
        if (12 > hours) {
          return `${hours}AM`;
        }
        return `${hours - 12}PM`;
      },
      mm(date: Date) {
        const minute = date.getMinutes();
        if (10 > minute) {
          return `0${minute}`;
        }
        return minute;
      },
      ms(date: Date) {
        return date.getMinutes();
      },
      ss(date: Date) {
        const second = date.getMinutes();
        if (10 > second) {
          return `0${second}`;
        }
        return second;
      },
      S(date: Date) {
        const second = date.getMinutes();
        return second;
      }
    };
    let r = format;
    Object.keys(timeConvertFormula).forEach(key => {
      if (new RegExp(key, "g").test(r)) {
        r = r.replace(new RegExp(key, "g"), (timeConvertFormula as any)[key](time));
      }
    });
    return r;
  },
  /**
   * 传入时间相对当前时间 (多久以前,多久以后)
   * @param time
   */
  relativeToNowTime(time = new Date().getTime()) {
    // 检查并更新时间格式为毫秒格式
    time = this.getTimestamp(time);
    // 获取剩余时长
    const cd = Math.abs(time - Time.now);
    let desc = ``;
    if (0 < time - Time.now) {
      desc = `后`;
    } else {
      desc = `前`;
    }
    if (0 < Math.floor(cd / 7 / 24 / 60 / 60 / 1000)) {
      // ? 大于1周
      return `${Math.floor(cd / 7 / 24 / 60 / 60 / 1000)}周${desc}`;
    } else if (0 < Math.floor(cd / 24 / 60 / 60 / 1000)) {
      // ? 大于1天
      return `${Math.floor(cd / 24 / 60 / 60 / 1000)}天${desc}`;
    } else if (0 < Math.floor(cd / 60 / 60 / 1000)) {
      // ? 大于1小时
      return `${Math.floor(cd / 60 / 60 / 1000)}小时${desc}`;
    } else if (0 < Math.floor(cd / 60 / 1000)) {
      // ? 大于1分钟
      return `${Math.floor(cd / 60 / 1000)}分钟${desc}`;
    } else if (0 < Math.floor(cd / 1000)) {
      // ? 大于1秒
      return `${Math.floor(cd / 1000)}秒${desc}`;
    }
    return `现在`;
  },
  /**
   * 时间检查并转化为毫秒
   * @description 方法引用
   */
  toMs(time = new Date().getTime()) {
    return this.getTimestamp(time);
  }
};
// > 挂载到 [global] 对象下
global.Time = Time;
