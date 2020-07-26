import { ComponentOptions, component, data } from "@/library/lib";

export interface RichTextNode {
  name: string;
  attrs: any;
  children?: Array<RichTextNode>;
}

/**
 * Component - tips
 * @create 2020-07-19
 * @author Halo
 *
 */
@component
export default class Tips extends ComponentOptions {
  @data active: boolean = false;
  @data type: "yy" | "zl" = "yy";
  @data nodes: string | Array<RichTextNode> = "";
  callback: () => void;
  async show(type, nodes: string | Array<RichTextNode>) {
    return new Promise(resolve => {
      this.setData({ active: true, type, nodes });
      this.callback = resolve;
    });
  }
  async close() {
    this.callback?.();
    this.setData({ active: false, nodes: "" });
  }
}
