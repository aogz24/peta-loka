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
Sebagai konsultan UMKM, berikan analisis dan insight dari hasil clustering data berikut dalam format paragraf yang natural dan mudah dibaca. Jangan gunakan markdown formatting, bold, atau bullet points.

RINGKASAN DATA:
Total UMKM: ${summary.totalUMKM}
Total Wisata: ${summary.totalWisata}
Total Tempat Pelatihan: ${summary.totalPelatihan}
Jumlah Cluster: ${summary.totalClusters}

UMKM PER CLUSTER:
${umkm.analysis
  .map(
    (cluster, i) => `
Cluster ${i + 1}:
Lokasi: [${cluster.center.lat.toFixed(4)}, ${cluster.center.lon.toFixed(4)}]
Total UMKM: ${cluster.totalUMKM}
Kategori Dominan: ${cluster.dominantCategory}
Distribusi Kategori: ${JSON.stringify(cluster.categories)}
`
  )
  .join("\n")}

WISATA PER CLUSTER:
${wisata.analysis
  .map(
    (cluster, i) => `
Cluster ${i + 1}:
Total Wisata: ${cluster.totalWisata}
Potensi: ${cluster.potensi}
Kategori: ${JSON.stringify(cluster.categories)}
`
  )
  .join("\n")}

Berikan analisis dalam format cerita yang mencakup:
1. Insight utama dari pola clustering
2. Rekomendasi strategis untuk pengembangan UMKM
3. Potensi kolaborasi antar cluster
4. Prioritas pelatihan yang dibutuhkan
5. Peluang pengembangan wisata dan produk lokal

Tulis dalam bahasa yang santai dan mudah dipahami, seolah sedang berbicara langsung dengan pelaku UMKM.
`;

    try {
      const response = await this.kolosal.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah konsultan ahli pengembangan UMKM dan ekonomi lokal. Berikan analisis dalam bahasa yang santai, natural, dan mudah dipahami seperti sedang berbicara dengan teman. Jangan gunakan format markdown, bold, italic, atau bullet points. Tulis dalam paragraf yang mengalir.",
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
Berikan rekomendasi pengembangan bisnis untuk UMKM berikut dalam format cerita yang natural:

DATA UMKM:
Nama: ${umkmData.name}
Kategori: ${umkmData.category}
Lokasi: ${umkmData.address || "Tidak tersedia"}

KONTEKS CLUSTER:
Cluster ID: ${clusterInfo.clusterId}
Kategori Dominan di Area: ${clusterInfo.dominantCategory}
Total UMKM di Area: ${clusterInfo.totalItems}

WISATA TERDEKAT:
${nearbyWisata
  .slice(0, 3)
  .map((w) => `${w.name} (${w.category})`)
  .join("\n")}

Berikan rekomendasi yang mencakup:
1. Strategi pemasaran berdasarkan lokasi
2. Peluang kolaborasi dengan wisata terdekat
3. Produk atau layanan yang bisa dikembangkan
4. Tips meningkatkan daya saing di cluster

Tulis seperti sedang memberikan saran kepada teman, tanpa menggunakan markdown, bold, atau bullet points.
`;

    try {
      const response = await this.kolosal.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah konsultan bisnis untuk UMKM. Berikan saran praktis dalam bahasa yang santai dan mudah dipahami, seperti sedang berbicara dengan pelaku UMKM secara langsung. Hindari format markdown dan tulis dalam paragraf yang mengalir.",
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
Analisis potensi area untuk pengembangan UMKM dengan data berikut, tulis dalam format cerita yang natural:

${
  location
    ? `LOKASI:
Latitude: ${location.latitude}
Longitude: ${location.longitude}
Radius: ${location.radius} meter

`
    : ""
}DATA AREA:
Jumlah UMKM: ${umkmCount}
Jumlah Wisata: ${wisataCount}
Kategori UMKM: ${JSON.stringify(categories)}
Pelatihan Terdekat: ${
      nearestTraining && nearestTraining.length > 0
        ? nearestTraining
            .map((t) => `${t.name} (${t.distance.toFixed(2)} km)`)
            .join(", ")
        : "Tidak ada data pelatihan terdekat"
    }

Berikan analisis yang mencakup:
1. Rating potensi area (1-10) dengan penjelasan
2. Kategori bisnis yang paling cocok
3. Gap atau peluang yang belum terisi
4. Tantangan yang mungkin dihadapi
5. Rekomendasi aksi untuk pengembangan area

Tulis dalam bahasa yang santai dan mudah dipahami, tanpa menggunakan markdown formatting, bold, atau bullet points. Sampaikan seperti sedang memberikan konsultasi langsung.
`;

    try {
      const response = await this.kolosal.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah analis pengembangan area yang ahli dalam mengidentifikasi peluang bisnis lokal. Berikan analisis dalam bahasa yang santai dan mudah dipahami, seperti sedang konsultasi langsung. Hindari markdown formatting dan tulis dalam paragraf yang natural.",
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
            content: `Anda adalah asisten PetaLoka yang membantu UMKM mendapat insight dari data. Berikan jawaban dalam bahasa yang santai dan natural, seperti sedang berbicara dengan teman. Hindari markdown formatting dan gunakan paragraf yang mengalir.
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
    return `Analisis Clustering UMKM (Mode Demo)

Ringkasan Data
Total UMKM: ${summary.totalUMKM}
Total Wisata: ${summary.totalWisata}
Total Tempat Pelatihan: ${summary.totalPelatihan}
Jumlah Cluster: ${summary.totalClusters}

Insight Utama

Berdasarkan data yang ada, kita bisa melihat bahwa UMKM tersebar di ${summary.totalClusters} cluster utama. Ini menunjukkan pola distribusi yang cukup terorganisir di wilayah tersebut. Dengan ${summary.totalWisata} wisata yang tersedia, ada peluang bagus untuk meningkatkan kunjungan pelanggan ke UMKM yang lokasinya strategis.

Rekomendasi Strategis

Untuk pengembangan ke depan, fokus bisa diarahkan pada penguatan cluster yang sudah memiliki kategori dominan. Manfaatkan wisata yang ada untuk menarik lebih banyak pengunjung. Koordinasi dengan tempat pelatihan juga penting, karena ada ${summary.totalPelatihan} lokasi yang bisa dimanfaatkan untuk meningkatkan skill pelaku UMKM.

Catatan: Ini adalah analisis demo. Untuk insight yang lebih mendalam dan personal, silakan konfigurasi Kolosal AI API key di pengaturan.`;
  }

  generateDummyUMKMRecommendation(umkmData, clusterInfo, nearbyWisata) {
    return `Rekomendasi untuk ${umkmData.name} (Mode Demo)

Profil UMKM
Kategori: ${umkmData.category}
Area Cluster: ${clusterInfo.clusterId}
Kategori Dominan Area: ${clusterInfo.dominantCategory}

Strategi Pemasaran

Lokasi Anda cukup strategis di cluster dengan ${
      clusterInfo.totalItems
    } UMKM lainnya. Ini bisa jadi keuntungan karena area ini sudah punya traffic pengunjung. Coba manfaatkan kolaborasi dengan ${
      nearbyWisata.length > 0 ? nearbyWisata[0].name : "wisata terdekat"
    } untuk menarik lebih banyak pelanggan.

Untuk ${
      umkmData.category
    }, fokus pada diferensiasi produk adalah kunci. Tawarkan sesuatu yang unik atau kualitas yang lebih baik dibanding kompetitor di area yang sama.

Peluang Kolaborasi

Ada beberapa hal yang bisa dicoba: pertama, bikin paket bundling dengan wisata terdekat. Kedua, coba joint promotion dengan UMKM sejenis di cluster ini. Ketiga, manfaatkan event-event wisata untuk meningkatkan exposure bisnis Anda.

Catatan: Ini adalah rekomendasi demo. Untuk analisis yang lebih personal dan mendalam, silakan konfigurasi Kolosal AI API key di pengaturan.`;
  }

  generateDummyAreaPotential(areaData) {
    const { umkmCount, wisataCount, categories, nearestTraining, location } =
      areaData;
    const rating = Math.min(
      10,
      Math.max(1, Math.round((umkmCount + wisataCount) / 10))
    );

    return `Analisis Potensi Area (Mode Demo)

${
  location
    ? `Lokasi Analisis
Latitude: ${location.latitude.toFixed(6)}
Longitude: ${location.longitude.toFixed(6)}
Radius: ${(location.radius / 1000).toFixed(1)} km

`
    : ""
}Statistik Area
Jumlah UMKM: ${umkmCount}
Jumlah Wisata: ${wisataCount}
Rating Potensi: ${rating}/10

Kategori Bisnis
${
  categories
    ? Object.entries(categories)
        .map(([cat, count]) => `${cat}: ${count}`)
        .join("\n")
    : "Data kategori tidak tersedia"
}

Pelatihan Terdekat
${
  nearestTraining && nearestTraining.length > 0
    ? nearestTraining
        .map((t) => `${t.name} (${t.distance.toFixed(2)} km)`)
        .join("\n")
    : "Belum ada data pelatihan terdekat"
}

Gap dan Peluang

Area ini menunjukkan aktivitas ekonomi yang cukup aktif dengan ${umkmCount} UMKM yang sudah beroperasi. Potensi wisata juga ada, terlihat dari ${wisataCount} wisata mikro yang tersedia. Ini membuka peluang untuk kolaborasi antar sektor yang masih bisa dikembangkan lebih jauh.

Rekomendasi Aksi

Beberapa langkah yang bisa diambil: pertama, tingkatkan kualitas produk dari UMKM yang sudah ada. Kedua, kembangkan paket wisata yang terintegrasi dengan bisnis lokal. Ketiga, manfaatkan program pelatihan untuk upgrade skill pelaku usaha.

Catatan: Ini adalah analisis demo. Untuk insight yang lebih mendalam dan akurat, silakan konfigurasi Kolosal AI API key di pengaturan.`;
  }

  generateDummyChat(userQuery, contextData) {
    return `Terima kasih atas pertanyaan Anda: "${userQuery}"

Saat ini mode demo sedang aktif. Untuk mendapatkan analisis AI yang lebih mendalam dan personal, silakan konfigurasi Kolosal AI API key di file .env:

KOLOSAL_API_KEY=your_api_key_here

Berdasarkan data yang tersedia, saya bisa membantu Anda dengan beberapa hal:

Analisis clustering UMKM untuk melihat pola distribusi bisnis di wilayah tertentu.
Rekomendasi pengembangan bisnis berdasarkan lokasi dan kategori UMKM.
Analisis potensi area untuk ekspansi atau membuka bisnis baru.
Insight dari data yang ditampilkan di peta interaktif.

Silakan gunakan fitur-fitur yang tersedia di panel untuk mendapatkan analisis yang lebih spesifik sesuai kebutuhan Anda.`;
  }
}

export default new KolosalAIService();
