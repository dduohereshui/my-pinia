import { defineStore } from "@/pinia"; // 自己写的库
import { computed, reactive, toRefs } from "vue";
interface CounterState {
  num: number;
}

export const useCounterStore = defineStore("counter", {
  state: () => {
    return {
      num: 0,
      fruits: ["apple", "banana", "orange"],
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
//     num: 0,
//   });
//   const doubleNum = computed(() => state.num * 2);

//   const increment = () => {
//     state.num++;
//   };
//   return {
//     ...toRefs(state),
//     doubleNum,
//     increment,
//   };
// });
