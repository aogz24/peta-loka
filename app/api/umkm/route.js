import { NextResponse } from "next/server";
import supabaseService from "@/lib/services/supabase";
import cacheManager from "@/lib/utils/cache";

/**
 * GET /api/umkm
 * Fetch UMKM data from Supabase
 *
 * Query parameters:
 * - category: Filter by category
 * - limit: Limit number of results
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");

    const options = {};
    if (category) options.category = category;
    if (limit) options.limit = parseInt(limit);

    // Check cache first (TTL: 10 minutes)
    const cacheKey = cacheManager.generateKey("umkm", options);
    const cachedResult = cacheManager.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const data = await supabaseService.fetchUmkm(options);

    const response = {
      success: true,
      data,
      count: data.length,
      message: "UMKM data fetched successfully",
      cached: false,
    };

    // Store in cache (TTL: 10 minutes)
    cacheManager.set(cacheKey, response, 10 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching UMKM data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch UMKM data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
