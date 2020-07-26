const AD_OPTIONS = {
  config: `https://mulit-1257020227.cos.ap-beijing.myqcloud.com/ad-miniprogram.json`,
  bannerStyle: { left: 0, top: 0, width: 300 }, // banner 广告样式
  interstitialDelay: 4000, // 插屏广告延迟加载时间
  errMsg: {
    VIDEO_NOT_DEFINED: `功能尚未开放`, // 广告未接入
    VIDEO_AD_RETRYING: `广告正在加载,请稍后重试`, // 加载失败,正在重试
    VIDEO_AD_LOAD_ERROR: `暂无合适广告(请稍后重试)`, // 重试了好多次,还是不行
    VIDEO_AD_SHOW_ERROR: `广告播放出错,请稍后重试`, // 广告播放出错
    VIDEO_AD_NOT_DEFIND: `暂无合适广告,再试试吧!` // 广告加载成功了,但是现实失败了
  }
};
const api = {
  /**
   * @description 微信自带对话框
   * @author Halo
   * @date 2019-12-25
   * @param {*} options
   * @returns
   */
  showModal(options: WechatMiniprogram.ShowModalOption | any) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: `消息`,
        content: ``,
        showCancel: false,
        confirmText: "确定",
        confirmColor: "#3CC51F",
        ...options,
        success: () => resolve(),
        fail: () => reject()
      });
    });
  },
  showToast(title: string, options?: WechatMiniprogram.ShowToastOption | any) {
    return new Promise(resolve => {
      wx.showToast({
        title,
        icon: "none",
        mask: true,
        duration: 3000,
        complete: () => resolve(),
        ...options
      });
    });
  }
};

export const AD: {
  video: string;
  enable: boolean;
  invoke: { video: (cb: (isEnded: boolean) => void) => Promise<any> };
} = {
  video: `adunit-66c8bc564045ebcf`,
  get enable(): boolean {
    return !!AD.video;
  },
  invoke: {
    async video(cb: (isEnded: boolean) => void): Promise<any> {
      console.info("invoke video ad", AD.video);
      AD.video = `adunit-c1c842a3c8f9fa14`;
      if (!AD.video) return api.showToast("功能未开放");
      let adUnitId = AD.video;
      if (!adUnitId) return api.showModal({ content: AD_OPTIONS.errMsg.VIDEO_NOT_DEFINED });
      let ad: WechatMiniprogram.RewardedVideoAd = null;
      if (!wx.createRewardedVideoAd) return api.showModal({ content: `抱歉,当前功能仅支持抖音小程序。` });
      ad = wx.createRewardedVideoAd({ adUnitId, multiton: true });
      ad.onError(res => console.error(`errMsg:`, res));
      let close = (res: { isEnded: boolean }) => {
        ad.offClose(close);
        try {
          if (cb) cb(res.isEnded);
        } catch (error) {
          console.log(`errorMessage:`, error);
        }
      };
      ad.onClose(close);
      await api.showToast(`正在加载`, { duration: 5000 });
      try {
        await ad.show();
      } catch (err) {
        console.warn("[video ad error] - show error", err);
        try {
          await ad.load();
        } catch (err1) {
          console.error("[video ad error] - retry load error", err1);
          return api.showModal({ content: AD_OPTIONS.errMsg.VIDEO_AD_RETRYING });
        }
        try {
          await ad.show();
        } catch (err2) {
          console.error("[video ad error] - retry show error", err2);
          return api.showModal({ content: AD_OPTIONS.errMsg.VIDEO_AD_SHOW_ERROR });
        }
      }
    }
  }
};
