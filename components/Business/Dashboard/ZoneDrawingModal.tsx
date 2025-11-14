'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Zone {
  name: string;
  type: string;
  points: [number, number][];
  color: string;
}

interface ZoneDrawingModalProps {
  camera: any;
  onClose: () => void;
  onSave: () => void;
}

export default function ZoneDrawingModal({ camera, onClose, onSave }: ZoneDrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [currentZone, setCurrentZone] = useState<[number, number][]>([]);
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState<'checkout' | 'seating' | 'entrance' | 'storage'>('seating');
  const [saving, setSaving] = useState(false);

  const zoneColors = {
    checkout: '#ef4444',
    seating: '#3b82f6',
    entrance: '#10b981',
    storage: '#f59e0b'
  };

  useEffect(() => {
    loadCameraStream();
    if (camera.zones) {
      setZones(camera.zones);
    }
  }, [camera]);

  const loadCameraStream = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 640;
    canvas.height = 480;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = camera.stream_url || `http://${camera.ip_address}:${camera.port}/stream`;
    img.onload = () => ctx.drawImage(img, 0, 0, 640, 480);
    img.onerror = () => {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, 640, 480);
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));

    setCurrentZone([...currentZone, [x, y]]);
    drawZones([...zones, { name: zoneName || 'Yeni Bölge', type: zoneType, points: [...currentZone, [x, y]], color: zoneColors[zoneType] }]);
  };

  const drawZones = (zonesToDraw: Zone[]) => {
    loadCameraStream();
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      zonesToDraw.forEach((zone) => {
        if (zone.points.length < 2) return;

        ctx.fillStyle = zone.color + '40';
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(zone.points[0][0], zone.points[0][1]);
        zone.points.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Points
        zone.points.forEach(([x, y]) => {
          ctx.fillStyle = zone.color;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Label
        if (zone.points.length > 0) {
          const centerX = zone.points.reduce((sum, [x]) => sum + x, 0) / zone.points.length;
          const centerY = zone.points.reduce((sum, [, y]) => sum + y, 0) / zone.points.length;
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(zone.name, centerX, centerY);
        }
      });
    }, 100);
  };

  const finishZone = () => {
    if (currentZone.length < 3) {
      toast.error('En az 3 nokta seçin');
      return;
    }

    const newZone: Zone = {
      name: zoneName || `Bölge ${zones.length + 1}`,
      type: zoneType,
      points: currentZone,
      color: zoneColors[zoneType]
    };

    setZones([...zones, newZone]);
    setCurrentZone([]);
    setZoneName('');
    drawZones([...zones, newZone]);
    toast.success('Bölge eklendi');
  };

  const deleteZone = (index: number) => {
    const newZones = zones.filter((_, i) => i !== index);
    setZones(newZones);
    drawZones(newZones);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('business_token');
      const response = await fetch('/api/business/cameras', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cameraId: camera.id,
          zones: zones
        })
      });

      const data = await response.json();
      if (data.success) {
        onSave();
      } else {
        toast.error('Kaydedilemedi');
      }
    } catch (error) {
      toast.error('Hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Canvas */}
        <div className="flex-1 p-6">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full bg-gray-900 rounded-lg cursor-crosshair"
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Bölge Çizimi</h2>
            <p className="text-sm text-gray-500">Masa, kasa vb. tanımlayın</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bölge Adı</label>
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Örn: Masa 1, Kasa"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bölge Tipi</label>
              <select
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="seating">Oturma Alanı</option>
                <option value="checkout">Kasa</option>
                <option value="entrance">Giriş</option>
                <option value="storage">Depo</option>
              </select>
            </div>

            <button
              onClick={finishZone}
              disabled={currentZone.length < 3}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
            >
              <Plus className="w-4 h-4" />
              Bölgeyi Tamamla ({currentZone.length} nokta)
            </button>

            <div className="space-y-2">
              <p className="text-sm font-medium">Tanımlı Bölgeler ({zones.length})</p>
              {zones.map((zone, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }}></div>
                    <span className="text-sm font-medium">{zone.name}</span>
                  </div>
                  <button onClick={() => deleteZone(index)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 space-y-3">
            <button
              onClick={handleSave}
              disabled={saving || zones.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
