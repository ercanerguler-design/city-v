'use client';

import { X, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CameraLiveView({ camera, onClose }: { camera: any; onClose: () => void }) {
  const streamUrl = camera.stream_url || `http://${camera.ip_address}:${camera.port}/stream`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="max-w-6xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{camera.camera_name}</h3>
            <p className="text-sm text-gray-500">{camera.ip_address}:{camera.port}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-black rounded-b-xl overflow-hidden">
          <img
            src={streamUrl}
            alt="Camera Stream"
            className="w-full h-auto"
            style={{ maxHeight: '80vh' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
