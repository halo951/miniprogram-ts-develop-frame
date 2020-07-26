/** 线程下一时间段执行 */
export const thread = (cb: () => void) => setTimeout(() => cb(), 1);
/** 延时执行 */
export const delay = (time: number) => new Promise(resolve => setTimeout(() => resolve(), time || 100));
/** 随机数 */
export const random = (min: number, max: number) => parseInt(`${Math.random() * (max - min + 1) + min}`, 10);
/** 延时任务 */
export const delayTask = (cb: () => any | null | Promise<any>, interval: number, max: number) => {
  return new Promise((resolve, reject) => {
    let n = 0;
    let timer = setInterval(async () => {
      try {
        n++;
        if (n >= max) {
          clearInterval(timer);
          return reject();
        }
        let res = await cb();
        if (res) {
          clearInterval(timer);
          return resolve();
        }
      } catch (error) {
        n++;
      }
    }, interval);
  });
};

/** 循环任务 - 异步任务循环执行 */
export const loopTask = (task: () => void, time: number, reverse?: boolean) => {
  let res: { task: () => void; time: number; state: Number; run: Number; clear?: () => void } = {
    task,
    time,
    state: 1,
    run: 0
  };
  let timer: number = null;
  let wait = async () => new Promise(resolve => (timer = setTimeout(() => resolve(), res.time)));
  res.clear = () => {
    if (timer) clearTimeout(timer); // 如果任务处在等待下一时间段执行,清理计时器
    res.state = 0;
  };
  (async () => {
    while (res.state == 1) {
      try {
        if (!reverse) {
          await task();
          await wait(); // 延时
        } else {
          await delay(time); // 延时
          await wait();
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  })();
  return res;
};

export const isNull = (str: any) => {
  if (str == undefined || str == null) return true;
  if (typeof str == "string") return `${str}`.trim() == "";
  return false;
};

export const guid = (): string => {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};
