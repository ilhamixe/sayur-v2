'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Crosshair, X, AlertTriangle } from 'lucide-react';

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  onDistanceChange?: (km: number | null, withinRadius: boolean) => void;
}

interface DeliverySettings {
  centerLat: number;
  centerLng: number;
  maxKm: number;
  polygon: { lat: number; lng: number }[];
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Ray casting algorithm — point inside polygon? */
function pointInPolygon(lat: number, lng: number, polygon: { lat: number; lng: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function MapPicker({ lat, lng, onChange, onDistanceChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const circleRef = useRef<unknown>(null);
  const centerMarkerRef = useRef<unknown>(null);
  const polygonLayerRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [withinRadius, setWithinRadius] = useState(true);

  // Fetch delivery settings
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          let polygon = [];
          try { polygon = JSON.parse(data.settings.delivery_polygon || '[]'); } catch {}
          setDelivery({
            centerLat: parseFloat(data.settings.delivery_center_lat) || -6.9175,
            centerLng: parseFloat(data.settings.delivery_center_lng) || 106.923,
            maxKm: parseFloat(data.settings.delivery_max_km) || 10,
            polygon,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Calculate distance + inside check when pin changes
  useEffect(() => {
    if (!delivery || lat == null || lng == null) {
      setDistance(null);
      setWithinRadius(true);
      onDistanceChange?.(null, true);
      return;
    }
    const km = haversine(delivery.centerLat, delivery.centerLng, lat, lng);
    const rounded = Math.round(km * 10) / 10;
    setDistance(rounded);

    // If polygon is set, use polygon containment; otherwise use radius
    const ok = delivery.polygon.length >= 3
      ? pointInPolygon(lat, lng, delivery.polygon)
      : km <= delivery.maxKm;
    setWithinRadius(ok);
    onDistanceChange?.(rounded, ok);
  }, [lat, lng, delivery, onDistanceChange]);

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

      const start: [number, number] = lat != null && lng != null ? [lat, lng] : [-6.9, 106.9];

      const map = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: true,
      }).setView(start, lat != null ? 16 : 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const PIN = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      let marker = lat != null && lng != null
        ? L.marker(start, { icon: PIN, draggable: true }).addTo(map)
        : null;

      if (marker) {
        marker.on('dragend', () => {
          const pos = marker!.getLatLng();
          onChange(pos.lat, pos.lng);
        });
      }

      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        if (marker) {
          marker.setLatLng(e.latlng);
        } else {
          marker = L.marker(e.latlng, { icon: PIN, draggable: true }).addTo(map);
          marker.on('dragend', () => {
            const pos = marker!.getLatLng();
            onChange(pos.lat, pos.lng);
          });
        }
        onChange(newLat, newLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
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

  // Draw polygon / circle when delivery settings load
  useEffect(() => {
    if (!delivery || !mapInstanceRef.current) return;
    import('leaflet').then(({ default: L }) => {
      const map = mapInstanceRef.current as ReturnType<typeof L.map>;
      if (!map) return;

      // Remove old layers
      if (circleRef.current) map.removeLayer(circleRef.current as any);
      if (centerMarkerRef.current) map.removeLayer(centerMarkerRef.current as any);
      if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current as any);

      const CENTER_ICON = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      // Draw polygon if available
      if (delivery.polygon.length >= 3) {
        const latlngs = delivery.polygon.map((p) => [p.lat, p.lng] as [number, number]);
        const polygon = L.polygon(latlngs, {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '6 4',
        }).addTo(map);
        polygonLayerRef.current = polygon;

        // Center marker
        const cMarker = L.marker([delivery.centerLat, delivery.centerLng], { icon: CENTER_ICON, interactive: false }).addTo(map);
        centerMarkerRef.current = cMarker;
      } else {
        // Fallback: circle
        const circle = L.circle([delivery.centerLat, delivery.centerLng], {
          radius: delivery.maxKm * 1000,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '6 4',
        }).addTo(map);
        circleRef.current = circle;

        const cMarker = L.marker([delivery.centerLat, delivery.centerLng], { icon: CENTER_ICON, interactive: false }).addTo(map);
        centerMarkerRef.current = cMarker;
      }
    });
  }, [delivery]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: newLat, longitude: newLng } = pos.coords;
        onChange(newLat, newLng);
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current as { setView: (center: [number, number], zoom: number) => void };
          map.setView([newLat, newLng], 16);
        }
      },
      () => {}
    );
  };

  const clearPin = () => {
    onChange(null, null);
    if (markerRef.current) {
      const map = mapInstanceRef.current as { removeLayer: (layer: unknown) => void };
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  const hasPolygon = (delivery?.polygon?.length ?? 0) >= 3;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
          Lokasi di Peta (Opsional)
        </label>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={useMyLocation}
            className="px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
          >
            <Crosshair className="w-3 h-3" /> GPS
          </button>
          {(lat != null || lng != null) && (
            <button
              type="button"
              onClick={clearPin}
              className="px-2 py-1 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              <X className="w-3 h-3" /> Hapus
            </button>
          )}
        </div>
      </div>
      <div
        ref={mapRef}
        className="w-full h-48 sm:h-56 rounded-xl border border-zinc-200 dark:border-white/15 overflow-hidden bg-zinc-100"
      />
      {lat != null && lng != null && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-zinc-400">
            📍 {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
          {distance !== null && delivery && (
            <p className={`text-[10px] font-bold flex items-center gap-1 ${withinRadius ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {withinRadius ? (
                <>✓ {distance} km dari toko</>
              ) : (
                <><AlertTriangle className="w-3 h-3" /> {distance} km — di luar area (+Rp 10.000)</>
              )}
            </p>
          )}
        </div>
      )}
      {!withinRadius && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-[11px] text-red-600 dark:text-red-400 font-medium">
          ⚠️ Lokasi Anda di luar area pengiriman. Ada tambahan biaya Rp 10.000 untuk pengiriman ke luar area.
        </div>
      )}
      {delivery && (
        <p className="text-[9px] text-zinc-400">
          Area pengiriman: {hasPolygon ? `${delivery.polygon.length} titik polygon` : `radius ${delivery.maxKm} km dari toko`}
        </p>
      )}
      {loading && (
        <p className="text-[10px] text-zinc-400 animate-pulse">Memuat peta...</p>
      )}
    </div>
  );
}
