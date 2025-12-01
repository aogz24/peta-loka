import { NextResponse } from "next/server";
import kolosalAIService from "@/lib/services/kolosal-ai";
import { generateAllDummyData } from "@/lib/data/dummy-data";
import { performClustering } from "@/lib/services/clustering";

export async function POST(request) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: "Type and data are required" },
        { status: 400 }
      );
    }

    let insight;

    switch (type) {
      case "clustering":
        insight = await kolosalAIService.generateClusteringInsight(data);
        break;

      case "umkm-recommendation":
        insight = await kolosalAIService.generateUMKMRecommendation(
          data.umkmData,
          data.clusterInfo,
          data.nearbyWisata
        );
        break;

      case "area-potential":
        // Jika ada koordinat, ambil data berdasarkan koordinat
        if (data.latitude && data.longitude) {
          const { latitude, longitude, radius = 5000 } = data;
          
          // Generate data dummy berdasarkan koordinat
          const locationData = generateAllDummyData(latitude, longitude, radius);
          
          // Hitung statistik area
          const categoryCount = {};
          locationData.umkm.forEach(item => {
            categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
          });
          
          // Cari pelatihan terdekat
          const nearestTraining = locationData.pelatihan
            .map(training => {
              const distance = calculateDistance(
                latitude, 
                longitude, 
                training.lat, 
                training.lon
              );
              return { ...training, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);
          
          const areaData = {
            umkmCount: locationData.umkm.length,
            wisataCount: locationData.wisata.length,
            categories: categoryCount,
            nearestTraining,
            location: {
              latitude,
              longitude,
              radius
            }
          };
          
          insight = await kolosalAIService.analyzeAreaPotential(areaData);
        } else {
          // Fallback ke data clustering jika tidak ada koordinat
          insight = await kolosalAIService.analyzeAreaPotential(data);
        }
        break;

      case "chat":
        insight = await kolosalAIService.chat(data.query, data.context);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid insight type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      insight,
      type,
    });
  } catch (error) {
    console.error("Error in AI agent API:", error);
    return NextResponse.json(
      { error: "Failed to generate insight", details: error.message },
      { status: 500 }
    );
  }
}

// Helper function untuk menghitung jarak antara dua koordinat (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam km
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}
