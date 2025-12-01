import { NextResponse } from "next/server";
import { generateAllDummyData } from "@/lib/data/dummy-data";

export async function POST(request) {
  try {
    const { lat, lon, radius = 5000 } = await request.json();

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Generate data dummy (menggantikan scraping OpenStreetMap)
    const data = generateAllDummyData(lat, lon, radius);

    return NextResponse.json({
      success: true,
      data,
      message: `Successfully generated ${data.total} dummy locations`,
    });
  } catch (error) {
    console.error("Error in scrape API:", error);
    return NextResponse.json(
      { error: "Failed to generate data", details: error.message },
      { status: 500 }
    );
  }
}
