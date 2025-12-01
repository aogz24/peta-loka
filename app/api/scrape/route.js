import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Haversine formula untuk menghitung jarak
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meter
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function filterByRadius(data, lat, lon, radius) {
  return data.filter((item) => {
    const d = haversine(lat, lon, item.lat, item.lon);
    return d <= radius;
  });
}

export async function POST(request) {
  try {
    const { lat, lon, radius = 5000 } = await request.json();

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Load data OSM yang sudah disimpan
    const umkm = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "lib/data/umkm.json"), "utf-8")
    );

    const wisata = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "lib/data/wisata.json"), "utf-8")
    );

    const pelatihan = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "lib/data/pelatihan.json"), "utf-8")
    );

    // Filter berdasarkan radius
    const umkmFiltered = filterByRadius(umkm, lat, lon, radius);
    const wisataFiltered = filterByRadius(wisata, lat, lon, radius);
    const pelatihanFiltered = filterByRadius(pelatihan, lat, lon, radius);

    return NextResponse.json({
      success: true,
      data: {
        umkm: umkmFiltered,
        wisata: wisataFiltered,
        pelatihan: pelatihanFiltered,
      },
      total:
        umkmFiltered.length +
        wisataFiltered.length +
        pelatihanFiltered.length,
      message: "Filtered existing OSM data",
    });
  } catch (error) {
    console.error("Error in scrape API:", error);
    return NextResponse.json(
      { error: "Failed to generate data", details: error.message },
      { status: 500 }
    );
  }
}
