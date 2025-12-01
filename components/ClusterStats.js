"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export default function ClusterStats({ clusteringData }) {
  if (!clusteringData || !clusteringData.produkUnggulan) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500">No clustering data available</p>
      </div>
    );
  }

  const { produkUnggulan, wisataMikro, summary } = clusteringData;

  // Prepare data untuk chart
  const clusterData = produkUnggulan.analysis.map((cluster, index) => ({
    name: `Cluster ${index + 1}`,
    umkm: cluster.totalItems,
    kategori: cluster.dominantCategory,
  }));

  const wisataPotensiData = wisataMikro.analysis.map((cluster, index) => ({
    name: `Area ${index + 1}`,
    total: cluster.totalWisata,
    potensi: cluster.potensi,
  }));

  // Aggregate categories
  const categoryData = {};
  produkUnggulan.analysis.forEach((cluster) => {
    Object.entries(cluster.categories).forEach(([cat, count]) => {
      categoryData[cat] = (categoryData[cat] || 0) + count;
    });
  });

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total UMKM</p>
          <p className="text-3xl font-bold">{summary.totalUMKM}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Wisata Mikro</p>
          <p className="text-3xl font-bold">{summary.totalWisata}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Tempat Pelatihan</p>
          <p className="text-3xl font-bold">{summary.totalPelatihan}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Total Cluster</p>
          <p className="text-3xl font-bold">{summary.totalClusters}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UMKM per Cluster */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            UMKM per Cluster
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clusterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="umkm" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Kategori Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Distribusi Kategori UMKM
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cluster Details */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Detail Cluster</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cluster
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total UMKM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori Dominan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produkUnggulan.analysis.map((cluster, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Cluster {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cluster.totalItems}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cluster.dominantCategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    [{cluster.center.lat.toFixed(4)},{" "}
                    {cluster.center.lon.toFixed(4)}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wisata Potensi */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Potensi Wisata Mikro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wisataMikro.analysis.map((cluster, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-gray-800">Area {index + 1}</h4>
              <p className="text-sm text-gray-600 mt-1">
                Total Wisata: {cluster.totalWisata}
              </p>
              <p className="text-sm mt-1">
                Potensi:
                <span
                  className={`ml-2 font-semibold ${
                    cluster.potensi === "Sangat Tinggi"
                      ? "text-green-600"
                      : cluster.potensi === "Tinggi"
                      ? "text-blue-600"
                      : cluster.potensi === "Sedang"
                      ? "text-amber-600"
                      : "text-gray-600"
                  }`}
                >
                  {cluster.potensi}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
