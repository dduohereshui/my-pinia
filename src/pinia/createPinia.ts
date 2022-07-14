import { App, effectScope, markRaw, ref } from "vue";
import { SymbolPinia } from "./rootStore";
import { Pinia } from "./types";
export function createPinia() {
  const scope = effectScope(true);

  const state = scope.run(() => ref({}));

  const pinia: Pinia = markRaw({
    install(app: App) {
      (pinia as any)._a = app;
      app.provide(SymbolPinia, pinia);
      // 兼容vue2.x
      app.config.globalProperties.$pinia = pinia;
    },
    _a: null,
    state,
    _e: scope, // 用来管理这个应用的effectScope
    _s: new Map(), // 记录所有的store
  });
  return pinia;
}
