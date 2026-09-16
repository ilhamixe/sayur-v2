'use client';

import React, { useState, useEffect } from 'react';
import { CartItem, Voucher } from '../types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  Clock, 
  Truck, 
  Check,
  AlertCircle
} from 'lucide-react';
import { VOUCHERS, SHIPPING_RATES, fetchVouchers } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  selectedCity: string;
  onChangeCity: (city: string) => void;
  selectedDeliverySlot: string;
  onChangeDeliverySlot: (slot: string) => void;
  appliedVoucher: Voucher | null;
  onApplyVoucher: (voucher: Voucher | null) => void;
  onProceedCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedCity,
  onChangeCity,
  selectedDeliverySlot,
  onChangeDeliverySlot,
  appliedVoucher,
  onApplyVoucher,
  onProceedCheckout
}: CartDrawerProps) {
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchVouchers().then(setVouchers);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingInfo = SHIPPING_RATES[selectedCity] || SHIPPING_RATES['sukabumi_kota'];
  const shippingCost = subtotal >= 100000 && selectedCity === 'sukabumi_kota' ? 0 : shippingInfo.cost;
  
  const discountAmount = appliedVoucher ? (subtotal * appliedVoucher.discountPercent) / 100 : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    const codeClean = voucherInput.trim().toUpperCase();
    const found = vouchers.find(v => v.code === codeClean);

    if (!found) {
      setVoucherError('Kode voucher tidak valid');
      return;
    }

    if (subtotal < found.minSpend) {
      setVoucherError(`Minimal belanja ${formatRupiah(found.minSpend)} untuk voucher ini`);
      return;
    }

    onApplyVoucher(found);
    setVoucherInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white/95 dark:bg-zinc-950/95 border-l border-zinc-200 dark:border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between transition-colors duration-300">
          
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Keranjang Sayuran</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{cart.length} jenis produk dipilih</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-2">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">Keranjang Anda Kosong</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                  Ayo pilih sayuran segar, bumbu dapur, atau paket masak dari kebun Sukabumi hari ini!
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white dark:text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Mulai Belanja Sayur
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Daftar Produk</span>
                  <button 
                    onClick={onClearCart}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Kosongkan
                  </button>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div 
                      key={item.product.id}
                      className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex gap-3 items-center backdrop-blur-md transition-colors duration-300"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-white/10 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {formatRupiah(item.product.price)} / {item.product.unit}
                        </div>
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 pt-0.5">
                          {formatRupiah(item.product.price * item.quantity)}
                        </div>
                      </div>

                      {/* Quantity changer */}
                      <div className="flex items-center gap-1 bg-zinc-200 dark:bg-black/60 border border-zinc-300 dark:border-white/10 rounded-lg p-1">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/30 text-zinc-700 dark:text-zinc-200 cursor-pointer text-xs shadow-sm dark:shadow-none"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-zinc-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-5 h-5 flex items-center justify-center rounded bg-emerald-500 hover:bg-emerald-400 text-white dark:text-zinc-950 font-bold cursor-pointer text-xs disabled:opacity-40 shadow-sm dark:shadow-none"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Delivery Options Box */}
                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 space-y-3 transition-colors duration-300">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Kota Tujuan Pengiriman:</span>
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => onChangeCity(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/15 rounded-xl text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 shadow-sm dark:shadow-none"
                    >
                      <option value="sukabumi_kota">Sukabumi Kota (Gratis Ongkir min 100rb)</option>
                      <option value="sukabumi_kab">Kabupaten Sukabumi (Rp 8.000)</option>
                      <option value="jakarta">DKI Jakarta - Sameday Cold (Rp 20.000)</option>
                      <option value="bogor">Bogor - Sameday (Rp 15.000)</option>
                      <option value="depok_tangerang_bekasi">Depok / Tangerang / Bekasi (Rp 22.000)</option>
                      <option value="bandung">Bandung - Sameday (Rp 18.000)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Jadwal Slot Pengantaran:</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'pagi', label: 'Pagi', time: '06.00 - 09.00' },
                        { id: 'siang', label: 'Siang', time: '11.00 - 14.00' },
                        { id: 'sore', label: 'Sore', time: '16.00 - 18.00' }
                      ].map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => onChangeDeliverySlot(slot.id)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer shadow-sm dark:shadow-none ${
                            selectedDeliverySlot === slot.id
                              ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-300'
                              : 'bg-white dark:bg-black/40 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="text-[11px] font-bold">{slot.label}</div>
                          <div className="text-[9px] opacity-80">{slot.time}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Voucher Input */}
                <div className="space-y-2">
                  <form onSubmit={handleApplyVoucher} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Kode Voucher (SEGARHEMAT)"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/15 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 uppercase focus:outline-none focus:border-emerald-500 shadow-sm dark:shadow-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-zinc-100 dark:bg-white/10 hover:bg-emerald-500 hover:text-white dark:hover:text-zinc-950 text-zinc-700 dark:text-white text-xs font-bold rounded-xl transition-all border border-zinc-200 dark:border-white/10 cursor-pointer shadow-sm dark:shadow-none"
                    >
                      Pakai
                    </button>
                  </form>

                  {voucherError && (
                    <div className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {voucherError}
                    </div>
                  )}

                  {appliedVoucher && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between text-xs shadow-sm dark:shadow-none">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                        <span>Voucher <strong>{appliedVoucher.code}</strong> aktif (-{appliedVoucher.discountPercent}%)</span>
                      </div>
                      <button
                        onClick={() => onApplyVoucher(null)}
                        className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer underline"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bottom Summary & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/90 dark:bg-black/60 backdrop-blur-xl space-y-3 transition-colors duration-300">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal Sayuran</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{formatRupiah(subtotal)}</span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Diskon Voucher ({appliedVoucher.discountPercent}%)</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    Ongkos Kirim ({shippingInfo.name.split(' ')[0]})
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">GRATIS</span>
                    ) : (
                      formatRupiah(shippingCost)
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-zinc-900 dark:text-white">Total Pembayaran</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={onProceedCheckout}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-zinc-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>Lanjut ke Pengiriman & Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="text-center text-[10px] text-zinc-500 flex items-center justify-center gap-2">
                <span>🛡️ Garansi 100% Segar</span>
                <span>•</span>
                <span>⚡ Siap Antar Hari Ini</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
