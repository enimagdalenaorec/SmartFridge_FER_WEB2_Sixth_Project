<script setup>
import { ref } from 'vue';
import FridgeForm from './components/FridgeForm.vue';
import FridgeList from './components/FridgeList.vue';

import { onMounted } from 'vue';

onMounted(() => {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      console.log('notif allowed:', permission);
    });
  }
});

const activeTab = ref('list');
const fridgeList = ref(null);

const updateListAndSwitch = () => {
  activeTab.value = 'list';
  setTimeout(() => {
    if (fridgeList.value) fridgeList.value.refreshList();
  }, 50);
};
</script>

<template>
  <div class="app-layout">
    <header class="main-header shadow">
      <div class="header-content">
        <div class="logo">
          Smart Fridge
        </div>
        
        <nav class="nav-tabs">
          <button 
            :class="{ active: activeTab === 'list' }" 
            @click="activeTab = 'list'"
          >
            Inventory
          </button>
          
          <button 
            :class="{ active: activeTab === 'add' }" 
            @click="activeTab = 'add'"
          >
            Add Item
          </button>
        </nav>
      </div>
    </header>

    <main class="container">
      <Transition name="fade" mode="out-in">
        <div v-if="activeTab === 'add'" key="add">
          <FridgeForm @item-added="updateListAndSwitch" />
        </div>
        <div v-else key="list">
          <FridgeList ref="fridgeList" />
        </div>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.main-header {
  background: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 70px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.5px;
}

.nav-tabs {
  display: flex;
  gap: 10px;
  background: #f1f5f9; 
  padding: 5px;
  border-radius: 12px;
}

.nav-tabs button {
  border: none;
  background: transparent;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.nav-tabs button.active {
  background: white; 
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 15px;
    gap: 15px;
  }
}
</style>