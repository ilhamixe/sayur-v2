'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CartItem, Voucher } from '../types';
import { 
  X, 
  Send, 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  User, 
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  Users
} from 'lucide-react';
import { SHIPPING_RATES } from '../data/products';


interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  selectedCity: string;
  selectedDeliverySlot: string;
  appliedVoucher: Voucher | null;
  onOrderCompleted: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  selectedCity,
  selectedDeliverySlot,
  appliedVoucher,
  onOrderCompleted
}: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer' | 'cod'>('qris');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notifyState, setNotifyState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [notifyResult, setNotifyResult] = useState<{ queued: number; unmapped: string[] } | null>(null);
  const [notifyError, setNotifyError] = useState<string | null>(null);

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

  const getSlotLabel = (slot: string) => {
    switch (slot) {
      case 'pagi': return 'Pagi (06.00 - 09.00 WIB)';
      case 'siang': return 'Siang (11.00 - 14.00 WIB)';
      case 'sore': return 'Sore (16.00 - 18.00 WIB)';
      default: return 'Pagi Hari';
    }
  };

  const handleOrderWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setFormError('Mohon lengkapi Nama, Nomor WhatsApp, dan Alamat Pengiriman.');
      return;
    }

    if (phone.trim().length < 8) {
      setFormError('Nomor WhatsApp tidak valid. Masukkan nomor yang benar.');
      return;
    }

    const randomId = 'SS-' + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomId);

    // Format WhatsApp message
    let message = `*PESANAN SAYUR SUKABUMI (#${randomId})*\n\n`;
    message += `👤 *Nama:* ${name.trim()}\n`;
    message += `📱 *No WA:* ${phone.trim()}\n`;
    message += `📍 *Alamat:* ${address.trim()}\n`;
    message += `🏙️ *Kota Tujuan:* ${shippingInfo.name}\n`;
    message += `⏰ *Slot Antar:* ${getSlotLabel(selectedDeliverySlot)}\n`;
    if (notes.trim()) message += `📝 *Catatan:* ${notes.trim()}\n`;
    message += `💳 *Pembayaran:* ${paymentMethod.toUpperCase()}\n\n`;

    message += `*DAFTAR SAYURAN & PESANAN:*\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} (${item.quantity}x @${formatRupiah(item.product.price)}) = ${formatRupiah(item.product.price * item.quantity)}\n`;
    });

    message += `\nSubtotal: ${formatRupiah(subtotal)}`;
    if (appliedVoucher) {
      message += `\nDiskon Voucher (${appliedVoucher.code}): -${formatRupiah(discountAmount)}`;
    }
    message += `\nOngkos Kirim: ${shippingCost === 0 ? 'GRATIS' : formatRupiah(shippingCost)}`;
    message += `\n*TOTAL PEMBAYARAN: ${formatRupiah(grandTotal)}*\n\n`;
    message += `Mohon konfirmasi pesanan dan ketersediaan kurir. Terima kasih Sayur Sukabumi! 🌱`;

    const encodedMessage = encodeURIComponent(message);
    
    // Read Admin WhatsApp from localStorage, fallback to default if not set
    const savedAdminPhone = localStorage.getItem('adminWhatsApp') || '6281234567890';
    const cleanAdminPhone = savedAdminPhone.replace(/\D/g, ''); // Remove non-numeric characters
    const waUrl = `https://wa.me/${cleanAdminPhone}?text=${encodedMessage}`;

    // Save order to localStorage for Admin Dashboard
    const currentOrders = JSON.parse(localStorage.getItem('sayur_orders') || '[]');
    currentOrders.push({
      id: randomId,
      date: new Date().toISOString(),
      customer: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      total: grandTotal,
      status: 'pending'
    });
    localStorage.setItem('sayur_orders', JSON.stringify(currentOrders));

    // Trigger celebration & success
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}

    setIsSuccess(true);
    // Dibuka sebelum await apa pun — window.open setelah await diblokir browser
    // karena kehilangan konteks klik pengguna.
    window.open(waUrl, '_blank');

    // Teruskan item ke supplier masing-masing lewat wa-notify. Gagal di sini
    // tidak boleh membatalkan order — pelanggan tetap dapat link WhatsApp CS.
    setNotifyState('sending');
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: randomId,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          note: notes.trim(),
          deliverySlot: getSlotLabel(selectedDeliverySlot),
          items: cart.map((item) => ({
            productId: item.product.id,
            category: item.product.category,
            name: item.product.name,
            qty: item.quantity,
            price: item.product.price,
            unit: item.product.unit,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim notifikasi supplier.');
      setNotifyResult({ queued: data.queued ?? 0, unmapped: data.unmapped ?? [] });
      setNotifyState('ok');
    } catch (err) {
      setNotifyState('error');
      setNotifyError((err as Error).message);
    }
  };

  const handleCopyBCA = () => {
    navigator.clipboard.writeText('8830918239');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleFinish = () => {
    setIsSuccess(false);
    setNotifyState('idle');
    setNotifyResult(null);
    setNotifyError(null);
    onOrderCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 transition-colors">
      <div 
        className="relative w-full max-w-xl bg-white/95 dark:bg-zinc-950 border border-zinc-200 dark:border-white/15 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl max-h-[92vh] flex flex-col transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">
                {isSuccess ? 'Pesanan Berhasil Dibuat!' : 'Formulir Pemesanan Sayur'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isSuccess ? 'Siap diproses & dikemas subuh ini' : 'Pengiriman langsung dari kebun Sukabumi'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {isSuccess ? (
            /* Success Screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">NOMOR INVOICE: {orderNumber}</div>
                <h4 className="text-2xl font-black text-zinc-900 dark:text-white">Terima Kasih, {name}!</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Format rincian pesanan telah dikirimkan ke WhatsApp Customer Service. Kurir kami akan segera menyiapkan sayur segar Anda.
                </p>
              </div>

              {/* Payment Details Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-left space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Rincian Pembayaran ({paymentMethod.toUpperCase()}):
                </div>

                {paymentMethod === 'qris' && (
                  <div className="flex flex-col items-center p-3 rounded-xl bg-white text-zinc-950 text-center space-y-2 border border-zinc-200 dark:border-transparent">
                    <QrCode className="w-24 h-24 text-zinc-900" />
                    <div className="text-xs font-bold">Scan QRIS Sayur Sukabumi</div>
                    <div className="text-xs text-zinc-600">Total: <strong>{formatRupiah(grandTotal)}</strong></div>
                  </div>
                )}

                {paymentMethod === 'transfer' && (
                  <div className="p-3 rounded-xl bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300">
                      <span>Bank BCA: <strong>8830918239</strong> (a.n Sayur Sukabumi)</span>
                      <button 
                        onClick={handleCopyBCA}
                        className="px-2 py-1 bg-zinc-100 dark:bg-white/10 hover:bg-emerald-500 hover:text-white dark:hover:text-zinc-950 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedBank ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Jumlah: {formatRupiah(grandTotal)}</div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                    💵 Siapkan uang pas <strong>{formatRupiah(grandTotal)}</strong> saat kurir tiba di alamat Anda.
                  </div>
                )}

                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Jadwal Antar: <strong className="text-zinc-700 dark:text-zinc-300">{getSlotLabel(selectedDeliverySlot)}</strong></span>
                </div>
              </div>

              {/* Status penerusan ke supplier */}
              {notifyState === 'sending' && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <Users className="w-4 h-4 animate-pulse text-emerald-500" />
                  Meneruskan pesanan ke supplier...
                </div>
              )}

              {notifyState === 'ok' && notifyResult && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-left space-y-1">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {notifyResult.queued > 0
                      ? `Pesanan diteruskan ke ${notifyResult.queued} supplier`
                      : 'Belum ada supplier terdaftar untuk item ini'}
                  </div>
                  {notifyResult.unmapped.length > 0 && (
                    <p className="text-amber-700 dark:text-amber-300">
                      Perlu ditangani manual: {notifyResult.unmapped.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {notifyState === 'error' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs text-left text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                  <span>
                    Pesanan Anda tersimpan, tapi notifikasi otomatis ke supplier gagal ({notifyError}).
                    Admin akan menindaklanjuti lewat WhatsApp.
                  </span>
                </div>
              )}

              <button
                onClick={handleFinish}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white dark:text-zinc-950 font-black text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/20"
              >
                Selesai & Kembali ke Beranda
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleOrderWhatsApp} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <ShieldCheck className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Recipient Form */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> 1. Data Penerima Sayur
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ibu Linda Marlina"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm dark:shadow-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">No. WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm dark:shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">Alamat Lengkap & Patokan Rumah *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jl. Selabintana No. 12, RT 02/05 (Pagar Hitam Depan Masjid), Cisaat, Sukabumi"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm dark:shadow-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">Catatan Khusus Sayuran (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tolong pilih kangkung daun muda, cabe minta pedas"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm dark:shadow-none"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-white/10">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> 2. Metode Pembayaran
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'qris', label: 'QRIS Instan', icon: QrCode, desc: 'BCA/Gopay/Shopee' },
                    { id: 'transfer', label: 'Transfer Bank', icon: CreditCard, desc: 'BCA/Mandiri/BRI' },
                    { id: 'cod', label: 'COD (Bayar di Tempat)', icon: Banknote, desc: 'Bayar saat sayur tiba' }
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id as 'qris' | 'transfer' | 'cod')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-sm dark:shadow-none ${
                          paymentMethod === p.id
                            ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-zinc-900 dark:text-white shadow-md shadow-emerald-500/10'
                            : 'bg-white dark:bg-white/[0.03] border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${paymentMethod === p.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                        <div>
                          <div className="text-xs font-bold leading-tight">{p.label}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{p.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Overview Summary */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <span>Total Produk ({cart.length} item):</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <span>Ongkos Kirim ({shippingInfo.name.split(' ')[0]}):</span>
                  <span>{shippingCost === 0 ? <strong className="text-emerald-600 dark:text-emerald-400">GRATIS</strong> : formatRupiah(shippingCost)}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                    <span>Diskon Voucher ({appliedVoucher.code}):</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex justify-between items-baseline">
                  <span className="font-bold text-zinc-900 dark:text-white text-xs">Total Pembayaran:</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-zinc-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>Kirim Pesanan Langsung ke WhatsApp</span>
                </button>
                <div className="text-center text-[10px] text-zinc-500 mt-2">
                  🔒 Data Anda terlindungi. Pesanan langsung diverifikasi oleh Admin Sayur Sukabumi.
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
