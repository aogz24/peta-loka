import OpenAI from "openai";

/**
 * Service untuk AI Agent menggunakan Kolosal AI
 */
export class KolosalAIService {
  constructor() {
    this.apiKey = process.env.KOLOSAL_API_KEY;
    this.useDummyMode = !this.apiKey || this.apiKey === "YOUR_API_KEY";

    if (!this.useDummyMode) {
      this.kolosal = new OpenAI({
        apiKey: this.apiKey,
        baseURL: "https://api.kolosal.ai/v1",
      });
    }
    this.model = "Llama 4 Maverick";
  }

  /**
   * Generate insight dari hasil clustering
   */
  async generateClusteringInsight(clusteringData) {
    if (this.useDummyMode) {
      return this.generateDummyClusteringInsight(clusteringData);
    }

    const { umkm, wisata, pelatihan, trainingRecommendations, summary } =
      clusteringData;

    const prompt = `
Sebagai AI consultant untuk UMKM, berikan analisis dan insight mendalam dari hasil clustering data berikut:

RINGKASAN DATA:
- Total UMKM: ${summary.totalUMKM}
- Total Wisata: ${summary.totalWisata}
- Total Tempat Pelatihan: ${summary.totalPelatihan}
- Jumlah Cluster: ${summary.totalClusters}

UMKM PER CLUSTER:
${umkm.analysis
  .map(
    (cluster, i) => `
Cluster ${i + 1}:
- Lokasi: [${cluster.center.lat.toFixed(4)}, ${cluster.center.lon.toFixed(4)}]
- Total UMKM: ${cluster.totalUMKM}
- Kategori Dominan: ${cluster.dominantCategory}
- Distribusi Kategori: ${JSON.stringify(cluster.categories)}
`
  )
  .join("\n")}

WISATA PER CLUSTER:
${wisata.analysis
  .map(
    (cluster, i) => `
Cluster ${i + 1}:
- Total Wisata: ${cluster.totalWisata}
- Potensi: ${cluster.potensi}
- Kategori: ${JSON.stringify(cluster.categories)}
`
  )
  .join("\n")}

Berikan analisis yang mencakup:
1. Insight utama dari pola clustering
2. Rekomendasi strategis untuk pengembangan UMKM
3. Potensi kolaborasi antar cluster
4. Prioritas pelatihan yang dibutuhkan
5. Peluang pengembangan wisata dan produk lokal
`;

    try {
      const response = await this.kolosal.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah AI consultant ahli untuk pengembangan UMKM dan ekonomi lokal. Berikan analisis yang actionable dan berbasis data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error generating insight:", error);
      // Fallback to dummy if API fails
      return this.generateDummyClusteringInsight(clusteringData);
    }
  }

  /**
   * Generate rekomendasi untuk UMKM spesifik
   */
  async generateUMKMRecommendation(umkmData, clusterInfo, nearbyWisata) {
    if (this.useDummyMode) {
      return this.generateDummyUMKMRecommendation(
        umkmData,
        clusterInfo,
        nearbyWisata
      );
    }
    const prompt = `
Berikan rekomendasi pengembangan bisnis untuk UMKM berikut:

DATA UMKM:
- Nama: ${umkmData.name}
- Kategori: ${umkmData.category}
- Lokasi: ${umkmData.address || "Tidak tersedia"}

KONTEKS CLUSTER:
- Cluster ID: ${clusterInfo.clusterId}
- Kategori Dominan di Area: ${clusterInfo.dominantCategory}
- Total UMKM di Area: ${clusterInfo.totalItems}

WISATA TERDEKAT:
${nearbyWisata
  .slice(0, 3)
  .map((w) => `- ${w.name} (${w.category})`)
  .join("\n")}

Berikan rekomendasi yang mencakup:
1. Strategi pemasaran berdasarkan lokasi
2. Peluang kolaborasi dengan wisata terdekat
3. Produk/layanan yang bisa dikembangkan
4. Tips meningkatkan daya saing di cluster
`;

    try {
      const response = await this.kolosal.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah business consultant untuk UMKM. Berikan saran praktis dan mudah diimplementasikan.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error generating UMKM recommendation:", error);
      return this.generateDummyUMKMRecommendation(
        umkmData,
        clusterInfo,
        nearbyWisata
      );
    }
  }

  /**
   * Analisis potensi area untuk ekspansi UMKM
   */
  async analyzeAreaPotential(areaData) {
    if (this.useDummyMode) {
      return this.generateDummyAreaPotential(areaData);
    }
    const { umkmCount, wisataCount, categories, nearestTraining, location } =
      areaData;

    const prompt = `
Analisis potensi area untuk pengembangan UMKM dengan data berikut:

${
  location
    ? `LOKASI:
- Latitude: ${location.latitude}
- Longitude: ${location.longitude}
- Radius: ${location.radius} meter

`
    : ""
}DATA AREA:
- Jumlah UMKM: ${umkmCount}
- Jumlah Wisata: ${wisataCount}
- Kategori UMKM: ${JSON.stringify(categories)}
- Pelatihan Terdekat: ${
      nearestTraining && nearestTraining.length > 0
        ? nearestTraining
            .map((t) => `${t.name} (${t.distance.toFixed(2)} km)`)
            .join(", ")
        : "Tidak ada data pelatihan terdekat"
    }

Berikan analisis:
1. Rating potensi area (1-10)
2. Kategori bisnis yang paling cocok
3. Gap/peluang yang belum terisi
4. Tantangan yang mungkin dihadapi
5. Rekomendasi aksi untuk pengembangan area
`;

    try {
      const response = await this.kolosal.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah area development analyst yang ahli dalam mengidentifikasi peluang bisnis lokal.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error analyzing area potential:", error);
      return this.generateDummyAreaPotential(areaData);
    }
  }

  /**
   * Generate insight dari query custom user
   */
  async chat(userQuery, contextData) {
    if (this.useDummyMode) {
      return this.generateDummyChat(userQuery, contextData);
    }
    try {
      const response = await this.kolosal.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `Anda adalah AI assistant PetaLoka yang membantu UMKM mendapat insight dari data. 
Context data yang tersedia: ${JSON.stringify(contextData, null, 2)}`,
          },
          {
            role: "user",
            content: userQuery,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error in chat:", error);
      throw error;
    }
  }

  // Dummy methods for when API key is not available
  generateDummyClusteringInsight(clusteringData) {
    const { summary } = clusteringData;
    return `
## Analisis Clustering UMKM (Mode Demo)

### Ringkasan Data
- Total UMKM: ${summary.totalUMKM}
- Total Wisata: ${summary.totalWisata}
- Total Tempat Pelatihan: ${summary.totalPelatihan}
- Jumlah Cluster: ${summary.totalClusters}

### Insight Utama
1. **Distribusi UMKM**: Data menunjukkan konsentrasi UMKM di ${summary.totalClusters} cluster utama
2. **Potensi Wisata**: Terdapat ${summary.totalWisata} wisata yang dapat menjadi daya tarik
3. **Akses Pelatihan**: ${summary.totalPelatihan} tempat pelatihan tersedia untuk pengembangan UMKM

### Rekomendasi Strategis
- Fokus pada pengembangan cluster dengan kategori dominan
- Manfaatkan wisata untuk meningkatkan traffic pelanggan
- Koordinasi pelatihan berbasis kebutuhan cluster

*Catatan: Ini adalah analisis demo. Untuk insight mendalam, silakan konfigurasi Kolosal AI API key.*
    `.trim();
  }

  generateDummyUMKMRecommendation(umkmData, clusterInfo, nearbyWisata) {
    return `
## Rekomendasi untuk ${umkmData.name} (Mode Demo)

### Profil UMKM
- Kategori: ${umkmData.category}
- Area Cluster: ${clusterInfo.clusterId}
- Kategori Dominan Area: ${clusterInfo.dominantCategory}

### Strategi Pemasaran
1. Manfaatkan lokasi strategis di cluster dengan ${clusterInfo.totalItems} UMKM
2. Kolaborasi dengan ${
      nearbyWisata.length > 0 ? nearbyWisata[0].name : "wisata terdekat"
    }
3. Fokus pada diferensiasi produk sesuai kategori ${umkmData.category}

### Peluang Kolaborasi
- Partner dengan wisata terdekat untuk paket bundling
- Joint promotion dengan UMKM sejenis di cluster
- Manfaatkan event wisata untuk exposure

*Catatan: Ini adalah rekomendasi demo. Untuk analisis personal, silakan konfigurasi Kolosal AI API key.*
    `.trim();
  }

  generateDummyAreaPotential(areaData) {
    const { umkmCount, wisataCount, categories, nearestTraining, location } =
      areaData;
    const rating = Math.min(
      10,
      Math.max(1, Math.round((umkmCount + wisataCount) / 10))
    );

    return `
## Analisis Potensi Area (Mode Demo)

${
  location
    ? `### Lokasi Analisis
- Latitude: ${location.latitude.toFixed(6)}
- Longitude: ${location.longitude.toFixed(6)}
- Radius: ${(location.radius / 1000).toFixed(1)} km

`
    : ""
}### Statistik Area
- Jumlah UMKM: ${umkmCount}
- Jumlah Wisata: ${wisataCount}
- Rating Potensi: ${rating}/10

### Kategori Bisnis
${
  categories
    ? Object.entries(categories)
        .map(([cat, count]) => `- ${cat}: ${count}`)
        .join("\n")
    : "- Data kategori tidak tersedia"
}

### Pelatihan Terdekat
${
  nearestTraining && nearestTraining.length > 0
    ? nearestTraining
        .map((t) => `- ${t.name} (${t.distance.toFixed(2)} km)`)
        .join("\n")
    : "- Belum ada data pelatihan terdekat"
}

### Gap & Peluang
1. Area menunjukkan aktivitas ekonomi dengan ${umkmCount} UMKM
2. Potensi wisata dapat ditingkatkan (${wisataCount} wisata mikro)
3. Peluang kolaborasi antar sektor masih terbuka

### Rekomendasi Aksi
- Tingkatkan kualitas produk UMKM existing
- Kembangkan paket wisata terintegrasi
- Manfaatkan pelatihan untuk skill upgrade

*Catatan: Ini adalah analisis demo. Untuk insight mendalam, silakan konfigurasi Kolosal AI API key.*
    `.trim();
  }

  generateDummyChat(userQuery, contextData) {
    return `
Terima kasih atas pertanyaan Anda: "${userQuery}"

Mode Demo aktif - untuk mendapatkan analisis AI yang lebih mendalam dan personal, silakan konfigurasi Kolosal AI API key di file .env:

\`\`\`
KOLOSAL_API_KEY=your_api_key_here
\`\`\`

Berdasarkan data yang tersedia, saya dapat membantu Anda dengan:
- Analisis clustering UMKM
- Rekomendasi pengembangan bisnis
- Analisis potensi area
- Insight dari data yang ditampilkan di peta

Silakan gunakan fitur-fitur yang tersedia di panel untuk mendapatkan analisis spesifik.
    `.trim();
  }
}

export default new KolosalAIService();
