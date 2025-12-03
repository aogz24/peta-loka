import { NextResponse } from "next/server";
import supabaseService from "@/lib/services/supabase";

/**
 * API untuk mengambil data dari Supabase berdasarkan radius
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

    // Fetch data dari Supabase berdasarkan radius
    const result = await supabaseService.fetchByRadius(lat, lon, radius);

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error in scrape API:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
