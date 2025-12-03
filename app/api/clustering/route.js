import { NextResponse } from "next/server";
import clusteringService from "@/lib/services/clustering";
import supabaseService from "@/lib/services/supabase";
import cacheManager from "@/lib/utils/cache";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const numClusters = parseInt(searchParams.get("clusters") || "5");

    // Check cache first (TTL: 30 minutes)
    const cacheKey = cacheManager.generateKey("clustering", { numClusters });
    const cachedResult = cacheManager.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult,
        message: "Clustering result from cache",
        cached: true,
      });
    }

    const {
      pelatihan: pelatihanData,
      umkm: umkmData,
      wisata: wisataData,
    } = await supabaseService.fetchAllTypes();

    // Validasi data
    if (!umkmData || !wisataData || !pelatihanData) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    // Lakukan clustering dan analisis
    const analysis = clusteringService.analyzeAll(
      umkmData,
      wisataData,
      pelatihanData,
      numClusters
    );

    // Store in cache (TTL: 30 minutes)
    cacheManager.set(cacheKey, analysis, 30 * 60 * 1000);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: "Clustering completed successfully",
      cached: false,
    });
  } catch (error) {
    console.error("Error in clustering API:", error);
    return NextResponse.json(
      { error: "Failed to perform clustering", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      umkmData: customUmkm,
      wisataData: customWisata,
      pelatihanData: customPelatihan,
      numClusters = 5,
    } = await request.json();

    // Generate cache key for POST requests
    const cacheKey = cacheManager.generateKey("clustering-post", {
      hasCustomUmkm: !!customUmkm,
      hasCustomWisata: !!customWisata,
      hasCustomPelatihan: !!customPelatihan,
      numClusters,
      umkmCount: customUmkm?.length || 0,
      wisataCount: customWisata?.length || 0,
      pelatihanCount: customPelatihan?.length || 0,
    });

    // Check cache first
    const cachedResult = cacheManager.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult,
        message: "Clustering result from cache",
        cached: true,
      });
    }

    let finalUmkm, finalWisata, finalPelatihan;

    // Gunakan data dari Supabase jika tidak ada custom data
    if (!customUmkm || !customWisata || !customPelatihan) {
      const data = await supabaseService.fetchAllTypes();
      finalUmkm = customUmkm || data.umkm;
      finalWisata = customWisata || data.wisata;
      finalPelatihan = customPelatihan || data.pelatihan;
    } else {
      finalUmkm = customUmkm;
      finalWisata = customWisata;
      finalPelatihan = customPelatihan;
    }

    if (!finalUmkm || !finalWisata || !finalPelatihan) {
      return NextResponse.json(
        { error: "UMKM, wisata, and pelatihan data are required" },
        { status: 400 }
      );
    }

    // Lakukan clustering dan analisis
    const analysis = clusteringService.analyzeAll(
      finalUmkm,
      finalWisata,
      finalPelatihan,
      numClusters
    );

    // Store in cache (TTL: 30 minutes)
    cacheManager.set(cacheKey, analysis, 30 * 60 * 1000);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: "Clustering completed successfully",
      cached: false,
    });
  } catch (error) {
    console.error("Error in clustering API:", error);
    return NextResponse.json(
      { error: "Failed to perform clustering", details: error.message },
      { status: 500 }
    );
  }
}
