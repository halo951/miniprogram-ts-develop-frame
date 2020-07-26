const searchErrMsg = (obj: any): string => {
  for (let key in obj) {
    if (key == "errMsg") return obj[key];
    else if (typeof obj[key] == "object") return searchErrMsg(obj[key]);
  }
  return `未知错误`;
};

export const $errTip = async (err: any) => {
  let errMsg = searchErrMsg(err);
  return new Promise(resolve => {
    wx.showModal({
      title: "出错了",
      showCancel: false,
      content: errMsg,
      complete: () => resolve()
    });
  });
};
