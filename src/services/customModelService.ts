import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export type ModelSlot = 'avatar' | 'habitat' | 'rover' | 'prop';

export interface CustomModelMeta {
  slot: ModelSlot;
  fileName: string;
  fileSizeBytes: number;
  scale: number;
  loadedAt: number;
}

const DB_NAME = 'junior_astronaut_models_db';
const DB_VERSION = 1;
const STORE_NAME = 'models';

// Simple IndexedDB wrapper for binary .glb storage
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not defined'));
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'slot' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

class CustomModelManager {
  private activeGLTFs: Map<ModelSlot, GLTF> = new Map();
  private metaMap: Map<ModelSlot, CustomModelMeta> = new Map();
  private listeners: Set<() => void> = new Set();
  private loader = new GLTFLoader();

  constructor() {
    if (typeof window !== 'undefined') {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      this.loader.setDRACOLoader(dracoLoader);
      this.initFromStorage();
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getModel(slot: ModelSlot): GLTF | null {
    return this.activeGLTFs.get(slot) || null;
  }

  public getMeta(slot: ModelSlot): CustomModelMeta | null {
    return this.metaMap.get(slot) || null;
  }

  public async initFromStorage() {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = async () => {
        const records = req.result as Array<{
          slot: ModelSlot;
          fileName: string;
          fileSizeBytes: number;
          scale: number;
          loadedAt: number;
          buffer: ArrayBuffer;
        }>;

        for (const record of records) {
          try {
            const gltf = await this.parseBuffer(record.buffer);
            this.activeGLTFs.set(record.slot, gltf);
            this.metaMap.set(record.slot, {
              slot: record.slot,
              fileName: record.fileName,
              fileSizeBytes: record.fileSizeBytes,
              scale: record.scale || 1.0,
              loadedAt: record.loadedAt
            });
          } catch (e) {
            console.warn(`Failed restoring model for ${record.slot}:`, e);
          }
        }
        this.notify();
      };
    } catch {
      // IndexedDB might not be available in strict sandboxes
    }
  }

  public async importFile(file: File, slot: ModelSlot = 'avatar', scale = 1.0): Promise<GLTF> {
    const arrayBuffer = await file.arrayBuffer();
    const gltf = await this.parseBuffer(arrayBuffer);

    this.activeGLTFs.set(slot, gltf);
    const meta: CustomModelMeta = {
      slot,
      fileName: file.name,
      fileSizeBytes: file.size,
      scale,
      loadedAt: Date.now()
    };
    this.metaMap.set(slot, meta);

    // Save to IndexedDB for offline persistence
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        slot,
        fileName: file.name,
        fileSizeBytes: file.size,
        scale,
        loadedAt: Date.now(),
        buffer: arrayBuffer
      });
    } catch (e) {
      console.warn('Could not persist model to IndexedDB:', e);
    }

    this.notify();
    return gltf;
  }

  public async setScale(slot: ModelSlot, scale: number) {
    const meta = this.metaMap.get(slot);
    if (meta) {
      meta.scale = scale;
      this.metaMap.set(slot, { ...meta });
      this.notify();

      try {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(slot);
        req.onsuccess = () => {
          if (req.result) {
            req.result.scale = scale;
            store.put(req.result);
          }
        };
      } catch {}
    }
  }

  public async removeModel(slot: ModelSlot) {
    this.activeGLTFs.delete(slot);
    this.metaMap.delete(slot);
    this.notify();

    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(slot);
    } catch {}
  }

  private parseBuffer(buffer: ArrayBuffer): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.loader.parse(
        buffer,
        '',
        (gltf) => {
          // Normalize lighting & shadow receiving
          gltf.scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              const mesh = obj as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          resolve(gltf);
        },
        (err) => reject(err)
      );
    });
  }
}

export const customModelManager = new CustomModelManager();
