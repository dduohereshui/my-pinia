<template>
  <div>
    home:{{ counter.count }} 双倍:{{ counter.doubleCount }}
    <button @click="inc">+1</button>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from "../store/counter";
const counter = useCounterStore();
console.log(counter);

const inc = () => {
  // counter.num++;
  counter.increment();
};
</script>

<style scoped></style>
