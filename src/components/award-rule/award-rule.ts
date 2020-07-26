import { ComponentOptions, component, data } from "@/library/lib";

const CONTNET = `
1)一等奖（排行榜第1）：现金大红包8888元+神秘大礼
2)二等奖（排行榜第2）：Iphone11 64G一台+凯菲单独线下见面
3)三等奖（排行榜第3）：现金红包1314元+咖菲粉团建设资格
4)四等奖（排行榜4-10名）：现金红包520元+凯菲签名写真照
5)五等奖（排行榜11-15名）：现金红包100元
6)六等奖（排行榜16-30名）：现金红包5.2元
7)参与奖（排行榜31-50名）：现金红包1元
`
  .trim()
  .split(/\n/gim)
  .map(line => `${line}<br/>`)
  .join("");
/**
 * Page - award-rule
 * @create 2020-07-16
 * @author Halo
 *
 */
@component
export default class AwardRule extends ComponentOptions {
  @data active: boolean = false;
  @data info: string = CONTNET;
  show() {
    this.setData({ active: true });
  }
  close() {
    this.setData({ active: false });
  }
}
