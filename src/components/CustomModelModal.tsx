import React, { useRef, useState } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Sliders,
  AlertCircle,
  User,
  Building2,
  Truck,
  Satellite
} from 'lucide-react';
import { customModelManager, ModelSlot } from '../services/customModelService';
import { useCustomModel } from '../hooks/useCustomModel';
import { sound } from '../services/audio';

interface CustomModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLOTS: Array<{ id: ModelSlot; label: string; Icon: React.ComponentType<{ className?: string }>; desc: string }> = [
  { id: 'avatar', label: 'Player Avatar', Icon: User, desc: 'Replaces the 3D astronaut character with your model' },
  { id: 'habitat', label: 'Habitat Module', Icon: Building2, desc: 'Replaces the base habitat dome with your model' },
  { id: 'rover', label: 'Exploration Rover', Icon: Truck, desc: 'Places your custom rover model on the surface' },
  { id: 'prop', label: 'Surface Landmark', Icon: Satellite, desc: 'Places your custom scientific station or artifact' }
];

export const CustomModelModal: React.FC<CustomModelModalProps> = ({ isOpen, onClose }) => {
  const [selectedSlot, setSelectedSlot] = useState<ModelSlot>('avatar');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { meta } = useCustomModel(selectedSlot);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'glb' && ext !== 'gltf') {
      setStatusMessage('Please select a valid .glb or .gltf 3D file.');
      sound.playWarning();
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage(`Parsing and optimizing ${file.name}...`);
      await customModelManager.importFile(file, selectedSlot, 1.0);
      sound.playSuccess();
      setStatusMessage(`Loaded "${file.name}" into ${selectedSlot} slot.`);
    } catch (err: unknown) {
      console.error(err);
      sound.playWarning();
      setStatusMessage('Failed to parse 3D model. Verify it is a valid binary glTF (.glb) file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  const handleScaleChange = (scale: number) => {
    customModelManager.setScale(selectedSlot, scale);
  };

  const handleRemove = async () => {
    if (!confirmRemove) {
      sound.playClick();
      setConfirmRemove(true);
      return;
    }
    sound.playClick();
    setConfirmRemove(false);
    await customModelManager.removeModel(selectedSlot);
    setStatusMessage(`Reverted ${selectedSlot} to default NASA model.`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Custom 3D Model Importer"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0B1016]/80 select-none"
    >
      <div className="relative w-full max-w-2xl bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#35434E] pb-4 mb-4 gap-4">
          <div>
            <div className="text-xs font-mono-tech text-[#78A9C8] mb-0.5">
              Local 3D Asset Importer
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#F0F2F3]">
              Custom 3D Models (.glb / .gltf)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close 3D model importer"
            className="w-9 h-9 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#AAB5BE] leading-relaxed mb-5">
          Select any <strong className="text-[#F0F2F3]">.glb</strong> or{' '}
          <strong className="text-[#F0F2F3]">.gltf</strong> file from your computer. Assets are parsed locally in the browser and rendered in the 3D scene.
        </p>

        {/* Slot Selector */}
        <div className="mb-5">
          <div className="text-xs font-medium text-[#AAB5BE] mb-2">
            1. Target Asset Slot
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SLOTS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedSlot(id);
                  setConfirmRemove(false);
                  setStatusMessage(null);
                }}
                className={`p-3 rounded-lg border text-center transition-colors flex flex-col items-center justify-center gap-1.5 ${
                  selectedSlot === id
                    ? 'bg-[#202C36] border-[#78A9C8] text-[#F0F2F3]'
                    : 'bg-[#141D26] border-[#35434E] text-[#AAB5BE] hover:border-[#4F6270] hover:text-[#F0F2F3]'
                }`}
              >
                <Icon className={`w-5 h-5 ${selectedSlot === id ? 'text-[#78A9C8]' : 'text-[#8895A0]'}`} />
                <span className="text-xs font-medium leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Slot or Dropzone */}
        {meta ? (
          <div className="mb-5 p-4 rounded-lg bg-[#202C36] border border-[#35434E]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-[#79A88B] shrink-0" />
                <span className="text-xs font-semibold text-[#F0F2F3] truncate">
                  Active Model: {meta.fileName}
                </span>
              </div>
              <span className="text-xs font-mono-tech text-[#8895A0] shrink-0 tabular-nums">
                {(meta.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            <div className="pt-3 border-t border-[#35434E]">
              <div className="flex items-center justify-between text-xs text-[#AAB5BE] mb-2">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#78A9C8]" />
                  <span>Scale Adjustment</span>
                </span>
                <span className="text-[#F0F2F3] font-mono-tech font-semibold tabular-nums">
                  {meta.scale.toFixed(1)}x
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={meta.scale}
                  onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                  aria-label="Model scale multiplier"
                  className="flex-1 accent-[#78A9C8] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleScaleChange(1.0)}
                  className="px-2.5 py-1 rounded bg-[#19232D] hover:bg-[#263442] border border-[#35434E] text-xs font-mono-tech text-[#AAB5BE] hover:text-[#F0F2F3]"
                >
                  Reset 1.0x
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleRemove}
                onMouseLeave={() => setConfirmRemove(false)}
                className={`px-3 py-2 min-h-[38px] rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  confirmRemove
                    ? 'bg-[#382022] border-[#C97979] text-[#F0F2F3]'
                    : 'bg-[#19232D] hover:bg-[#263442] border-[#35434E] text-[#C97979]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmRemove ? 'Confirm Removal' : 'Remove & Use Default'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 min-h-[38px] rounded-md bg-[#19232D] hover:bg-[#263442] border border-[#35434E] text-[#F0F2F3] text-xs font-medium transition-colors"
              >
                Replace Model (.glb)
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".glb,.gltf"
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mb-5 p-6 rounded-lg border border-dashed text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
              isDragging
                ? 'border-[#78A9C8] bg-[#202C36]'
                : 'border-[#35434E] hover:border-[#78A9C8] bg-[#141D26] hover:bg-[#1C2733]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".glb,.gltf"
              className="hidden"
            />
            <UploadCloud className="w-7 h-7 text-[#78A9C8] mb-2.5" />
            <h3 className="text-sm font-semibold text-[#F0F2F3] mb-1">
              {isLoading ? 'Importing model...' : 'Browse or drop a .glb / .gltf file'}
            </h3>
            <p className="text-xs text-[#8895A0] max-w-sm mb-3">
              Binary glTF format preserves textures, materials, and mesh hierarchy.
            </p>
            <span className="px-4 py-2 rounded-md bg-[#202C36] border border-[#35434E] text-[#F0F2F3] text-xs font-medium">
              Select 3D File
            </span>
          </div>
        )}

        {/* Status Notification */}
        {statusMessage && (
          <div className="mb-4 p-3 rounded-md bg-[#202C36] border border-[#35434E] text-xs text-[#F0F2F3] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#78A9C8] shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#35434E] pt-4 mt-auto gap-3">
          <span className="text-xs text-[#8895A0]">
            Supports Blender, CAD, and NASA 3D Resources exports
          </span>

          <button
            type="button"
            onClick={() => {
              sound.playSuccess();
              onClose();
            }}
            className="px-5 py-2 min-h-[40px] rounded-lg bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F] font-semibold text-xs sm:text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
