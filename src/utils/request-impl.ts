import { Request, ResponseType, RequestMethod, RequestOption, ResponseOptions } from "wx-req";
import { baseUrl, proj, env, appid, globalUrl } from "@/config";
import { TokenFactory } from "@/services/TokenFactory";

/**
 * 返回默认客户端
 * @description 用于不使用 oauth 授权接口
 */
export const defaultRequest = new Request({
  baseUrl: globalUrl,
  responseType: ResponseType.JSON,
  method: RequestMethod.GET,
  headers: { "content-type": "application/json" },
  transformRequest: [
    (options: RequestOption) => {
      // format request url
      options.url = options.url
        .replace(/%[a-z|A-Z|0-9]{2}/g, "")
        .replace(/\r|\n|\t/gim, "")
        .replace(/\/\//gim, "/")
        .replace(":/", "://");
      // push config
      options.data = { mp: `${proj}-${env}-${appid}`, ...options.data };
    }
  ],
  transformResponse: [
    (response: ResponseOptions) => {
      // 捕获上层异常
      if (response.statusCode > 300 || !response.data?.success) return Promise.reject(response);
    }
  ]
});

/**
 * 返回封装了 accessToken的request
 */
export const rankRequest = new Request({
  baseUrl,
  responseType: ResponseType.JSON,
  method: RequestMethod.GET,
  headers: { "content-type": "application/json" },
  transformRequest: [
    (options: RequestOption) => {
      // format request url
      options.url = options.url
        .replace(/%[a-z|A-Z|0-9]{2}/g, "")
        .replace(/\r|\n|\t/gim, "")
        .replace(/\/\//gim, "/")
        .replace(":/", "://");
      // push config
      options.data = { mp: `${proj}-${env}-${appid}`, ...options.data };
    },
    async (options: RequestOption) => {
      // add token to headers
      // if (!TokenFactory.accessToken) await TokenFactory.refersh();
      options.headers = { ...options.headers, Authorization: `Bearer ${TokenFactory.accessToken}` };
    }
  ],
  transformResponse: [
    (response: ResponseOptions) => {
      console.log(`resp:`, response);
      // 捕获上层异常
      if (response.statusCode > 300 || !response.data?.success) {
        // 删除无效token
        if (response.data?.errCode == 1004) delete TokenFactory.accessToken;
        return Promise.reject(response);
      }
    }
  ]
});
