'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import clusterColors from '@/constant/ClusterColor';
import icons from '@/lib/utils/iconMap';

// Fix untuk default marker icons di Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onSelectLocation }) {
  const map = useMap();
  useEffect(() => {
    const onClick = (e) => {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [map, onSelectLocation]);

  return null;
}

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
  radius = 500,
  umkmData = [],
  wisataData = [],
  pelatihanData = [],
  centroids = [],
  selectedItem = null,
  onMarkerClick = () => {},
  selectMode = false,
  onSelectLocation = () => {},
}) {
  // Memoize markers untuk performa
  const umkmMarkers = useMemo(() => umkmData.slice(0, 500), [umkmData]);
  const wisataMarkers = useMemo(() => wisataData.slice(0, 300), [wisataData]);
  const pelatihanMarkers = useMemo(() => pelatihanData.slice(0, 200), [pelatihanData]);

  console.log('radius di MapComponent:', radius);
  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} className="z-0">
        <MapController center={center} zoom={zoom} />

        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {selectMode && <MapClickHandler onSelectLocation={onSelectLocation} />}

        {!selectMode && (
          <>
            {/* Centroids dengan circle - render dulu agar di belakang */}
            {centroids.map((centroid, index) => {
              // Gunakan radius dari centroid jika ada, fallback ke radius global
              const centroidRadius = centroid.radius || radius;

              return (
                <div key={`centroid-${index}`}>
                  {centroidRadius && !isNaN(centroidRadius) && (
                    <Circle
                      center={[centroid.lat, centroid.lon]}
                      radius={centroidRadius}
                      pathOptions={{
                        color: clusterColors[index % clusterColors.length],
                        fillColor: clusterColors[index % clusterColors.length],
                        fillOpacity: 0.1,
                      }}
                    />
                  )}

                  <Marker position={[centroid.lat, centroid.lon]} icon={icons.centroid}>
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-red-600">Cluster Center {index + 1}</h3>
                        <p className="text-xs text-gray-500">
                          [{centroid.lat.toFixed(4)}, {centroid.lon.toFixed(4)}]
                        </p>
                        {centroid.radius && <p className="text-xs text-gray-500 mt-1">Radius: {centroid.radius >= 1000 ? `${(centroid.radius / 1000).toFixed(2)} km` : `${Math.round(centroid.radius)} m`}</p>}
                      </div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}

            {/* MarkerClusterGroup untuk UMKM */}
            <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={50}>
              {umkmMarkers.map((item, index) => (
                <Marker
                  key={`umkm-${item.id || index}`}
                  position={[item.lat, item.lon]}
                  icon={icons.umkm}
                  eventHandlers={{
                    click: () => onMarkerClick({ ...item, type: 'umkm' }),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-blue-600">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      {item.cluster !== undefined && <p className="text-xs font-semibold mt-1">Cluster: {item.cluster}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>

            {/* MarkerClusterGroup untuk Wisata */}
            <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={50}>
              {wisataMarkers.map((item, index) => (
                <Marker
                  key={`wisata-${item.id || index}`}
                  position={[item.lat, item.lon]}
                  icon={icons.wisata}
                  eventHandlers={{
                    click: () => onMarkerClick({ ...item, type: 'wisata' }),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-green-600">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>

            {/* Markers untuk Pelatihan - tidak perlu cluster karena sedikit */}
            {pelatihanMarkers.map((item, index) => (
              <Marker
                key={`pelatihan-${item.id || index}`}
                position={[item.lat, item.lon]}
                icon={icons.pelatihan}
                eventHandlers={{
                  click: () => onMarkerClick({ ...item, type: 'pelatihan' }),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-amber-600">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}
