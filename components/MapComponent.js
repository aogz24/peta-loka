"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix untuk default marker icons di Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const createIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const icons = {
  umkm: createIcon("#3b82f6"), // blue
  wisata: createIcon("#10b981"), // green
  pelatihan: createIcon("#f59e0b"), // amber
  centroid: createIcon("#ef4444"), // red
};

function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapComponent({
  center = [-6.2088, 106.8456],
  zoom = 12,
  umkmData = [],
  wisataData = [],
  pelatihanData = [],
  centroids = [],
  selectedItem = null,
  onMarkerClick = () => {},
}) {
  const clusterColors = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
    "#84cc16",
  ];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Markers untuk UMKM */}
        {umkmData.map((item, index) => (
          <Marker
            key={`umkm-${item.id || index}`}
            position={[item.lat, item.lon]}
            icon={icons.umkm}
            eventHandlers={{
              click: () => onMarkerClick({ ...item, type: "umkm" }),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-blue-600">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Kategori: {item.category}
                </p>
                {item.address && (
                  <p className="text-xs text-gray-500">{item.address}</p>
                )}
                {item.cluster !== undefined && (
                  <p className="text-xs font-semibold mt-1">
                    Cluster: {item.cluster}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Markers untuk Wisata */}
        {wisataData.map((item, index) => (
          <Marker
            key={`wisata-${item.id || index}`}
            position={[item.lat, item.lon]}
            icon={icons.wisata}
            eventHandlers={{
              click: () => onMarkerClick({ ...item, type: "wisata" }),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-green-600">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Kategori: {item.category}
                </p>
                {item.address && (
                  <p className="text-xs text-gray-500">{item.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Markers untuk Pelatihan */}
        {pelatihanData.map((item, index) => (
          <Marker
            key={`pelatihan-${item.id || index}`}
            position={[item.lat, item.lon]}
            icon={icons.pelatihan}
            eventHandlers={{
              click: () => onMarkerClick({ ...item, type: "pelatihan" }),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-amber-600">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Kategori: {item.category}
                </p>
                {item.address && (
                  <p className="text-xs text-gray-500">{item.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Centroids dengan circle */}
        {centroids.map((centroid, index) => (
          <div key={`centroid-${index}`}>
            <Circle
              center={[centroid.lat, centroid.lon]}
              radius={500}
              pathOptions={{
                color: clusterColors[index % clusterColors.length],
                fillColor: clusterColors[index % clusterColors.length],
                fillOpacity: 0.1,
              }}
            />
            <Marker
              position={[centroid.lat, centroid.lon]}
              icon={icons.centroid}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-red-600">
                    Cluster Center {index + 1}
                  </h3>
                  <p className="text-xs text-gray-500">
                    [{centroid.lat.toFixed(4)}, {centroid.lon.toFixed(4)}]
                  </p>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
