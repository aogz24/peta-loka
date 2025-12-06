import { NextResponse } from "next/server";
import supabaseService from "@/lib/services/supabase";
import cacheManager from "@/lib/utils/cache";

/**
 * API untuk mengambil data dari Supabase berdasarkan radius
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    const { lat, lon, radius = 5000 } = await request.json();

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Check cache first (TTL: 15 minutes)
    const cacheKey = cacheManager.generateKey("scrape", { lat, lon, radius });
    const cachedResult = cacheManager.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
        processingTime: `${Date.now() - startTime}ms`,
      });
    }

    // Fetch data dari Supabase berdasarkan radius (optimized query)
    const result = await supabaseService.fetchByRadius(lat, lon, radius);

    const processingTime = Date.now() - startTime;

    const response = {
      success: true,
      data: {
        umkm: result.umkm,
        wisata: result.wisata,
        pelatihan: result.pelatihan,
      },
      total: result.total,
      radius: radius,
      center: { lat, lon },
      message: `Found ${result.total} items within ${radius}m radius from Supabase`,
      cached: false,
      processingTime: `${processingTime}ms`,
      performance:
        processingTime < 1000
          ? "excellent"
          : processingTime < 3000
          ? "good"
          : "slow",
    };

    // Store in cache (TTL: 15 minutes)
    cacheManager.set(cacheKey, response, 15 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in scrape API:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
