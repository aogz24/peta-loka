/**
 * API Route: Competitor Analysis
 * Endpoint untuk analisis kompetitor dalam radius tertentu
 */

import { NextResponse } from "next/server";
import {
  analyzeCompetitors,
  compareLocations,
  findMarketGaps,
} from "@/lib/services/competitor-analysis";
import supabaseService from "@/lib/services/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const category = searchParams.get("category") || "";
    const radius = parseFloat(searchParams.get("radius")) || 1.0;
    const includeAllCategories = searchParams.get("includeAll") === "true";

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: "Latitude and longitude required" },
        { status: 400 }
      );
    }

    // Fetch UMKM data
    const umkmData = await supabaseService.fetchUmkm();

    const targetLocation = { lat, lng, category };

    const analysis = analyzeCompetitors(targetLocation, umkmData, {
      radius,
      includeAllCategories,
      maxCompetitors: 50,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Competitor analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    const umkmData = await supabaseService.fetchUmkm();

    if (type === "compare") {
      // Compare two locations
      const { location1, location2, radius = 1.0 } = params;

      if (!location1 || !location2) {
        return NextResponse.json(
          { success: false, error: "Two locations required for comparison" },
          { status: 400 }
        );
      }

      const comparison = compareLocations(location1, location2, umkmData, {
        radius,
      });

      return NextResponse.json({
        success: true,
        type: "compare",
        comparison,
      });
    } else if (type === "gaps") {
      // Find market gaps
      const { location, radius = 1.0, allCategories = [] } = params;

      if (!location) {
        return NextResponse.json(
          { success: false, error: "Location required" },
          { status: 400 }
        );
      }

      const gaps = findMarketGaps(location, umkmData, allCategories, {
        radius,
      });

      return NextResponse.json({
        success: true,
        type: "gaps",
        gaps,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Use "compare" or "gaps"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Competitor analysis POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
