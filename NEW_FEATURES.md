# 🎯 Fitur Baru: Advanced Analytics & Personalization

## Overview

Tiga fitur powerful telah ditambahkan ke platform PetaLoka untuk memberikan insight mendalam dan pengalaman personal:

1. **🎯 Prediksi Lokasi Potensial** - Analisis lokasi terbaik untuk UMKM baru
2. **🎯 Analisis Kompetitor** - Competitive intelligence dalam radius tertentu
3. **✨ Rekomendasi Personal** - Rekomendasi berbasis user behavior tracking

---

## 1. 🎯 Prediksi Lokasi Potensial

### Deskripsi

Fitur ini menganalisis lokasi geografis untuk menentukan potensi area untuk membuka UMKM baru berdasarkan:

- **Density kompetitor** - Sweet spot: ada kompetitor tapi tidak terlalu banyak
- **Proximity ke wisata** - Dekat dengan tempat wisata = traffic tinggi
- **Proximity ke pelatihan** - Akses ke skill development
- **Competition level** - Tingkat saturasi pasar

### Cara Kerja

#### Mode 1: Scan Area (Auto-Discovery)

Scan seluruh area untuk menemukan top lokasi potensial:

```javascript
// API Call
GET /api/location-prediction?mode=scan&topN=10&minScore=50

// Response
{
  "success": true,
  "mode": "scan",
  "count": 10,
  "locations": [
    {
      "location": { "lat": -6.914742, "lng": 107.614526, "name": "Point 1" },
      "score": 87.5,
      "rating": "Sangat Potensial",
      "recommendation": "Lokasi ideal untuk UMKM baru!...",
      "details": {
        "competitors": { "count": 3, "score": 90, "list": [...] },
        "wisata": { "avgDistance": 0.5, "score": 85, "nearest": [...] },
        "pelatihan": { "avgDistance": 0.8, "score": 75, "nearest": [...] }
      }
    }
  ]
}
```

#### Mode 2: Analyze Specific Point

Analisis lokasi spesifik yang dipilih:

```javascript
GET /api/location-prediction?mode=analyze&lat=-6.914742&lng=107.614526&searchRadius=1.0
```

### Scoring System

**Total Score (0-100)** = Weighted sum of:

- **Competitor Score (30%)**: Optimal 3-5 kompetitor (terlalu sedikit/banyak = penalty)
- **Wisata Score (35%)**: Distance ke wisata terdekat (semakin dekat semakin baik)
- **Pelatihan Score (35%)**: Distance ke pelatihan terdekat

**Rating Categories**:

- 75+ = **Sangat Potensial** ✅
- 60-74 = **Potensial** ✔️
- 40-59 = **Cukup Potensial** ⚠️
- <40 = **Kurang Potensial** ❌

### Usage di UI

```jsx
import LocationPredictionPanel from "@/components/LocationPredictionPanel";

<LocationPredictionPanel
  onLocationSelect={(lat, lng) => {
    // Navigate to location on map
  }}
/>;
```

### Use Cases

- **Calon entrepreneur**: Mencari lokasi ideal untuk UMKM baru
- **Pemerintah daerah**: Identifikasi area yang perlu dikembangkan
- **Investor**: Due diligence lokasi sebelum investasi
- **Business planner**: Strategic location planning

---

## 2. 🎯 Analisis Kompetitor

### Deskripsi

Competitive intelligence tool untuk memahami landscape kompetitor dalam radius tertentu.

### Features

- **Density Zones** - Kompetitor dalam 3 zona: very close (0-300m), close (300-700m), moderate (700m+)
- **Market Saturation** - Very Low, Low, Moderate, High, Very High
- **Competition Intensity Score** - 0-100 (higher = more intense)
- **Opportunity Score** - Inverse of intensity (100-intensity)
- **Strategic Recommendations** - AI-generated actionable insights
- **Market Gap Analysis** - Kategori dengan kompetisi rendah

### Cara Kerja

#### Basic Analysis

```javascript
GET /api/competitor-analysis?lat=-6.914742&lng=107.614526&radius=1.0&category=Kuliner

// Response
{
  "success": true,
  "analysis": {
    "summary": {
      "totalCompetitors": 8,
      "saturationLevel": "Moderate",
      "intensityScore": 65,
      "opportunityScore": 35
    },
    "densityZones": {
      "veryClose": 2,
      "close": 3,
      "moderate": 3
    },
    "byCategory": [...],
    "topCompetitors": [...],
    "recommendations": [
      {
        "type": "strategy",
        "title": "Differentiation Required",
        "description": "8 kompetitor dengan kategori sama..."
      }
    ]
  }
}
```

#### Compare Two Locations

```javascript
POST /api/competitor-analysis
{
  "type": "compare",
  "location1": { "lat": -6.914, "lng": 107.614, "category": "Kuliner" },
  "location2": { "lat": -6.920, "lng": 107.620, "category": "Kuliner" },
  "radius": 1.0
}
```

#### Find Market Gaps

```javascript
POST /api/competitor-analysis
{
  "type": "gaps",
  "location": { "lat": -6.914, "lng": 107.614 },
  "allCategories": ["Kuliner", "Fashion", "Kerajinan", "Jasa"],
  "radius": 1.0
}
```

### Saturation Levels

| Level     | Competitors | Description                                           |
| --------- | ----------- | ----------------------------------------------------- |
| Very Low  | 0           | No direct competition (warning: might mean no demand) |
| Low       | 1-3         | Low competition, good opportunity                     |
| Moderate  | 4-8         | Established market, need differentiation              |
| High      | 9-15        | High competition, need strong strategy                |
| Very High | 16+         | Saturated market, consider other location             |

### Usage di UI

```jsx
import CompetitorAnalysisPanel from "@/components/CompetitorAnalysisPanel";

<CompetitorAnalysisPanel
  onLocationSelect={(lat, lng) => {
    // Zoom to location
  }}
/>;
```

---

## 3. ✨ Rekomendasi Personal

### Deskripsi

Personalized recommendation engine berbasis user behavior tracking dengan localStorage persistence.

### Tracked Behaviors

- **View** - User melihat detail UMKM/wisata
- **Click** - User mengklik marker/item
- **Search** - User search kategori tertentu
- **Favorite** - User mark as favorite

### Cara Kerja

#### User Behavior Tracking (Client-side)

```javascript
import { UserBehaviorTracker } from "@/lib/services/recommendations";

const tracker = new UserBehaviorTracker();

// Track interaction
tracker.track("view", {
  umkmId: "umkm-123",
  category: "Kuliner",
  lat: -6.914742,
  lng: 107.614526,
  name: "Warung Bu Ani",
});

// Get preferences
const preferences = tracker.getUserPreferences();
// {
//   totalBehaviors: 25,
//   favoriteCategories: [
//     { category: 'Kuliner', count: 15 },
//     { category: 'Kerajinan', count: 10 }
//   ],
//   centerOfInterest: { lat: -6.914742, lng: 107.614526 },
//   mostViewedItems: [...]
// }
```

#### Get Personalized Recommendations

```javascript
POST /api/recommendations
{
  "type": "personalized",
  "behaviors": [...],
  "options": {
    "maxRecommendations": 10,
    "includeWisata": true,
    "radiusFromCenter": 5.0
  }
}

// Response
{
  "success": true,
  "type": "personalized",
  "message": "Rekomendasi berdasarkan 25 interaksi Anda",
  "preferences": {
    "topCategory": "Kuliner",
    "totalViews": 25,
    "centerOfInterest": { lat: -6.914, lng: 107.614 }
  },
  "recommendations": [
    {
      "id": "umkm-456",
      "name": "Toko Batik Maju",
      "category": "Fashion",
      "reason": "Kategori favorit Anda: Fashion",
      "score": 95,
      "type": "category_match",
      ...
    }
  ]
}
```

### Recommendation Types

| Type                | Description               | Score |
| ------------------- | ------------------------- | ----- |
| `category_match`    | Matches favorite category | 95    |
| `location_based`    | Near center of interest   | 85    |
| `similar_items`     | Similar to viewed items   | 80    |
| `nearby_attraction` | Nearby wisata             | 75    |
| `discovery`         | New unexplored category   | 70    |
| `popular`           | Popular items (fallback)  | 60    |

### Other Endpoints

#### Category-based Recommendations

```javascript
POST /api/recommendations
{
  "type": "category",
  "category": "Kuliner",
  "behaviors": [...]
}
```

#### Related Recommendations ("You might also like")

```javascript
POST /api/recommendations
{
  "type": "related",
  "currentItem": { id: "umkm-123", ... },
  "behaviors": [...]
}
```

#### Quick Recommendations (No tracking)

```javascript
GET /api/recommendations?limit=10&category=Kuliner
```

### Usage di UI

```jsx
import RecommendationPanel from "@/components/RecommendationPanel";

<RecommendationPanel
  onItemClick={(item) => {
    // Navigate to item and track behavior
    setSelectedItem(item);
  }}
/>;
```

### Privacy & Data

- **All data stored in localStorage** (client-side only)
- **No server-side tracking**
- User can clear history anytime
- Behaviors limited to last 100 interactions
- Default timeframe: 30 days

---

## 🚀 Integration Example

```jsx
"use client";

import { useState } from "react";
import LocationPredictionPanel from "@/components/LocationPredictionPanel";
import CompetitorAnalysisPanel from "@/components/CompetitorAnalysisPanel";
import RecommendationPanel from "@/components/RecommendationPanel";

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState("prediction");
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("prediction")}>
          🎯 Prediksi Lokasi
        </button>
        <button onClick={() => setActiveTab("competitor")}>
          🎯 Analisis Kompetitor
        </button>
        <button onClick={() => setActiveTab("recommendations")}>
          ✨ Rekomendasi
        </button>
      </div>

      {/* Content */}
      {activeTab === "prediction" && (
        <LocationPredictionPanel
          onLocationSelect={(lat, lng) => {
            setSelectedLocation({ lat, lng });
          }}
        />
      )}

      {activeTab === "competitor" && (
        <CompetitorAnalysisPanel
          onLocationSelect={(lat, lng) => {
            setSelectedLocation({ lat, lng });
          }}
        />
      )}

      {activeTab === "recommendations" && (
        <RecommendationPanel
          onItemClick={(item) => {
            console.log("Selected:", item);
          }}
        />
      )}
    </div>
  );
}
```

---

## 📁 File Structure

```
peta-loka/
├── app/api/
│   ├── location-prediction/route.js    # Location prediction API
│   ├── competitor-analysis/route.js    # Competitor analysis API
│   └── recommendations/route.js         # Recommendations API
├── lib/
│   ├── services/
│   │   ├── location-prediction.js      # Location scoring algorithm
│   │   ├── competitor-analysis.js      # Competitor intelligence
│   │   └── recommendations.js          # Recommendation engine
│   └── utils/
│       └── distance.js                 # Haversine distance calculation
└── components/
    ├── LocationPredictionPanel.js      # UI for location prediction
    ├── CompetitorAnalysisPanel.js      # UI for competitor analysis
    └── RecommendationPanel.js          # UI for recommendations
```

---

## 🎯 Use Case Scenarios

### Scenario 1: New Business Owner

**Goal**: Find best location to open a new café

1. Use **Location Prediction** → Scan area → Get top 10 potential locations
2. Select top location → Use **Competitor Analysis** → Check saturation level
3. If moderate competition → Get **Strategic Recommendations**
4. Make informed decision based on data

### Scenario 2: Existing UMKM Owner

**Goal**: Understand competitive landscape

1. Input current location → **Competitor Analysis**
2. Review density zones and top competitors
3. Check market gaps for diversification opportunities
4. Compare with alternative locations if needed

### Scenario 3: Tourist/Customer

**Goal**: Discover interesting UMKM to visit

1. Browse map and view UMKM
2. System tracks behavior automatically
3. Get **Personalized Recommendations** based on preferences
4. Discover new UMKM similar to liked ones

### Scenario 4: Government/NGO

**Goal**: Strategic planning for UMKM development

1. Use **Location Prediction** across entire city
2. Identify underserved areas (low score, no competitors)
3. Plan training programs in those areas
4. Use **Market Gap Analysis** to determine needed categories

---

## 🔧 Configuration & Customization

### Location Prediction Config

```javascript
{
  searchRadius: 1.0,           // km, radius for analysis
  competitorWeight: 0.3,       // Weight for competitor score
  wisataWeight: 0.35,          // Weight for wisata proximity
  pelatihanWeight: 0.35,       // Weight for pelatihan proximity
  optimalCompetitorCount: 3,   // Sweet spot for competition
  gridSize: 0.5,               // km, grid spacing for scanning
  topN: 10,                    // Number of top locations to return
  minScore: 50                 // Minimum score threshold
}
```

### Competitor Analysis Config

```javascript
{
  radius: 1.0,                 // km, search radius
  includeAllCategories: false, // Only same category or all?
  maxCompetitors: 50           // Max competitors to analyze
}
```

### Recommendations Config

```javascript
{
  maxRecommendations: 10,      // Max items to recommend
  includeWisata: true,         // Include wisata in recommendations
  radiusFromCenter: 5.0,       // km, radius from center of interest
  behaviorRetention: 100,      // Max behaviors to store
  timeframe: 30                // Days to consider for preferences
}
```

---

## 🚦 Performance Considerations

### Location Prediction

- **Grid scanning**: O(n²) for grid points × data points
- **Optimization**: Limit grid size and search radius
- **Caching**: Consider caching results for popular areas

### Competitor Analysis

- **Distance calculation**: O(n) where n = total UMKM
- **Optimization**: Use spatial indexing in production
- **Real-time**: Fast for radius < 5km

### Recommendations

- **Client-side tracking**: Zero server overhead
- **localStorage**: 100 behaviors ≈ 50KB
- **Algorithm**: O(n) where n = total UMKM
- **Fast**: < 500ms for 1000+ items

---

## 📊 Analytics & Metrics

Track these metrics for insights:

1. **Location Prediction**

   - Average score of top locations
   - Distribution of ratings
   - Most common optimal radius

2. **Competitor Analysis**

   - Average saturation level by area
   - Most competitive categories
   - Market gap opportunities

3. **Recommendations**
   - Click-through rate by recommendation type
   - Average behaviors before conversion
   - Most popular categories

---

## 🔮 Future Enhancements

### Short-term

- [ ] Export analysis results to PDF
- [ ] Save favorite locations
- [ ] Email alerts for new opportunities

### Mid-term

- [ ] Machine learning for better predictions
- [ ] Historical trend analysis
- [ ] Collaborative filtering for recommendations
- [ ] Integration with Google Places API

### Long-term

- [ ] Real-time competitor monitoring
- [ ] Predictive analytics (future demand)
- [ ] AR visualization of potential locations
- [ ] Mobile app with offline mode

---

## 📝 License

MIT License - Feel free to use and modify!

---

**Dibuat dengan ❤️ untuk memajukan UMKM Indonesia**
