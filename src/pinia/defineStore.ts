import {
  computed,
  effectScope,
  getCurrentInstance,
  inject,
  reactive,
  toRefs,
} from "vue";
import { SymbolPinia } from "./rootStore";
import { Pinia } from "./types";
interface XX {
  num: any;
}
export function defineStore(idOrOptions: any, setup: any) {
  let id: string;
  let options: any;
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
  }

  function useStore() {
    // 这个函数只能在组件中使用
    const currentInstance = getCurrentInstance();
    const pinia = currentInstance && (inject(SymbolPinia) as Pinia);
    if (pinia) {
      if (!pinia?._s.has(id)) {
        // 该store没有注册过
        createOptionsStore(id, options, pinia);
      } else {
      }

      const store = pinia._s.get(id);

      return store;
    }
  }

  return useStore;
}
/**
 *
 * @param id store的id
 * @param options store选项
 * @param pinia pinia
 */
function createOptionsStore(id: string, options: any, pinia: Pinia) {
  const { state, getters, actions } = options;
  const store = reactive({});
  let scope;
  function setup() {
    pinia.state.value[id] = state ? state() : {};
    // 这里localState 已经是响应式的了，但是内部的值还是普通的对象，所以要用toRefs
    const localState = toRefs(pinia.state.value[id]);

    return Object.assign(
      localState,
      actions,
      Object.keys(getters || {}).reduce((computedGetters: any, name: any) => {
        computedGetters[name] = computed(() => {
          return getters[name].call(store, store);
        });
        return computedGetters;
      }, {})
    );
  }

  const setupStore = pinia._e.run(() => {
    // pinia上的scope可以停止所有的store，
    // 这个scope是store内部独有的effectScope
    scope = effectScope();
    return scope.run(() => setup());
  });

  function wrapAction(actionName: string, action: any): any {
    return function (...args: any[]) {
      // 后续可能会做异步调用
      let result = action.apply(store, args);
      return result;
    };
  }

  // 处理actions的this指向
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (typeof prop === "function") {
      // 对action做操作
      setupStore[key] = wrapAction(key, prop);
    }
  }
  Object.assign(store, setupStore);

  pinia._s.set(id, store);
}
