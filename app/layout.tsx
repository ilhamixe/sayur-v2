import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SayurSukabumi — Sayur & Buah Segar Langsung dari Petani',
  description:
    'Sayuran hidroponik, sayur organik, bumbu dapur, dan buah segar dipetik subuh dari lereng Gunung Gede & Salak, Sukabumi. Gratis ongkir Sukabumi Kota.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body>{children}</body>
    </html>
  );
}
