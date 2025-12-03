/**
 * API Route: Personalized Recommendations
 * Endpoint untuk rekomendasi personalized berdasarkan user behavior
 */

import { NextResponse } from 'next/server';
import { 
  generatePersonalizedRecommendations,
  getRecommendationsByCategory,
  getRelatedRecommendations,
  UserBehaviorTracker
} from '@/lib/services/recommendations';
import supabaseService from '@/lib/services/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      type, 
      behaviors = [],
      category = null,
      currentItem = null,
      options = {}
    } = body;

    // Fetch data
    const [umkmData, wisataData] = await Promise.all([
      supabaseService.fetchUmkm(),
      supabaseService.fetchWisata()
    ]);

    // Create tracker dari behaviors yang dikirim client
    const tracker = new UserBehaviorTracker();
    // Override behaviors untuk server-side processing
    tracker.behaviors = behaviors;

    let result;

    switch (type) {
      case 'personalized':
        // General personalized recommendations
        result = generatePersonalizedRecommendations(
          umkmData,
          wisataData,
          tracker,
          options
        );
        break;

      case 'category':
        // Category-based with personalization
        if (!category) {
          return NextResponse.json(
            { success: false, error: 'Category required' },
            { status: 400 }
          );
        }
        result = {
          type: 'category',
          category,
          recommendations: getRecommendationsByCategory(
            category,
            umkmData,
            tracker,
            options
          )
        };
        break;

      case 'related':
        // Related to current item
        if (!currentItem) {
          return NextResponse.json(
            { success: false, error: 'Current item required' },
            { status: 400 }
          );
        }
        result = {
          type: 'related',
          currentItem,
          recommendations: getRelatedRecommendations(
            currentItem,
            umkmData,
            tracker,
            options
          )
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Use "personalized", "category", or "related"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// GET untuk quick recommendations tanpa behavior tracking
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');

    const umkmData = await supabaseService.fetchUmkm();

    let recommendations;
    if (category) {
      recommendations = umkmData
        .filter(umkm => umkm.category === category)
        .slice(0, limit);
    } else {
      recommendations = umkmData.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      type: 'quick',
      recommendations: recommendations.map(item => ({
        ...item,
        reason: 'Rekomendasi populer',
        score: 60,
        type: 'popular'
      }))
    });
  } catch (error) {
    console.error('Quick recommendations error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
