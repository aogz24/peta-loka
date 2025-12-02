import { NextResponse } from "next/server";
import supabaseService from "@/lib/services/supabase";

/**
 * GET /api/pelatihan
 * Fetch pelatihan data from Supabase
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

    const data = await supabaseService.fetchPelatihan(options);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      message: "Pelatihan data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching pelatihan data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pelatihan data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
