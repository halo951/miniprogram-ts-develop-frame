/**
 * 基于 redirect to 的 pages
 */
export const pages = {
  visitTime: 0,
  get current() {
    return getCurrentPages()[getCurrentPages().length - 1];
  },
  get route() {
    let page = getCurrentPages()[0];
    return page.__route__.split("?")[0];
  },
  get short() {
    let route = this.route;
    return route.split("/").pop();
  },
  is(route: string | RegExp) {
    if (typeof route == "string" && this.route.indexOf(route) !== -1) return true;
    if (route instanceof RegExp && route.test(this.route)) return true;
    return false;
  },
  async reload() {
    if (this.current.onload) await this.current.onload({ ...this.current.options });
  },
  cleanUrl(url: string) {
    if (!url) return ``;
    return url.replace(/^\//, "").split("?")[0];
  },
  component(className: string) {
    return pages.current.selectComponent(className);
  }
};
global.pages = pages;
