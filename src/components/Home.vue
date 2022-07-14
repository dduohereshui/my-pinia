<template>
  <div>
    home:{{ counter.num }} <br />
    双倍: {{ counter.doubleNum }}
    <button @click="inc">+1</button>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from "../store/counter";
const counter = useCounterStore();
console.log(counter);

const inc = () => {
  counter.increment(10);
};
</script>

<style scoped></style>
