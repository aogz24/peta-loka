import { NextResponse } from "next/server";
import clusteringService from "@/lib/services/clustering";

export async function POST(request) {
  try {
    const {
      umkmData,
      wisataData,
      pelatihanData,
      numClusters = 5,
    } = await request.json();

    if (!umkmData || !wisataData || !pelatihanData) {
      return NextResponse.json(
        { error: "UMKM, wisata, and pelatihan data are required" },
        { status: 400 }
      );
    }

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
