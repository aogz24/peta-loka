import { NextResponse } from "next/server";
import OpenStreetMapService from "@/lib/services/openstreetmap";
import path from "path";
import { promises as fs } from "fs";

/**
 * API untuk scraping data dari OSM dan menyimpannya ke file JSON
 */
export async function POST(request) {
  try {
    const { lat, lon, radius = 5000 } = await request.json();

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // 🔥 1. SCRAPE DATA DARI OSM
    const data = await OpenStreetMapService.scrapeAll(lat, lon, radius);

    // 🔥 2. SIAPKAN PATH FILE PENYIMPANAN
    const basePath = path.join(process.cwd(), "lib", "data");

    // Pastikan folder exist
    await fs.mkdir(basePath, { recursive: true });

    // File JSON tujuan
    const umkmPath = path.join(basePath, "umkm.json");
    const wisataPath = path.join(basePath, "wisata.json");
    const pelatihanPath = path.join(basePath, "pelatihan.json");

    // 🔥 3. SIMPAN FILE
    await fs.writeFile(umkmPath, JSON.stringify(data.umkm, null, 2));
    await fs.writeFile(wisataPath, JSON.stringify(data.wisata, null, 2));
    await fs.writeFile(pelatihanPath, JSON.stringify(data.pelatihan, null, 2));

    return NextResponse.json({
      success: true,
      saved: {
        umkmPath,
        wisataPath,
        pelatihanPath,
      },
      total: data.total,
      message: `Successfully scraped & saved ${data.total} items`,
    });
  } catch (error) {
    console.error("Error in scrape API:", error);

    return NextResponse.json(
      { error: "Failed to scrape data", details: error.message },
      { status: 500 }
    );
  }
}
