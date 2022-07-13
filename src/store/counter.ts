import { defineStore } from "pinia";
import { computed, reactive, toRefs } from "vue";
interface CounterState {
  num: number;
}
// export const useCounterStore = defineStore("counter", {
//   state: () => {
//     return {
//       num: 0,
//     };
//   },
//   getters: {
//     doubleNum: (state) => state.num * 2,
//   },
//   actions: {
//     increment(nums: number) {
//       this.num += nums;
//     },
//   },
// });

export const useCounterStore = defineStore("counter", () => {
  const state = reactive({
    count: 0,
  });
  const doubleCount = computed(() => state.count * 2);

  const increment = () => {
    state.count++;
  };
  return {
    ...toRefs(state),
    doubleCount,
    increment,
  };
});
