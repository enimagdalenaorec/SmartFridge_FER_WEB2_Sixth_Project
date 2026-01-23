<script setup>
import { ref, onMounted } from 'vue';
import { getAllProducts, deleteProduct } from '../db';

const products = ref([]);

const refreshList = async () => {
  const data = await getAllProducts();
  products.value = data.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
};

const removeProduct = async (id) => {
  if (confirm("Are you sure you want to remove this item?")) {
    await deleteProduct(id);
    await refreshList();
  }
};

const getImageUrl = (blob) => {
  if (!blob) return 'https://via.placeholder.com/150?text=No+Image';
  return window.URL.createObjectURL(blob);
};

const isExpired = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateString);
  return expiry <= today;
};

onMounted(refreshList);

defineExpose({ refreshList });
</script>

<template>
  <div class="list-container">
    <div class="header">
      <h2>In My Fridge</h2>
    </div>

    <p class="guide-text">
      Track your items easily! Add new products with photos, and track their expiry date! Remove any eaten or expired products.
      <br>
    </p>

    <div v-if="products.length === 0" class="empty-state shadow">
      <span class="empty-icon">❄️</span>
      <p>Your fridge is empty. Start adding items!</p>
    </div>

    <div class="grid">
      <div v-for="item in products" :key="item.id" class="item-card shadow">
        <div class="img-wrapper">
          <img :src="getImageUrl(item.image)" class="item-img" />
          <div v-if="isExpired(item.expiryDate)" class="status-badge">Expired</div>
        </div>
        
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p class="expiry-text">
            Expires: <span :class="{ 'expired-date': isExpired(item.expiryDate) }">
              {{ item.expiryDate }}
            </span>
          </p>
          <button @click="removeProduct(item.id)" class="btn-delete">
            Remove Item
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  animation: fadeIn 0.5s ease-out;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

h2 {
  margin: 0;
  font-weight: 800;
  font-size: 1.6rem;
  color: #2d3748;
}

.btn-refresh-modern {
  background: white;
  border: 2px solid #edf2f7;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.btn-refresh-modern:hover {
  border-color: var(--primary);
  transform: rotate(180deg);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.item-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.item-card:hover {
  transform: translateY(-8px);
}

.img-wrapper {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #e53e3e;
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.item-info {
  padding: 20px;
  text-align: left;
}

.item-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a202c;
}

.expiry-text {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.expired-date {
  color: #e53e3e;
  font-weight: 800;
}

.btn-delete {
  width: 100%;
  padding: 10px;
  background: #fff5f5;
  color: #c53030;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.btn-delete:hover {
  background: #fed7d7;
}

.empty-state {
  background: white;
  padding: 50px;
  border-radius: 24px;
  text-align: center;
  color: #a0aec0;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.guide-text {
  color: #718096; 
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
  max-width: 600px;
}

.guide-text small {
  display: block;
  margin-top: 5px;
  color: #a0aec0;
  font-style: italic;
}

.title {
  margin-bottom: 10px; 
}

</style>