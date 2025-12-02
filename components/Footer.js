export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm ">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600 dark:text-gray-200">
          <p>© {new Date().getFullYear()} PetaLoka UMKM - Powered by OpenStreetMap & Kolosal AI</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-100">Clustering dengan K-Means | AI Insight menggunakan Llama 4 Maverick</p>
        </div>
      </div>
    </footer>
  );
}
