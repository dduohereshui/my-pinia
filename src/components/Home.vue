<template>
  <div>
    home:{{ counter.num }}
    <button @click="inc">+1</button>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from "../store/counter";
const counter = useCounterStore();
// console.log(counter);
const inc = () => {
  counter.num++;
};
</script>

<style scoped></style>
