'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Trash2, Save } from 'lucide-react';

interface DeliveryZoneEditorProps {
  initialPolygon: { lat: number; lng: number }[];
  onSave: (polygon: { lat: number; lng: number }[]) => void;
  saving?: boolean;
}

export default function DeliveryZoneEditor({ initialPolygon, onSave, saving }: DeliveryZoneEditorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const polygonLayerRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [points, setPoints] = useState<{ lat: number; lng: number }[]>(initialPolygon);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const init = async () => {
      const L = (await import('leaflet')).default;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const center: [number, number] = points.length > 0
        ? [points[0].lat, points[0].lng]
        : [-6.9175, 106.923];

      const map = L.map(mapRef.current!, { zoomControl: true }).setView(center, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const DOT = L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#10b981;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.4);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      // Draw existing polygon
      if (points.length >= 3) {
        const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);
        const polygon = L.polygon(latlngs, {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(map);
        polygonLayerRef.current = polygon;

        points.forEach((p) => {
          const m = L.marker([p.lat, p.lng], { icon: DOT, draggable: true }).addTo(map);
          m.on('dragend', () => {
            const pos = m.getLatLng();
            setPoints((prev) => prev.map((pp) =>
              pp.lat === p.lat && pp.lng === p.lng ? { lat: pos.lat, lng: pos.lng } : pp
            ));
          });
          markersRef.current.push(m);
        });
      }

      // Click to add point
      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPoints((prev) => {
          const updated = [...prev, newPoint];
          // Add marker
          const m = L.marker([newPoint.lat, newPoint.lng], { icon: DOT, draggable: true }).addTo(map);
          m.on('dragend', () => {
            const pos = m.getLatLng();
            setPoints((pp) => pp.map((p) =>
              p.lat === newPoint.lat && p.lng === newPoint.lng ? { lat: pos.lat, lng: pos.lng } : p
            ));
          });
          markersRef.current.push(m);

          // Update polygon visual
          if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current as any);
          if (updated.length >= 3) {
            const latlngs = updated.map((p) => [p.lat, p.lng] as [number, number]);
            polygonLayerRef.current = L.polygon(latlngs, {
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.15,
              weight: 2,
            }).addTo(map);
          }
          return updated;
        });
      });

      mapInstanceRef.current = map;
      setLoading(false);
      setTimeout(() => map.invalidateSize(), 100);
    };

    init();

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync polygon visual when points change (from marker drag)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then(({ default: L }) => {
      const map = mapInstanceRef.current as ReturnType<typeof L.map>;
      if (!map) return;
      if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current as any);
      if (points.length >= 3) {
        const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);
        polygonLayerRef.current = L.polygon(latlngs, {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(map);
      }
    });
  }, [points]);

  const clearAll = () => {
    setPoints([]);
    markersRef.current.forEach((m) => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { removeLayer: (l: unknown) => void }).removeLayer(m);
      }
    });
    markersRef.current = [];
    if (polygonLayerRef.current && mapInstanceRef.current) {
      (mapInstanceRef.current as { removeLayer: (l: unknown) => void }).removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
  };

  const undoLast = () => {
    if (points.length === 0) return;
    const last = points[points.length - 1];
    setPoints((prev) => prev.slice(0, -1));
    // Remove last marker
    if (markersRef.current.length > 0) {
      const m = markersRef.current.pop();
      if (m && mapInstanceRef.current) {
        (mapInstanceRef.current as { removeLayer: (l: unknown) => void }).removeLayer(m);
      }
    }
    // Redraw polygon
    if (mapInstanceRef.current) {
      import('leaflet').then(({ default: L }) => {
        const map = mapInstanceRef.current as ReturnType<typeof L.map>;
        if (!map) return;
        if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current as any);
        const remaining = points.slice(0, -1);
        if (remaining.length >= 3) {
          const latlngs = remaining.map((p) => [p.lat, p.lng] as [number, number]);
          polygonLayerRef.current = L.polygon(latlngs, {
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.15,
            weight: 2,
          }).addTo(map);
        }
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-zinc-500">
          Klik di peta untuk tambah titik. Minimal 3 titik untuk membentuk area.
          {points.length > 0 && <span className="font-bold text-emerald-600"> {points.length} titik</span>}
        </p>
        <div className="flex gap-1.5">
          {points.length > 0 && (
            <>
              <button
                type="button"
                onClick={undoLast}
                className="px-2 py-1 text-[10px] font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="px-2 py-1 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Hapus Semua
              </button>
            </>
          )}
        </div>
      </div>
      <div
        ref={mapRef}
        className="w-full h-64 sm:h-80 rounded-xl border border-zinc-200 dark:border-white/15 overflow-hidden bg-zinc-100"
      />
      {points.length > 0 && points.length < 3 && (
        <p className="text-[10px] text-amber-500 font-medium">
          ⚠️ Minimal 3 titik untuk membentuk area pengiriman. ({points.length}/3)
        </p>
      )}
      {points.length >= 3 && (
        <button
          type="button"
          onClick={() => onSave(points)}
          disabled={saving}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Menyimpan...' : 'Simpan Area'}
        </button>
      )}
      {loading && (
        <p className="text-[10px] text-zinc-400 animate-pulse">Memuat peta...</p>
      )}
    </div>
  );
}
