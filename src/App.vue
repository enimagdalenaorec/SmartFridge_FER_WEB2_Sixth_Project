<template>
  <div class="app-container">
    <header>
      <h1>Smart Fridge 🧊</h1>
    </header>
    
    <main class="content">
      <FridgeForm @item-added="updateList" />
      <FridgeList ref="fridgeList" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FridgeForm from './components/FridgeForm.vue';
import FridgeList from './components/FridgeList.vue';

const fridgeList = ref(null);

const updateList = () => {
  fridgeList.value.refreshList();
};
</script>

<style>
/* Dodaj malo layouta */
.content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 40px;
  align-items: start;
}
@media (max-width: 800px) {
  .content { grid-template-columns: 1fr; }
}
</style>