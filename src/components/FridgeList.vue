<script setup>
import { ref, onMounted } from 'vue';
import { getAllProducts, deleteProduct } from '../db';

const products = ref([]);

const refreshList = async () => {
  products.value = await getAllProducts();
};

const removeProduct = async (id) => {
  await deleteProduct(id);
  await refreshList();
};

const getImageUrl = (blob) => blob ? window.URL.createObjectURL(blob) : '';

onMounted(refreshList);

defineExpose({ refreshList });
</script>

<template>
  <div class="list-container">
    <div class="header">
      <h2>In My Fridge</h2>
      <button @click="refreshList" class="btn-refresh">Refresh</button>
    </div>

    <div v-if="products.length === 0" class="empty">
      Your fridge is empty. Add something! 
    </div>

    <div class="grid">
      <div v-for="item in products" :key="item.id" class="item-card shadow">
        <img :src="getImageUrl(item.image)" class="item-img" />
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p>Expires: <span>{{ item.expiryDate }}</span></p>
          <button @click="removeProduct(item.id)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-container { margin-top: 40px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }

.item-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.3s ease;
}
.item-card:hover { transform: translateY(-5px); }

.item-img { width: 100%; height: 150px; object-fit: cover; }
.item-info { padding: 15px; text-align: left; }
.item-info h3 { margin: 0; font-size: 1.1rem; }
.item-info p { color: #718096; font-size: 0.9rem; margin: 8px 0; }
.item-info span { font-weight: 700; color: #e53e3e; }

.btn-delete {
  background: #fff5f5;
  color: #c53030;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
}
.btn-delete:hover { background: #feb2b2; }
</style>