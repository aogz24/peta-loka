"use client";

import { useState, useMemo } from "react";
import {
  Target,
  TrendingDown,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";
import Select from "react-select";
// Dynamic import untuk MapComponent (client-side only)
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-100" />
    </div>
  ),
});

export default function CompetitorAnalysisPanel({ onLocationSelect }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [radius, setRadius] = useState(1.0);
  const [includeAll, setIncludeAll] = useState(false);
  const [mode, setMode] = useState("manual"); // 'manual' or 'picker'
  const [showPicker, setShowPicker] = useState(false);

  const kategoriOptions = useMemo(
    () => [
      { value: "accessories", label: "Accessories" },
      { value: "advertising_agency", label: "Advertising Agency" },
      { value: "agrarian", label: "Agrarian" },
      { value: "alcohol", label: "Alcohol" },
      { value: "appliance", label: "Appliance" },
      { value: "architect", label: "Architect" },
      { value: "art", label: "Art" },
      { value: "association", label: "Association" },
      { value: "baby_goods", label: "Baby Goods" },
      { value: "bag", label: "Bag" },
      { value: "bakery", label: "Bakery" },
      { value: "beauty", label: "Beauty" },
      { value: "beverages", label: "Beverages" },
      { value: "bicycle", label: "Bicycle" },
      { value: "bookmaker", label: "Bookmaker" },
      { value: "books", label: "Books" },
      { value: "boutique", label: "Boutique" },
      { value: "building_material", label: "Building Material" },
      { value: "butcher", label: "Butcher" },
      { value: "car", label: "Car" },
      { value: "car_parts", label: "Car Parts" },
      { value: "car_repair", label: "Car Repair" },
      { value: "Cellullar", label: "Cellular" },
      { value: "chemist", label: "Chemist" },
      { value: "clothes", label: "Clothes" },
      { value: "coffee", label: "Coffee" },
      { value: "company", label: "Company" },
      { value: "computer", label: "Computer" },
      { value: "confectionery", label: "Confectionery" },
      { value: "consulting", label: "Consulting" },
      { value: "convenience", label: "Convenience" },
      { value: "copyshop", label: "Copyshop" },
      { value: "cosmetics", label: "Cosmetics" },
      { value: "courier", label: "Courier" },
      { value: "coworking", label: "Coworking" },
      { value: "dairy", label: "Dairy" },
      { value: "department_store", label: "Department Store" },
      { value: "Distributor", label: "Distributor" },
      { value: "doityourself", label: "Do It Yourself" },
      { value: "dry_cleaning", label: "Dry Cleaning" },
      { value: "e-cigarette", label: "E-Cigarette" },
      { value: "educational_institution", label: "Educational Institution" },
      { value: "electrical", label: "Electrical" },
      { value: "electronics", label: "Electronics" },
      { value: "electronics_repair", label: "Electronics Repair" },
      { value: "employment_agency", label: "Employment Agency" },
      { value: "estate_agent", label: "Estate Agent" },
      { value: "fabric", label: "Fabric" },
      { value: "fashion", label: "Fashion" },
      { value: "fashion_accessories", label: "Fashion Accessories" },
      { value: "financial", label: "Financial" },
      { value: "florist", label: "Florist" },
      { value: "food", label: "Food" },
      { value: "frame", label: "Frame" },
      { value: "frozen_food", label: "Frozen Food" },
      { value: "funeral_directors", label: "Funeral Directors" },
      { value: "furniture", label: "Furniture" },
      { value: "games", label: "Games" },
      { value: "general", label: "General" },
      { value: "gift", label: "Gift" },
      { value: "government", label: "Government" },
      { value: "greengrocer", label: "Greengrocer" },
      { value: "grocery", label: "Grocery" },
      { value: "hairdresser", label: "Hairdresser" },
      { value: "hardware", label: "Hardware" },
      { value: "health_food", label: "Health Food" },
      { value: "health_insurance", label: "Health Insurance" },
      { value: "hearing_aids", label: "Hearing Aids" },
      { value: "hifi", label: "HiFi" },
      { value: "houseware", label: "Houseware" },
      { value: "insurance", label: "Insurance" },
      { value: "it", label: "IT" },
      { value: "jeweller", label: "Jeweller" },
      { value: "jewelry", label: "Jewelry" },
      { value: "Keyboard", label: "Keyboard" },
      { value: "kiosk", label: "Kiosk" },
      { value: "kitchen", label: "Kitchen" },
      { value: "laundry", label: "Laundry" },
      { value: "lawyer", label: "Lawyer" },
      { value: "lighting", label: "Lighting" },
      { value: "locksmith", label: "Locksmith" },
      { value: "logistics", label: "Logistics" },
      { value: "mall", label: "Mall" },
      { value: "massage", label: "Massage" },
      { value: "medical_supply", label: "Medical Supply" },
      { value: "metal_construction", label: "Metal Construction" },
      { value: "metal_works", label: "Metal Works" },
      { value: "mobile_phone", label: "Mobile Phone" },
      { value: "motorcycle", label: "Motorcycle" },
      { value: "motorcycle_repair", label: "Motorcycle Repair" },
      { value: "music", label: "Music" },
      { value: "musical_instrument", label: "Musical Instrument" },
      { value: "newspaper", label: "Newspaper" },
      { value: "ngo", label: "NGO" },
      { value: "no", label: "No" },
      { value: "notary", label: "Notary" },
      { value: "optician", label: "Optician" },
      { value: "outdoor", label: "Outdoor" },
      { value: "paint", label: "Paint" },
      { value: "pastry", label: "Pastry" },
    ],
    []
  );

  const allOption = { value: "*", label: "Select All" };

  const handleCategoryChange = (selected) => {
    if (!selected || selected.length === 0) {
      setSelectedCategories([]);
      return;
    }

    // Check if "Select All" was clicked
    const selectAllClicked = selected.some((option) => option.value === "*");
    const wasAllSelected = selectedCategories.some(
      (option) => option.value === "*"
    );

    if (selectAllClicked && !wasAllSelected) {
      // User clicked "Select All" - select all options
      setSelectedCategories([allOption, ...kategoriOptions]);
    } else if (!selectAllClicked && wasAllSelected) {
      // User deselected "Select All" - clear all
      setSelectedCategories([]);
    } else if (selected.length === kategoriOptions.length + 1) {
      // All individual options selected - add "Select All"
      setSelectedCategories([allOption, ...kategoriOptions]);
    } else {
      // Normal selection - remove "Select All" if present
      setSelectedCategories(selected.filter((option) => option.value !== "*"));
    }
  };

  const kategori = [
    {
      category: "accessories",
    },
    {
      category: "advertising_agency",
    },
    {
      category: "agrarian",
    },
    {
      category: "alcohol",
    },
    {
      category: "appliance",
    },
    {
      category: "architect",
    },
    {
      category: "art",
    },
    {
      category: "association",
    },
    {
      category: "baby_goods",
    },
    {
      category: "bag",
    },
    {
      category: "bakery",
    },
    {
      category: "beauty",
    },
    {
      category: "beverages",
    },
    {
      category: "bicycle",
    },
    {
      category: "bookmaker",
    },
    {
      category: "books",
    },
    {
      category: "boutique",
    },
    {
      category: "building_material",
    },
    {
      category: "butcher",
    },
    {
      category: "car",
    },
    {
      category: "car_parts",
    },
    {
      category: "car_repair",
    },
    {
      category: "Cellullar",
    },
    {
      category: "chemist",
    },
    {
      category: "clothes",
    },
    {
      category: "coffee",
    },
    {
      category: "company",
    },
    {
      category: "computer",
    },
    {
      category: "confectionery",
    },
    {
      category: "consulting",
    },
    {
      category: "convenience",
    },
    {
      category: "copyshop",
    },
    {
      category: "cosmetics",
    },
    {
      category: "courier",
    },
    {
      category: "coworking",
    },
    {
      category: "dairy",
    },
    {
      category: "department_store",
    },
    {
      category: "Distributor",
    },
    {
      category: "doityourself",
    },
    {
      category: "dry_cleaning",
    },
    {
      category: "e-cigarette",
    },
    {
      category: "educational_institution",
    },
    {
      category: "electrical",
    },
    {
      category: "electronics",
    },
    {
      category: "electronics_repair",
    },
    {
      category: "employment_agency",
    },
    {
      category: "estate_agent",
    },
    {
      category: "fabric",
    },
    {
      category: "fashion",
    },
    {
      category: "fashion_accessories",
    },
    {
      category: "financial",
    },
    {
      category: "florist",
    },
    {
      category: "food",
    },
    {
      category: "frame",
    },
    {
      category: "frozen_food",
    },
    {
      category: "funeral_directors",
    },
    {
      category: "furniture",
    },
    {
      category: "games",
    },
    {
      category: "general",
    },
    {
      category: "gift",
    },
    {
      category: "government",
    },
    {
      category: "greengrocer",
    },
    {
      category: "grocery",
    },
    {
      category: "hairdresser",
    },
    {
      category: "hardware",
    },
    {
      category: "health_food",
    },
    {
      category: "health_insurance",
    },
    {
      category: "hearing_aids",
    },
    {
      category: "hifi",
    },
    {
      category: "houseware",
    },
    {
      category: "insurance",
    },
    {
      category: "it",
    },
    {
      category: "jeweller",
    },
    {
      category: "jewelry",
    },
    {
      category: "Keyboard",
    },
    {
      category: "kiosk",
    },
    {
      category: "kitchen",
    },
    {
      category: "laundry",
    },
    {
      category: "lawyer",
    },
    {
      category: "lighting",
    },
    {
      category: "locksmith",
    },
    {
      category: "logistics",
    },
    {
      category: "mall",
    },
    {
      category: "massage",
    },
    {
      category: "medical_supply",
    },
    {
      category: "metal_construction",
    },
    {
      category: "metal_works",
    },
    {
      category: "mobile_phone",
    },
    {
      category: "motorcycle",
    },
    {
      category: "motorcycle_repair",
    },
    {
      category: "music",
    },
    {
      category: "musical_instrument",
    },
    {
      category: "newspaper",
    },
    {
      category: "ngo",
    },
    {
      category: "no",
    },
    {
      category: "notary",
    },
    {
      category: "optician",
    },
    {
      category: "outdoor",
    },
    {
      category: "paint",
    },
    {
      category: "pastry",
    },
  ];

  const handleAnalyze = async () => {
    if (!lat || !lng) {
      alert("Masukkan koordinat atau klik pada peta");
      return;
    }

    setLoading(true);
    try {
      const categories = selectedCategories
        .filter((cat) => cat.value !== "*")
        .map((cat) => cat.value)
        .join(",");

      const response = await fetch(
        `/api/competitor-analysis?lat=${lat}&lng=${lng}&category=${categories}&radius=${radius}&includeAll=${includeAll}`
      );
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSaturationColor = (level) => {
    switch (level) {
      case "Very Low":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700";
      case "Low":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
      case "Moderate":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700";
      case "Very High":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "opportunity":
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      default:
        return <Target className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 dark:from-purple-900 dark:to-pink-900 dark:border-purple-700">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          Analisis Kompetitor
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-200">
          Analisis kompetitor dalam radius tertentu untuk memahami tingkat
          kompetisi dan peluang pasar
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              disabled={mode !== "manual"}
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="-6.914742"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              disabled={mode !== "manual"}
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="107.614526"
            />
          </div>
        </div>

        {/* Method Buttons */}
        <div className="mt-4 space-y-2">
          <label className=" text-gray-700 text-xs">
            Metode Pemilihan Lokasi
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Manual Input */}
            <button
              onClick={() => setMode("manual")}
              className={`px-3 py-2 rounded-lg border font-medium transition text-xs ${
                mode === "manual"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-50 text-blue-700"
                  : "border-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-200 text-zinc-700"
              }`}
            >
              Input Manual
            </button>

            {/* Pilih dari Peta */}
            <button
              onClick={() => {
                setShowPicker(true);
                setMode("picker");
              }}
              className={`px-3 py-2 rounded-lg border font-medium transition text-xs ${
                mode === "picker"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-50 text-blue-700"
                  : "border-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-200 text-zinc-700"
              }`}
            >
              Pilih Lokasi Lewat Peta
            </button>
          </div>
        </div>

        {showPicker && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 h-full w-full">
            <div className="bg-white dark:bg-gray-900 dark:text-white p-4 rounded-lg shadow-lg lg:w-1/2 w-3/4 h-3/4 relative overflow-auto">
              <h2 className="font-semibold mb-2">Pilih Lokasi dari Peta</h2>

              <MapComponent
                className="h-full rounded-lg"
                center={[-6.914742, 107.614526]}
                zoom={13}
                radius={radius}
                selectMode
                onSelectLocation={(lat, lon) => {
                  setLat(lat);
                  setLng(lon);
                  setShowPicker(false);
                }}
              />

              <button
                onClick={() => setShowPicker(false)}
                className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded"
              >
                X
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
            Kategori (opsional)
          </label>
          <Select
            isMulti
            options={[allOption, ...kategoriOptions]}
            value={selectedCategories}
            onChange={handleCategoryChange}
            placeholder="Pilih kategori..."
            className="text-sm"
            classNamePrefix="select"
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                "&:hover": {
                  borderColor: "#3b82f6",
                },
                boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 50,
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "#3b82f6"
                  : state.isFocused
                  ? "#dbeafe"
                  : "white",
                color: state.isSelected ? "white" : "#1f2937",
                fontWeight: state.data.value === "*" ? "600" : "400",
                "&:active": {
                  backgroundColor: "#3b82f6",
                },
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: "#dbeafe",
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: "#1e40af",
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: "#1e40af",
                "&:hover": {
                  backgroundColor: "#3b82f6",
                  color: "white",
                },
              }),
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">
            Radius Analisis (km): {radius}
          </label>
          <input
            type="range"
            min="0.3"
            max="5"
            step="0.1"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 inline mr-2" />
              Analyze Competitors
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {analysis && (
        <div className="mt-6 space-y-4">
          {/* Summary Card */}
          <div
            className={`p-4 rounded-lg border-2 ${getSaturationColor(
              analysis.summary.saturationLevel
            )}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-2xl font-bold">
                  {analysis.summary.totalCompetitors} Kompetitor
                </div>
                <div className="text-sm opacity-75">
                  dalam radius {analysis.summary.radius} km
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold border">
                {analysis.summary.saturationLevel}
              </div>
            </div>
            <p className="text-sm mb-3">
              {analysis.summary.saturationDescription}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-900 bg-opacity-50 p-3 rounded">
                <div className="text-xs opacity-75">Intensity Score</div>
                <div className="text-xl font-bold">
                  {analysis.summary.intensityScore}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 bg-opacity-50 p-3 rounded">
                <div className="text-xs opacity-75">Opportunity Score</div>
                <div className="text-xl font-bold">
                  {analysis.summary.opportunityScore}
                </div>
              </div>
            </div>
          </div>

          {/* Density Zones */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Zona Kepadatan
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sangat Dekat (0-300m)</span>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-sm font-semibold">
                  {analysis.densityZones.veryClose}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Dekat (300-700m)</span>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-full text-sm font-semibold">
                  {analysis.densityZones.close}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sedang (700m+)</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-sm font-semibold">
                  {analysis.densityZones.moderate}
                </span>
              </div>
            </div>
          </div>

          {/* By Category */}
          {analysis.byCategory.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
              <h4 className="font-semibold mb-3">Kompetitor per Kategori</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {analysis.byCategory.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{cat.category}</div>
                      <div className="text-xs text-gray-500">
                        Terdekat: {cat.nearest} ({cat.nearestDistance} km)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{cat.count}</div>
                      <div className="text-xs text-gray-500">
                        {cat.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Competitors */}
          {analysis.topCompetitors.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
              <h4 className="font-semibold mb-3">Top Kompetitor Terdekat</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysis.topCompetitors.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{comp.name}</div>
                        <div className="text-xs text-gray-500">
                          {comp.category}
                        </div>
                        {comp.address !== "N/A" && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {comp.address}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-blue-600">
                        {comp.distance} km
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 dark:from-blue-900 dark:to-purple-900 dark:border-blue-700">
              <h4 className="font-semibold mb-3">Rekomendasi Strategis</h4>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-900 p-3 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      {getRecommendationIcon(rec.type)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{rec.title}</div>
                        <div className="text-xs text-gray-600 mt-1 dark:text-gray-400">
                          {rec.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
