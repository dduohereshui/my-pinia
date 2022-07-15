function isObject(value: any) {
  return value !== null && typeof value === "object";
}
import {
  computed,
  effectScope,
  getCurrentInstance,
  inject,
  isRef,
  reactive,
  toRefs,
} from "vue";
import { addSubscription, triggerSubscription } from "./pubsub";
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
  let isSetupStore = typeof setup === "function" ? true : false;

  function useStore() {
    // 这个函数只能在组件中使用
    const currentInstance = getCurrentInstance();
    const pinia = currentInstance && (inject(SymbolPinia) as Pinia);
    if (pinia) {
      if (!pinia?._s.has(id)) {
        // 该store没有注册过
        if (isSetupStore) {
          createSetupStore(id, setup, pinia);
        } else {
          // 普通的store
          createOptionsStore(id, options, pinia);
        }
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
  const store = createSetupStore(id, setup, pinia) as any;
  store.$reset = function () {
    const newState = state ? state() : {};
    store.$patch(($state: any) => {
      Object.assign($state, newState);
    });
  };
  return store;
}

function createSetupStore(id: string, setup: any, pinia: Pinia) {
  let scope;
  const setupStore = pinia._e.run(() => {
    // pinia上的scope可以停止所有的store，
    // 这个scope是store内部独有的effectScope
    scope = effectScope();
    return scope.run(() => setup());
  });
  function mergeReactiveObject(target: any, partialState: any) {
    for (const key in partialState) {
      if (!Object.prototype.hasOwnProperty.call(partialState, key)) continue;
      const oldValue = target[key];
      const newValue = partialState[key];
      if (isObject(oldValue) && isObject(newValue) && isRef(newValue)) {
        target[key] = mergeReactiveObject(oldValue, newValue);
      } else {
        target[key] = newValue;
      }
    }
    return target;
  }
  function $patch(partialStateOrMutation: any) {
    if (typeof partialStateOrMutation === "function") {
      // 是一个mutation
      mergeReactiveObject(store, partialStateOrMutation());
    } else {
      // patch了一个对象
      mergeReactiveObject(store, partialStateOrMutation);
    }
  }
  const actionSubscribes: any = [];
  // function $reset() {}
  const partialStore = {
    $patch,
    // $reset,
    $onAction: addSubscription.bind(null, actionSubscribes),
  };

  const store = reactive(partialStore);
  Object.defineProperty(store, "$state", {
    get() {
      return pinia.state.value[id];
    },
    set(state: any) {
      $patch(($state: any) => Object.assign($state, state));
    },
  });
  function wrapAction(actionName: string, action: any): any {
    return function (...args: any[]) {
      const afterCallbacks: any = [];
      const errorCallbacks: any = [];
      function after(cb: any) {
        afterCallbacks.push(cb);
      }
      function onError(cb: any) {
        errorCallbacks.push(cb);
      }
      triggerSubscription(actionSubscribes, { after, onError, actionName });
      // 后续可能会做异步调用
      let result: any;
      try {
        result = action.apply(store, args);
      } catch (error: any) {
        triggerSubscription(errorCallbacks, error);
      }
      if (result instanceof Promise) {
        return result
          .then((res: any) => {
            triggerSubscription(afterCallbacks, res);
          })
          .catch((err: any) => {
            triggerSubscription(errorCallbacks, err);
            return Promise.reject(err);
          });
      } else {
        triggerSubscription(afterCallbacks, result);
      }
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
  return store;
}
