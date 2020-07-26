import { ComponentOptions, component, property, data } from "@/library/lib";
import { api } from "@/utils/api";

/**
 * Page - user-avatar
 * @create 2020-07-10
 * @author Halo
 *
 */
@component
export default class UserAvatar extends ComponentOptions {
  @property({ type: Boolean, value: false })
  border: boolean;
  @property({ type: Boolean, value: false })
  mask: boolean;
  @property({ type: String, value: "58rpx" })
  size: string;
  @property({ type: Boolean, value: false })
  single: boolean;
  @property({ type: String })
  avatar: string;
  @property({ type: String })
  bg: string;
  @data user: any = null;

  lifetimes = {
    async ready() {
      if (this.data.single) {
        let r = await api.validUserAuthorizate("scope.userInfo");
        if (r) this.setData({ user: (await api.getUserInfo()).userInfo });
      }
    }
  };
}
