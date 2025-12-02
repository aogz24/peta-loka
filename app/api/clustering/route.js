import { NextResponse } from "next/server";
import clusteringService from "@/lib/services/clustering";
import supabaseService from "@/lib/services/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const numClusters = parseInt(searchParams.get("clusters") || "5");

    // Fetch data from Supabase
    console.log("Fetching data from Supabase...");
    const { pelatihan: pelatihanData, umkm: umkmData, wisata: wisataData } = 
      await supabaseService.fetchAllTypes();

    // Validasi data
    if (!umkmData || !wisataData || !pelatihanData) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    console.log(
      "Loaded data from Supabase:",
      `UMKM(${umkmData.length}), Wisata(${wisataData.length}), Pelatihan(${pelatihanData.length})`
    );

    // Debug: Check sample data
    console.log("Sample UMKM data:", umkmData[0]);
    console.log("Sample Wisata data:", wisataData[0]);
    console.log("Sample Pelatihan data:", pelatihanData[0]);

    // Debug: Check each filter condition
    console.log("UMKM checks:", {
      hasType: umkmData.filter((i) => i.type === "umkm").length,
      hasCategory: umkmData.filter((i) => i.category).length,
      hasLat: umkmData.filter((i) => i.lat).length,
      hasLon: umkmData.filter((i) => i.lon).length,
      all: umkmData.filter(
        (i) => i.type === "umkm" && i.category && i.lat && i.lon
      ).length,
    });

    console.log("Clustering data:", {
      umkm: umkmData.length,
      wisata: wisataData.length,
      pelatihan: pelatihanData.length,
      clusters: numClusters,
    });

    // Lakukan clustering dan analisis
    const analysis = clusteringService.analyzeAll(
      umkmData,
      wisataData,
      pelatihanData,
      numClusters
    );

    return NextResponse.json({
      success: true,
      data: analysis,
      message: "Clustering completed successfully",
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

    return NextResponse.json({
      success: true,
      data: analysis,
      message: "Clustering completed successfully",
    });
  } catch (error) {
    console.error("Error in clustering API:", error);
    return NextResponse.json(
      { error: "Failed to perform clustering", details: error.message },
      { status: 500 }
    );
  }
}
