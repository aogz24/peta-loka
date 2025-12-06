import { NextResponse } from "next/server";
import clusteringService from "@/lib/services/clustering";
import supabaseService from "@/lib/services/supabase";
import cacheManager from "@/lib/utils/cache";

export async function GET(request) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const numClustersParam = searchParams.get("clusters");
    // Jika clusters tidak ditentukan atau "auto", gunakan Silhouette Coefficient
    const numClusters =
      numClustersParam && numClustersParam !== "auto"
        ? parseInt(numClustersParam)
        : null;

    // Check cache first (TTL: 30 minutes)
    const cacheKey = cacheManager.generateKey("clustering", {
      numClusters: numClusters || "auto",
    });
    const cachedResult = cacheManager.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult,
        message: "Clustering result from cache (instant)",
        cached: true,
        processingTime: `${Date.now() - startTime}ms`,
      });
    }

    console.log("[Clustering] Starting data fetch...");

    const {
      pelatihan: pelatihanData,
      umkm: umkmData,
      wisata: wisataData,
    } = await supabaseService.fetchAllTypes();

    // Validasi data
    if (!umkmData || !wisataData || !pelatihanData) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    const fetchTime = Date.now();
    console.log(`[Clustering] Data fetched in ${fetchTime - startTime}ms`);
    console.log(
      `[Clustering] Data: ${umkmData?.length || 0} UMKM, ${
        wisataData?.length || 0
      } Wisata, ${pelatihanData?.length || 0} Pelatihan`
    );

    // Lakukan clustering dan analisis
    console.log("[Clustering] Starting clustering analysis...");
    const clusterStartTime = Date.now();

    // Jika numClusters null, akan otomatis menggunakan Silhouette Coefficient
    const analysis = clusteringService.analyzeAll(
      umkmData,
      wisataData,
      pelatihanData,
      numClusters
    );

    const clusterTime = Date.now() - clusterStartTime;
    const totalTime = Date.now() - startTime;
    console.log(`[Clustering] Clustering completed in ${clusterTime}ms`);
    console.log(`[Clustering] Total processing: ${totalTime}ms`);

    // Store in cache (TTL: 30 minutes)
    cacheManager.set(cacheKey, analysis, 30 * 60 * 1000);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: numClusters
        ? "Clustering completed successfully with manual cluster count"
        : "Clustering completed successfully with optimal cluster count (MiniBatch K-Means)",
      cached: false,
      processingTime: `${totalTime}ms`,
      performance: {
        dataFetch: `${fetchTime - startTime}ms`,
        clustering: `${clusterTime}ms`,
        total: `${totalTime}ms`,
        rating:
          totalTime < 2000 ? "excellent" : totalTime < 5000 ? "good" : "slow",
      },
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
  const startTime = Date.now();

  try {
    const {
      umkmData: customUmkm,
      wisataData: customWisata,
      pelatihanData: customPelatihan,
      numClusters,
    } = await request.json();

    // Jika numClusters tidak ditentukan atau "auto", gunakan Silhouette Coefficient
    const finalNumClusters =
      numClusters === "auto" || !numClusters ? null : numClusters;

    // Generate cache key for POST requests
    const cacheKey = cacheManager.generateKey("clustering-post", {
      hasCustomUmkm: !!customUmkm,
      hasCustomWisata: !!customWisata,
      hasCustomPelatihan: !!customPelatihan,
      numClusters: finalNumClusters || "auto",
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
        processingTime: `${Date.now() - startTime}ms`,
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
    // Jika finalNumClusters null, akan otomatis menggunakan Silhouette Coefficient
    const analysis = clusteringService.analyzeAll(
      finalUmkm,
      finalWisata,
      finalPelatihan,
      finalNumClusters
    );

    // Store in cache (TTL: 30 minutes)
    cacheManager.set(cacheKey, analysis, 30 * 60 * 1000);

    return NextResponse.json({
      success: true,
      data: analysis,
      message: finalNumClusters
        ? "Clustering completed successfully with manual cluster count"
        : "Clustering completed successfully with optimal cluster count (Silhouette Coefficient)",
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
