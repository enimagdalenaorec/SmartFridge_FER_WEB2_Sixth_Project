<script setup>
import { ref, defineEmits, computed } from 'vue';
import { addProduct } from '../db';

const emit = defineEmits(['item-added']);

const name = ref('');
const expiryDate = ref('');
const capturedImage = ref(null);
const showCamera = ref(false);
const toastMessage = ref('');
const video = ref(null);
const canvas = ref(null);

const isFormValid = computed(() => {
  return name.value.trim() !== '' && 
         expiryDate.value !== '' && 
         capturedImage.value !== null;
});

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
      video: { width: 1280, height: 720, facingMode: "user" } 
    });
    if (video.value) video.value.srcObject = stream;
  } catch (err) {
    showToast("Camera blocked or not found!");
    showCamera.value = false;
  }
};

const takePhoto = () => {
  if (!video.value) return;
  const context = canvas.value.getContext('2d');
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  context.drawImage(video.value, 0, 0);
  
  canvas.value.toBlob((blob) => {
    capturedImage.value = blob;
    stopCamera();
    showToast("Photo captured!");
  }, 'image/jpeg', 0.8);
};

const stopCamera = () => {
  if (video.value?.srcObject) {
    video.value.srcObject.getTracks().forEach(track => track.stop());
    video.value.srcObject = null;
  }
  showCamera.value = false;
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    capturedImage.value = file;
    showCamera.value = false;
    showToast("📁 Image selected from files!");
  }
};

const saveItem = async () => {
  if (!isFormValid.value) return;

  const newItem = {
    name: name.value,
    expiryDate: expiryDate.value,
    image: capturedImage.value,
    dateAdded: new Date().toISOString(),
    synced: false
  };

  try {
    await addProduct(newItem);
    
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-new-items');
    }

    showToast("Item added to fridge!");
    emit('item-added');

    name.value = '';
    expiryDate.value = '';
    capturedImage.value = null;
  } catch (err) {
    showToast("Error saving to database!");
  }
};
</script>

<template>
  <div class="card shadow">
    <h2 class="title">Add New Item</h2>
    
    <div class="input-group">
      <label>What's inside?</label>
      <input v-model="name" type="text" placeholder="e.g. Greek Yogurt" />
    </div>

    <div class="input-group">
      <label>Expiry Date</label>
      <input v-model="expiryDate" type="date" />
    </div>

    <div class="camera-section">
      <div v-if="showCamera" class="video-container">
        <video ref="video" autoplay playsinline></video>
        <div class="camera-controls">
          <button @click="takePhoto" class="btn-capture">Take Photo</button>
          <button @click="stopCamera" class="btn-cancel">Cancel</button>
        </div>
      </div>

      <div v-else-if="capturedImage" class="preview-container">
        <img :src="getImageUrl(capturedImage)" alt="Preview" />
        <div class="change-options">
          <button @click="startCamera" class="btn-small">Retake</button>
          <label class="btn-small">
            Change File
            <input type="file" accept="image/*" @change="handleFileUpload" hidden />
          </label>
        </div>
      </div>

      <div v-else class="initial-choice">
        <button @click="startCamera" class="btn-action">Use Camera</button>
        <span class="or-divider">or</span>
        <label class="btn-secondary">
          Upload Image
          <input type="file" accept="image/*" @change="handleFileUpload" hidden />
        </label>
      </div>
    </div>

    <button 
      @click="saveItem" 
      class="btn-save" 
      :disabled="!isFormValid"
    >
      Add to Inventory
    </button>

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
}

.title { margin: 0 0 25px 0; color: #2c3e50; font-weight: 800; text-align: left; }

.input-group { margin-bottom: 20px; text-align: left; }
label { display: block; font-weight: 600; margin-bottom: 8px; color: #64748b; font-size: 0.9rem; }

input {
  width: 100%;
  padding: 14px;
  border: 2px solid #edf2f7;
  border-radius: 12px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1rem;
}

input:focus { border-color: var(--primary); outline: none; }

.camera-section {
  margin: 25px 0;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 20px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

video, .preview-container img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.initial-choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.or-divider { font-size: 0.8rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }

.btn-action {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
  padding: 10px;
}

.camera-controls {
  position: absolute;
  bottom: 15px;
  display: flex;
  gap: 10px;
}

.btn-capture {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel {
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
}

.change-options {
  padding: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-small {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  width: 100%;
  padding: 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-save:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d3748;
  color: white;
  padding: 12px 25px;
  border-radius: 12px;
  z-index: 1000;
  font-weight: 600;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>