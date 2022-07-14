import { defineStore } from "@/pinia"; // 自己写的库
import { computed, reactive, toRefs } from "vue";
interface CounterState {
  num: number;
}
export const useCounterStore = defineStore("counter", {
  state: () => {
    return {
      num: 0,
    };
  },
  getters: {
    doubleNum(store: any) {
      return store.num * 2;
    },
  },
  actions: {
    increment(nums: number) {
      this.num++;
    },
  },
});

// export const useCounterStore = defineStore("counter", () => {
//   const state = reactive({
//     count: 0,
//   });
//   const doubleCount = computed(() => state.count * 2);

//   const increment = () => {
//     state.count++;
//   };
//   return {
//     ...toRefs(state),
//     doubleCount,
//     increment,
//   };
// });
