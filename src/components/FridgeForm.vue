<script setup>
import { ref, defineEmits } from 'vue';
import { addProduct } from '../db';

const emit = defineEmits(['item-added']);

const name = ref('');
const expiryDate = ref('');
const video = ref(null);
const canvas = ref(null);
const capturedImage = ref(null);
const showCamera = ref(false);
const toastMessage = ref('');

const showToast = (msg) => {
  toastMessage.value = msg;
  setTimeout(() => { toastMessage.value = ''; }, 3000);
};

const getImageUrl = (blob) => {
  if (!blob) return '';
  return window.URL.createObjectURL(blob);
};

const startCamera = async () => {
  showCamera.value = true;
  capturedImage.value = null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 1280, height: 720 } 
    });
    if (video.value) {
      video.value.srcObject = stream;
    }
  } catch (err) {
    showToast("❌ Cannot access camera!");
    showCamera.value = false;
  }
};

const takePhoto = () => {
  if (!video.value || video.value.readyState !== 4) {
    showToast("📷 Waiting for camera...");
    return;
  }

  const context = canvas.value.getContext('2d');
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  
  context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
  
  canvas.value.toBlob((blob) => {
    capturedImage.value = blob;
    stopCamera();
    showToast("📸 Photo captured!");
  }, 'image/jpeg', 0.8);
};

const stopCamera = () => {
  if (video.value && video.value.srcObject) {
    const stream = video.value.srcObject;
    stream.getTracks().forEach(track => track.stop());
    video.value.srcObject = null;
  }
  showCamera.value = false;
};

const saveItem = async () => {
  if (!name.value || !expiryDate.value) {
    showToast("⚠️ Fill in name and date!");
    return;
  }

  const newItem = {
    name: name.value,
    expiryDate: expiryDate.value,
    image: capturedImage.value,
    dateAdded: new Date().toISOString(),
    synced: false
  };

  try {
    await addProduct(newItem);
    showToast("✅ Saved to fridge!");
    
    emit('item-added');

    name.value = '';
    expiryDate.value = '';
    capturedImage.value = null;
  } catch (err) {
    showToast("❌ Error saving!");
  }
};
</script>

<template>
  <div class="card shadow">
    <h2 class="title">Add Item 🧊</h2>
    
    <div class="input-group">
      <label>Item Name</label>
      <input v-model="name" type="text" placeholder="e.g. Fresh Milk" />
    </div>

    <div class="input-group">
      <label>Expiry Date</label>
      <input v-model="expiryDate" type="date" />
    </div>

    <div class="camera-section">
      <div v-if="showCamera" class="video-container">
        <video ref="video" autoplay playsinline></video>
        <button @click="takePhoto" class="btn-capture">Capture Photo</button>
      </div>

      <div v-else-if="capturedImage" class="preview-container">
        <img :src="getImageUrl(capturedImage)" alt="Preview" />
        <button @click="startCamera" class="btn-retake">Retake</button>
      </div>

      <button v-else @click="startCamera" class="btn-open-camera">
        📷 Take Photo with Camera
      </button>
    </div>

    <button @click="saveItem" class="btn-save">Add to Inventory</button>

    <canvas ref="canvas" style="display:none"></canvas>

    <Transition name="fade">
      <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.card {
  background: white;
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}
.title { margin-top: 0; color: #2d3748; font-weight: 800; }
.input-group { margin-bottom: 20px; text-align: left; }
label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 0.85rem; color: #4a5568; }

input {
  width: 100%;
  padding: 14px;
  border: 2px solid #edf2f7;
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.2s;
}
input:focus { border-color: #42b983; outline: none; }

.camera-section {
  margin: 25px 0;
  background: #f7fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

video, .preview-container img {
  width: 100%;
  display: block;
  border-radius: 14px;
}

.btn-capture {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(66, 185, 131, 0.9);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
}

.btn-open-camera, .btn-retake {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  width: 100%;
  padding: 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d3748;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  z-index: 9999;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>