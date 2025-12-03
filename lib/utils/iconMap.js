import L from 'leaflet';
// Custom icons
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const icons = {
  umkm: createIcon('#3b82f6'), // blue
  wisata: createIcon('#10b981'), // green
  pelatihan: createIcon('#f59e0b'), // amber
  centroid: createIcon('#ef4444'), // red
};

export default icons;
