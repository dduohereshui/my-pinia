<template>
  <div>
    home:{{ counter.num }} <br />
    双倍: {{ counter.doubleNum }}
    <button @click="inc">+1</button>
    <div>
      <template v-for="item in counter.fruits">
        <div>{{ item }}</div>
      </template>
    </div>
    <button @click="handlePatch">patch</button>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from "../store/counter";
const counter = useCounterStore();
console.log(counter);

const inc = () => {
  counter.increment(10);
};
const handlePatch = () => {
  counter.$patch({
    num: counter.num + 1,
    fruits: [...counter.fruits, "hhh"],
  });
};
</script>

<style scoped></style>
