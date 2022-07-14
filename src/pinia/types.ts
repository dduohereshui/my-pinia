import { App } from "vue";

export interface Pinia {
  install: (app: App) => void;
  state: any;
  _a: any;
  _s: Map<any, any>;
  _e: any;
}
