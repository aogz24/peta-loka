import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'PetaLoka',
  description: 'Platform Analisis dan Visualisasi UMKM serta Wisata Mikro Berbasis Lokasi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}>
        <Providers>
          <Nav />
          <main className="flex-1 dark:bg-black dark:text-white mt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
