import { useEffect, useState } from 'react';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { customModelManager, ModelSlot, CustomModelMeta } from '../services/customModelService';

export function useCustomModel(slot: ModelSlot) {
  const [model, setModel] = useState<GLTF | null>(customModelManager.getModel(slot));
  const [meta, setMeta] = useState<CustomModelMeta | null>(customModelManager.getMeta(slot));

  useEffect(() => {
    const unsubscribe = customModelManager.subscribe(() => {
      setModel(customModelManager.getModel(slot));
      setMeta(customModelManager.getMeta(slot));
    });
    return unsubscribe;
  }, [slot]);

  return { model, meta };
}
