import { openDB } from 'idb';

const DB_NAME = 'fridge-db';
const DB_VERSION = 1;

export const initDB = async () => {
  // if db doesnt exist, create it
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // table 'products'
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const addProduct = async (product) => {
  const db = await initDB();
  // 'product' : name, expiryDate, image (Blob), dateAdded, synced (boolean)
  return db.add('products', product);
};

export const getAllProducts = async () => {
  const db = await initDB();
  return db.getAll('products');
};

export const deleteProduct = async (id) => {
  const db = await initDB();
  return db.delete('products', id);
};