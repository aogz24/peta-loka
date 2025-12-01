import axios from "axios";

/**
 * Service untuk scraping data dari OpenStreetMap
 */
export class OpenStreetMapService {
  constructor() {
    this.overpassUrl = "https://overpass-api.de/api/interpreter";
  }

  /**
   * Scrape UMKM dan usaha kecil dari area tertentu
   */
  async scrapeUMKM(lat, lon, radius = 5000) {
    const query = `
      [out:json][timeout:25];
      (
        node["shop"](around:${radius},${lat},${lon});
        node["craft"](around:${radius},${lat},${lon});
        node["office"](around:${radius},${lat},${lon});
        way["shop"](around:${radius},${lat},${lon});
        way["craft"](around:${radius},${lat},${lon});
        way["office"](around:${radius},${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await axios.post(this.overpassUrl, query, {
        headers: { "Content-Type": "text/plain" },
      });

      return this.parseUMKMData(response.data.elements);
    } catch (error) {
      console.error("Error scraping UMKM:", error);
      throw error;
    }
  }

  /**
   * Scrape tempat wisata mikro
   */
  async scrapeWisataMikro(lat, lon, radius = 5000) {
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"](around:${radius},${lat},${lon});
        node["amenity"="cafe"](around:${radius},${lat},${lon});
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        node["leisure"](around:${radius},${lat},${lon});
        way["tourism"](around:${radius},${lat},${lon});
        way["leisure"](around:${radius},${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await axios.post(this.overpassUrl, query, {
        headers: { "Content-Type": "text/plain" },
      });

      return this.parseWisataData(response.data.elements);
    } catch (error) {
      console.error("Error scraping wisata:", error);
      throw error;
    }
  }

  /**
   * Scrape tempat pelatihan (sekolah, training center, dll)
   */
  async scrapePelatihan(lat, lon, radius = 5000) {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="school"](around:${radius},${lat},${lon});
        node["amenity"="college"](around:${radius},${lat},${lon});
        node["amenity"="university"](around:${radius},${lat},${lon});
        node["amenity"="training"](around:${radius},${lat},${lon});
        node["amenity"="community_centre"](around:${radius},${lat},${lon});
        way["amenity"="school"](around:${radius},${lat},${lon});
        way["amenity"="college"](around:${radius},${lat},${lon});
        way["amenity"="training"](around:${radius},${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await axios.post(this.overpassUrl, query, {
        headers: { "Content-Type": "text/plain" },
      });

      return this.parsePelatihanData(response.data.elements);
    } catch (error) {
      console.error("Error scraping pelatihan:", error);
      throw error;
    }
  }

  /**
   * Parse data UMKM
   */
  parseUMKMData(elements) {
    return elements
      .map((element) => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;

        return {
          id: element.id,
          type: "umkm",
          name: element.tags?.name || "UMKM Tanpa Nama",
          category:
            element.tags?.shop ||
            element.tags?.craft ||
            element.tags?.office ||
            "lainnya",
          lat,
          lon,
          address:
            element.tags?.["addr:full"] || element.tags?.["addr:street"] || "",
          phone: element.tags?.phone || "",
          website: element.tags?.website || "",
          openingHours: element.tags?.opening_hours || "",
          description: element.tags?.description || "",
          tags: element.tags,
        };
      })
      .filter((item) => item.lat && item.lon);
  }

  /**
   * Parse data wisata
   */
  parseWisataData(elements) {
    return elements
      .map((element) => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;

        return {
          id: element.id,
          type: "wisata",
          name: element.tags?.name || "Wisata Tanpa Nama",
          category:
            element.tags?.tourism ||
            element.tags?.amenity ||
            element.tags?.leisure ||
            "lainnya",
          lat,
          lon,
          address:
            element.tags?.["addr:full"] || element.tags?.["addr:street"] || "",
          phone: element.tags?.phone || "",
          website: element.tags?.website || "",
          openingHours: element.tags?.opening_hours || "",
          description: element.tags?.description || "",
          tags: element.tags,
        };
      })
      .filter((item) => item.lat && item.lon);
  }

  /**
   * Parse data pelatihan
   */
  parsePelatihanData(elements) {
    return elements
      .map((element) => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;

        return {
          id: element.id,
          type: "pelatihan",
          name: element.tags?.name || "Tempat Pelatihan",
          category: element.tags?.amenity || "training",
          lat,
          lon,
          address:
            element.tags?.["addr:full"] || element.tags?.["addr:street"] || "",
          phone: element.tags?.phone || "",
          website: element.tags?.website || "",
          openingHours: element.tags?.opening_hours || "",
          description: element.tags?.description || "",
          tags: element.tags,
        };
      })
      .filter((item) => item.lat && item.lon);
  }

  /**
   * Scrape semua data sekaligus
   */
  async scrapeAll(lat, lon, radius = 5000) {
    try {
      const [umkm, wisata, pelatihan] = await Promise.all([
        this.scrapeUMKM(lat, lon, radius),
        this.scrapeWisataMikro(lat, lon, radius),
        this.scrapePelatihan(lat, lon, radius),
      ]);

      return {
        umkm,
        wisata,
        pelatihan,
        total: umkm.length + wisata.length + pelatihan.length,
      };
    } catch (error) {
      console.error("Error scraping all data:", error);
      throw error;
    }
  }
}

export default new OpenStreetMapService();
