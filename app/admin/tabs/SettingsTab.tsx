'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Wifi, Truck, CreditCard, QrCode, Banknote, Upload, Image, Plus, Trash2 } from 'lucide-react';
import WaConnection from '../../components/WaConnection';
import NotifyLog from '../../components/NotifyLog';
import DeliveryZoneEditor from '../../components/DeliveryZoneEditor';

interface Courier {
  name: string;
  phone: string;
  lat: number | null;
  lng: number | null;
}

const EMPTY_COURIER: Courier = { name: '', phone: '', lat: null, lng: null };

export default function SettingsTab() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [courierSaved, setCourierSaved] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopSaved, setShopSaved] = useState(false);
  const [deliveryCenterLat, setDeliveryCenterLat] = useState('');
  const [deliveryCenterLng, setDeliveryCenterLng] = useState('');
  const [deliveryMaxKm, setDeliveryMaxKm] = useState('');
  const [deliveryPolygon, setDeliveryPolygon] = useState<{ lat: number; lng: number }[]>([]);
  const [deliverySaved, setDeliverySaved] = useState(false);
  const [payQris, setPayQris] = useState(true);
  const [payTransfer, setPayTransfer] = useState(true);
  const [payCod, setPayCod] = useState(true);
  const [paySaved, setPaySaved] = useState(false);
  const [qrisImage, setQrisImage] = useState('');
  const [qrisUploading, setQrisUploading] = useState(false);
  const qrisFileRef = useRef<HTMLInputElement>(null);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok) {
        try {
          const raw = JSON.parse(data.settings?.couriers || '[]');
          setCouriers(raw.map((c: any) => ({
            name: c.name || '',
            phone: c.phone || '',
            lat: c.lat ?? null,
            lng: c.lng ?? null,
          })));
        } catch {}
        if (data.settings?.shop_name) setShopName(data.settings.shop_name);
        if (data.settings?.delivery_center_lat) setDeliveryCenterLat(data.settings.delivery_center_lat);
        if (data.settings?.delivery_center_lng) setDeliveryCenterLng(data.settings.delivery_center_lng);
        if (data.settings?.delivery_max_km) setDeliveryMaxKm(data.settings.delivery_max_km);
        try {
          setDeliveryPolygon(JSON.parse(data.settings?.delivery_polygon || '[]'));
        } catch {}
        setPayQris(data.settings?.payment_qris !== '0');
        setPayTransfer(data.settings?.payment_transfer !== '0');
        setPayCod(data.settings?.payment_cod !== '0');
        setQrisImage(data.settings?.payment_qris_image || '');
      }
    } catch {}
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSaveCouriers = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couriers: JSON.stringify(couriers) }),
      });
      if (res.ok) {
        setCourierSaved(true);
        setTimeout(() => setCourierSaved(false), 3000);
      }
    } catch {}
  };

  const addCourier = () => setCouriers((prev) => [...prev, { ...EMPTY_COURIER }]);
  const removeCourier = (idx: number) => setCouriers((prev) => prev.filter((_, i) => i !== idx));
  const updateCourier = (idx: number, field: keyof Courier, value: string | number | null) => {
    setCouriers((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSaveShop = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_name: shopName.trim() }),
      });
      if (res.ok) {
        setShopSaved(true);
        setTimeout(() => setShopSaved(false), 3000);
      }
    } catch {}
  };

  const handleSaveDelivery = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_center_lat: deliveryCenterLat.trim(),
          delivery_center_lng: deliveryCenterLng.trim(),
          delivery_max_km: deliveryMaxKm.trim(),
        }),
      });
      if (res.ok) {
        setDeliverySaved(true);
        setTimeout(() => setDeliverySaved(false), 3000);
      }
    } catch {}
  };

  const handleSavePolygon = async (polygon: { lat: number; lng: number }[]) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_polygon: JSON.stringify(polygon) }),
      });
      if (res.ok) {
        setDeliveryPolygon(polygon);
        setDeliverySaved(true);
        setTimeout(() => setDeliverySaved(false), 3000);
      }
    } catch {}
  };

  const handleClearPolygon = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_polygon: '[]' }),
      });
      if (res.ok) {
        setDeliveryPolygon([]);
        setDeliverySaved(true);
        setTimeout(() => setDeliverySaved(false), 3000);
      }
    } catch {}
  };

  const handleSavePayment = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_qris: payQris ? '1' : '0',
          payment_transfer: payTransfer ? '1' : '0',
          payment_cod: payCod ? '1' : '0',
          payment_qris_image: qrisImage,
        }),
      });
      if (res.ok) {
        setPaySaved(true);
        setTimeout(() => setPaySaved(false), 3000);
      }
    } catch {}
  };

  const handleUploadQris = async (file: File) => {
    setQrisUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setQrisImage(data.url);
      }
    } catch {}
    setQrisUploading(false);
  };

  return (
    <div className="space-y-5">
      {/* WhatsApp Connection */}
      <WaConnection />

      {/* Daftar Kurir */}
      <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-500" />
          Daftar Kurir
        </h2>
        <p className="text-[11px] text-zinc-500 mb-3">
          Tambahkan kurir yang bisa klaim order. Masukkan nama, nomor WA, dan lokasi base (lat/lng) untuk hitung jarak.
        </p>
        <div className="space-y-3">
          {couriers.map((c, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Kurir #{idx + 1}</span>
                <button
                  onClick={() => removeCourier(idx)}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Nama</label>
                  <input
                    type="text"
                    placeholder="Andi"
                    value={c.name}
                    onChange={(e) => updateCourier(idx, 'name', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="628xxxxxxxxxx"
                    value={c.phone}
                    onChange={(e) => updateCourier(idx, 'phone', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Lat Base</label>
                  <input
                    type="text"
                    placeholder="-6.9175"
                    value={c.lat ?? ''}
                    onChange={(e) => updateCourier(idx, 'lat', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full p-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Lng Base</label>
                  <input
                    type="text"
                    placeholder="106.9230"
                    value={c.lng ?? ''}
                    onChange={(e) => updateCourier(idx, 'lng', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full p-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button
              onClick={addCourier}
              className="px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Kurir
            </button>
            <button
              onClick={handleSaveCouriers}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
            >
              {courierSaved ? 'Tersimpan!' : 'Simpan Daftar Kurir'}
            </button>
          </div>
        </div>
      </section>

      {/* Delivery Zone (Polygon) */}
      <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-500" />
          Area Pengiriman
        </h2>
        <p className="text-[11px] text-zinc-500 mb-3">
          Gambar batas area pengiriman di peta. Klik untuk tambah titik, minimal 3 titik.
        </p>
        <DeliveryZoneEditor
          initialPolygon={deliveryPolygon}
          onSave={handleSavePolygon}
        />
        {deliveryPolygon.length >= 3 && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleClearPolygon}
              className="px-3 py-1.5 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              Hapus Area Polygon
            </button>
            <p className="text-[10px] text-zinc-400">{deliveryPolygon.length} titik aktif</p>
          </div>
        )}
      </section>

      {/* Fallback: Center + Radius (if no polygon) */}
      {deliveryPolygon.length < 3 && (
        <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Radius Pengiriman (Fallback)
          </h2>
          <p className="text-[11px] text-zinc-500 mb-3">Digunakan jika area polygon belum diatur.</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Latitude Pusat</label>
                <input
                  type="text"
                  placeholder="-6.9175"
                  value={deliveryCenterLat}
                  onChange={(e) => setDeliveryCenterLat(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Longitude Pusat</label>
                <input
                  type="text"
                  placeholder="106.9230"
                  value={deliveryCenterLng}
                  onChange={(e) => setDeliveryCenterLng(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Jarak Maksimum (km)</label>
              <input
                type="number"
                placeholder="10"
                value={deliveryMaxKm}
                onChange={(e) => setDeliveryMaxKm(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleSaveDelivery}
              className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
            >
              {deliverySaved ? 'Tersimpan!' : 'Simpan Radius'}
            </button>
          </div>
        </section>
      )}

      {/* Shop Name */}
      <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-500" />
          Nama Toko
        </h2>
        <p className="text-[11px] text-zinc-500 mb-3">Nama toko yang ditampilkan di pesan WhatsApp ke supplier & kurir.</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Sayur Sukabumi"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="flex-1 p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSaveShop}
            className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            {shopSaved ? 'Tersimpan!' : 'Simpan'}
          </button>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-500" />
          Metode Pembayaran
        </h2>
        <p className="text-[11px] text-zinc-500 mb-3">Aktifkan / nonaktifkan metode pembayaran yang tersedia di checkout.</p>
        <div className="space-y-2">
          {[
            { id: 'qris', label: 'QRIS Instan', desc: 'BCA / Gopay / Shopee', icon: QrCode, val: payQris, set: setPayQris },
            { id: 'transfer', label: 'Transfer Bank', desc: 'BCA / Mandiri / BRI', icon: CreditCard, val: payTransfer, set: setPayTransfer },
            { id: 'cod', label: 'COD (Bayar di Tempat)', desc: 'Hanya untuk area dalam radius', icon: Banknote, val: payCod, set: setPayCod },
          ].map((p) => {
            const Icon = p.icon;
            return (
              <label key={p.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                p.val
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30'
                  : 'bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 opacity-60'
              }`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${p.val ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                  <div>
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-zinc-500">{p.desc}</div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={p.val}
                    onChange={(e) => p.set(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 dark:bg-white/10 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform"></div>
                </div>
              </label>
            );
          })}

          {/* QRIS Image Upload */}
          {payQris && (
            <div className="mt-3 p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                <Image className="w-3 h-3" /> Gambar QRIS (Stiker)
              </label>
              <p className="text-[10px] text-zinc-400">Upload foto QRIS stiker dari toko.</p>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => qrisFileRef.current?.click()}
                  className="w-28 h-28 rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/15 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors overflow-hidden bg-white dark:bg-white/[0.03]"
                >
                  {qrisImage ? (
                    <img src={qrisImage} alt="QRIS" className="w-full h-full object-contain" />
                  ) : qrisUploading ? (
                    <span className="text-[10px] text-zinc-400 animate-pulse">Upload...</span>
                  ) : (
                    <Upload className="w-6 h-6 text-zinc-300" />
                  )}
                </div>
                <input
                  ref={qrisFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadQris(f);
                    e.target.value = '';
                  }}
                />
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Atau tempel URL gambar QRIS..."
                    value={qrisImage}
                    onChange={(e) => setQrisImage(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {qrisImage && (
                    <button
                      type="button"
                      onClick={() => setQrisImage('')}
                      className="text-[10px] text-red-500 hover:text-red-600 font-bold"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSavePayment}
            className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors mt-2"
          >
            {paySaved ? 'Tersimpan!' : 'Simpan Pengaturan Pembayaran'}
          </button>
        </div>
      </section>

      {/* Notify Log */}
      <NotifyLog />
    </div>
  );
}
