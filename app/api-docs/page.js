"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Import Swagger UI React dynamically to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    // Load OpenAPI spec
    fetch("/openapi.json")
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error("Error loading OpenAPI spec:", err));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Peta Loka API Documentation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Dokumentasi lengkap API untuk sistem rekomendasi lokasi UMKM
            berbasis data spasial
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {spec ? (
            <SwaggerUI
              spec={spec}
              docExpansion="list"
              defaultModelsExpandDepth={1}
              defaultModelExpandDepth={1}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Loading API Documentation...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Getting Started
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-lg mb-2">Base URL</h3>
              <code className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">
                /api
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Response Format</h3>
              <p>Semua response dalam format JSON dengan struktur standar:</p>
              <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded mt-2 overflow-x-auto">
                {`{
  "success": true,
  "data": [...],
  "message": "Success message",
  "cached": false
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Fitur Utama</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Data Endpoints:</strong> Akses data UMKM, Wisata, dan
                  Pelatihan
                </li>
                <li>
                  <strong>Clustering Analysis:</strong> Analisis clustering
                  menggunakan K-Means
                </li>
                <li>
                  <strong>Competitor Analysis:</strong> Analisis kompetitor
                  dalam radius tertentu
                </li>
                <li>
                  <strong>Location Prediction:</strong> Prediksi lokasi
                  potensial untuk UMKM baru
                </li>
                <li>
                  <strong>Recommendations:</strong> Sistem rekomendasi
                  personalized
                </li>
                <li>
                  <strong>AI Agent:</strong> Chatbot AI untuk insight dan
                  rekomendasi
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Caching</h3>
              <p>
                API menggunakan caching untuk meningkatkan performa. Response
                yang di-cache akan memiliki field{" "}
                <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  cached: true
                </code>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Example Usage
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Fetch UMKM Data
              </h3>
              <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
                {`// GET /api/umkm?category=Kuliner&limit=10
fetch('/api/umkm?category=Kuliner&limit=10')
  .then(res => res.json())
  .then(data => console.log(data));`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Competitor Analysis
              </h3>
              <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
                {`// GET /api/competitor-analysis
fetch('/api/competitor-analysis?lat=-6.9147&lng=107.6098&category=Kuliner&radius=2')
  .then(res => res.json())
  .then(data => console.log(data));`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Get Recommendations
              </h3>
              <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
                {`// POST /api/recommendations
fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'personalized',
    behaviors: [
      { itemId: '1', action: 'view', category: 'Kuliner', timestamp: Date.now() }
    ]
  })
})
  .then(res => res.json())
  .then(data => console.log(data));`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
