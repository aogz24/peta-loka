'use client';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import clusterColors from '@/constant/ClusterColor';
import icons from '@/lib/utils/iconMap';

// Komponen kecil untuk memaksa map pindah center saat lat/lon berubah
function RecenterMap({ lat, lon }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), {
      animate: true,
    });
  }, [lat, lon, map]);

  return null;
}

export default function MapCard({ lat, lon, onClose, index, radius, isCluster = false, name }) {
  return (
    <div className="fixed bottom-4 right-4 w-[350px] md:w-[450px] h-[300px] bg-white dark:bg-gray-800 shadow-xl rounded-xl border z-50">
      <div className="flex justify-between items-center p-3  mx-2 ">
        <h3 className="font-bold text-gray-800 dark:text-gray-200">Lokasi Cluster {index + 1}</h3>
        <button onClick={onClose} className="font-bold">
          ✕
        </button>
      </div>

      <MapContainer center={[lat, lon]} zoom={15} className="w-full h-60 rounded-b-xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Recenter every time the props change */}
        <RecenterMap lat={lat} lon={lon} />

        {/* Marker will update automatically because props changed */}
        <div key={`centroid-${index}`}>
          {radius && !isNaN(radius) && (
            <Circle
              center={[lat, lon]}
              radius={radius}
              pathOptions={{
                color: clusterColors[index % clusterColors.length],
                fillColor: clusterColors[index % clusterColors.length],
                fillOpacity: 0.1,
              }}
            />
          )}
          <Marker position={[lat, lon]} icon={icons.centroid}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-red-600">Cluster Center {index + 1}</h3>
                <p className="text-xs text-gray-500">
                  [{lat.toFixed(4)}, {lon.toFixed(4)}]
                </p>
              </div>
            </Popup>
          </Marker>
        </div>
      </MapContainer>
    </div>
  );
}
