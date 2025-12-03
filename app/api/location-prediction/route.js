/**
 * API Route: Location Prediction
 * Endpoint untuk prediksi lokasi potensial UMKM baru
 */

import { NextResponse } from 'next/server';
import { 
  findPotentialLocations, 
  analyzeSpecificLocation 
} from '@/lib/services/location-prediction';
import supabaseService from '@/lib/services/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const mode = searchParams.get('mode') || 'scan'; // 'scan' atau 'analyze'
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const gridSize = parseFloat(searchParams.get('gridSize')) || 0.5;
    const topN = parseInt(searchParams.get('topN')) || 10;
    const minScore = parseFloat(searchParams.get('minScore')) || 50;
    const searchRadius = parseFloat(searchParams.get('searchRadius')) || 1.0;

    // Fetch data dari Supabase
    const [umkmData, wisataData, pelatihanData] = await Promise.all([
      supabaseService.fetchUmkm(),
      supabaseService.fetchWisata(),
      supabaseService.fetchPelatihan()
    ]);

    if (mode === 'analyze' && lat && lng) {
      // Analyze specific location
      const result = analyzeSpecificLocation(
        parseFloat(lat),
        parseFloat(lng),
        umkmData,
        wisataData,
        pelatihanData,
        { searchRadius }
      );

      return NextResponse.json({
        success: true,
        mode: 'analyze',
        result
      });
    } else {
      // Scan area untuk top potential locations
      const bounds = searchParams.get('bounds') 
        ? JSON.parse(searchParams.get('bounds'))
        : null;

      const topLocations = findPotentialLocations(
        umkmData,
        wisataData,
        pelatihanData,
        {
          bounds,
          gridSize,
          topN,
          minScore,
          searchRadius
        }
      );

      return NextResponse.json({
        success: true,
        mode: 'scan',
        count: topLocations.length,
        locations: topLocations
      });
    }
  } catch (error) {
    console.error('Location prediction error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { locations = [], searchRadius = 1.0 } = body;

    // Batch analyze multiple locations
    const [umkmData, wisataData, pelatihanData] = await Promise.all([
      supabaseService.fetchUmkm(),
      supabaseService.fetchWisata(),
      supabaseService.fetchPelatihan()
    ]);

    const results = locations.map(loc => 
      analyzeSpecificLocation(
        loc.lat,
        loc.lng,
        umkmData,
        wisataData,
        pelatihanData,
        { searchRadius }
      )
    );

    return NextResponse.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Batch location analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
