/**
 * Service untuk menyediakan data dummy UMKM, Wisata, dan Pelatihan
 * Sebagai pengganti scraping OpenStreetMap
 */

/**
 * Generate data dummy UMKM di sekitar koordinat tertentu
 */
export function generateDummyUMKM(lat, lon, radius = 5000) {
  const categories = [
    "shop",
    "restaurant",
    "cafe",
    "bakery",
    "handicraft",
    "clothing",
    "grocery",
    "furniture",
    "electronics",
    "bookstore",
  ];
  const umkmData = [];

  // Generate 30-50 UMKM random
  const count = Math.floor(Math.random() * 20) + 30;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * (radius / 111320); // Convert meters to degrees

    const newLat = lat + distance * Math.cos(angle);
    const newLon = lon + distance * Math.sin(angle);

    const category = categories[Math.floor(Math.random() * categories.length)];

    umkmData.push({
      id: `umkm-${i + 1}`,
      type: "umkm",
      name: generateUMKMName(category, i),
      category,
      lat: newLat,
      lon: newLon,
      address: `Jl. ${generateStreetName()} No. ${
        Math.floor(Math.random() * 100) + 1
      }`,
      phone: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
      website: Math.random() > 0.7 ? `https://umkm${i}.com` : "",
      openingHours: "08:00-20:00",
      description: `UMKM ${category} berkualitas dengan produk lokal unggulan`,
      tags: { shop: category },
    });
  }

  return umkmData;
}

/**
 * Generate data dummy wisata mikro
 */
export function generateDummyWisata(lat, lon, radius = 5000) {
  const categories = [
    "museum",
    "park",
    "cafe",
    "restaurant",
    "gallery",
    "viewpoint",
    "garden",
    "cultural_center",
    "theater",
  ];
  const wisataData = [];

  // Generate 20-30 wisata
  const count = Math.floor(Math.random() * 10) + 20;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * (radius / 111320);

    const newLat = lat + distance * Math.cos(angle);
    const newLon = lon + distance * Math.sin(angle);

    const category = categories[Math.floor(Math.random() * categories.length)];

    wisataData.push({
      id: `wisata-${i + 1}`,
      type: "wisata",
      name: generateWisataName(category, i),
      category,
      lat: newLat,
      lon: newLon,
      address: `Jl. ${generateStreetName()} No. ${
        Math.floor(Math.random() * 100) + 1
      }`,
      phone: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
      website: Math.random() > 0.6 ? `https://wisata${i}.com` : "",
      openingHours: "09:00-21:00",
      description: `Destinasi wisata mikro dengan nuansa ${category}`,
      tags: { tourism: category },
    });
  }

  return wisataData;
}

/**
 * Generate data dummy tempat pelatihan
 */
export function generateDummyPelatihan(lat, lon, radius = 5000) {
  const categories = [
    "training",
    "school",
    "community_centre",
    "college",
    "workshop",
  ];
  const pelatihanData = [];

  // Generate 10-15 tempat pelatihan
  const count = Math.floor(Math.random() * 5) + 10;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * (radius / 111320);

    const newLat = lat + distance * Math.cos(angle);
    const newLon = lon + distance * Math.sin(angle);

    const category = categories[Math.floor(Math.random() * categories.length)];

    pelatihanData.push({
      id: `pelatihan-${i + 1}`,
      type: "pelatihan",
      name: generatePelatihanName(category, i),
      category,
      lat: newLat,
      lon: newLon,
      address: `Jl. ${generateStreetName()} No. ${
        Math.floor(Math.random() * 100) + 1
      }`,
      phone: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
      website: Math.random() > 0.5 ? `https://pelatihan${i}.com` : "",
      openingHours: "08:00-17:00",
      description: `Tempat pelatihan UMKM dan pengembangan skill`,
      tags: { amenity: category },
    });
  }

  return pelatihanData;
}

/**
 * Generate semua data dummy sekaligus
 */
export function generateAllDummyData(lat, lon, radius = 5000) {
  const umkm = generateDummyUMKM(lat, lon, radius);
  const wisata = generateDummyWisata(lat, lon, radius);
  const pelatihan = generateDummyPelatihan(lat, lon, radius);

  return {
    umkm,
    wisata,
    pelatihan,
    total: umkm.length + wisata.length + pelatihan.length,
  };
}

// Helper functions untuk generate names
function generateUMKMName(category, index) {
  const prefixes = [
    "Toko",
    "Warung",
    "Kedai",
    "Usaha",
    "Toko",
    "Bengkel",
    "Rumah",
  ];
  const suffixes = [
    "Sejahtera",
    "Makmur",
    "Jaya",
    "Berkah",
    "Bahagia",
    "Sentosa",
    "Mulia",
    "Sukses",
  ];

  const categoryNames = {
    shop: "Toko Kelontong",
    restaurant: "Rumah Makan",
    cafe: "Kedai Kopi",
    bakery: "Toko Roti",
    handicraft: "Kerajinan",
    clothing: "Butik",
    grocery: "Toko Sembako",
    furniture: "Mebel",
    electronics: "Elektronik",
    bookstore: "Toko Buku",
  };

  return `${categoryNames[category] || "Usaha"} ${
    suffixes[index % suffixes.length]
  } ${index + 1}`;
}

function generateWisataName(category, index) {
  const categoryNames = {
    museum: "Museum",
    park: "Taman",
    cafe: "Kafe Wisata",
    restaurant: "Resto",
    gallery: "Galeri",
    viewpoint: "Spot Foto",
    garden: "Kebun",
    cultural_center: "Pusat Budaya",
    theater: "Gedung Pertunjukan",
  };

  const names = [
    "Indah",
    "Asri",
    "Sejuk",
    "Cantik",
    "Permai",
    "Hijau",
    "Megah",
    "Anggun",
  ];

  return `${categoryNames[category] || "Wisata"} ${
    names[index % names.length]
  } ${index + 1}`;
}

function generatePelatihanName(category, index) {
  const categoryNames = {
    training: "Balai Pelatihan",
    school: "Sekolah",
    community_centre: "Balai Warga",
    college: "Akademi",
    workshop: "Workshop",
  };

  const names = [
    "Mandiri",
    "Kreatif",
    "Inovatif",
    "Produktif",
    "Terampil",
    "Cerdas",
    "Maju",
    "Berdaya",
  ];

  return `${categoryNames[category] || "Pelatihan"} ${
    names[index % names.length]
  } ${index + 1}`;
}

function generateStreetName() {
  const streets = [
    "Merdeka",
    "Sudirman",
    "Diponegoro",
    "Ahmad Yani",
    "Gatot Subroto",
    "Veteran",
    "Pemuda",
    "Pahlawan",
    "Soekarno Hatta",
    "Kartini",
    "Raya Kemang",
    "Mangga Besar",
    "Kebon Jeruk",
    "Cikini",
    "Menteng",
  ];

  return streets[Math.floor(Math.random() * streets.length)];
}

export default {
  generateDummyUMKM,
  generateDummyWisata,
  generateDummyPelatihan,
  generateAllDummyData,
};
