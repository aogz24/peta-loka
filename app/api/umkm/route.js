import { NextResponse } from "next/server";
import supabaseService from "@/lib/services/supabase";

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

    const data = await supabaseService.fetchUmkm(options);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      message: "UMKM data fetched successfully",
    });
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
