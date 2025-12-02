'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ClusterLocationButton from './ClusterLocationButton';
import { useState } from 'react';
import MapCard from './MapCard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function ClusterStats({ clusteringData }) {
  const [activeCluster, setActiveCluster] = useState(null);

  if (!clusteringData || !clusteringData.umkm) {
    return (
      <div className="glass-card p-6">
        <p className="text-zinc-600 dark:text-zinc-300">No clustering data available</p>
      </div>
    );
  }

  const { umkm, wisata, summary } = clusteringData;

  // Prepare data untuk chart
  const clusterData = umkm.analysis.map((cluster, index) => ({
    name: `Cluster ${index + 1}`,
    umkm: cluster.totalItems,
    kategori: cluster.dominantCategory,
  }));

  const wisataPotensiData = wisata.analysis.map((cluster, index) => ({
    name: `Area ${index + 1}`,
    total: cluster.totalWisata,
    potensi: cluster.potensi,
  }));

  // Aggregate categories
  const categoryData = {};
  umkm.analysis.forEach((cluster) => {
    Object.entries(cluster.categories).forEach(([cat, count]) => {
      categoryData[cat] = (categoryData[cat] || 0) + count;
    });
  });

  const top10Categories = Object.entries(categoryData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('Top 10 Categories:', top10Categories);

  const pieData = top10Categories.map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card flex flex-col p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-300">Total UMKM</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{summary.totalUMKM}</div>
        </div>
        <div className="glass-card flex flex-col p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-300">Wisata Mikro</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{summary.totalWisata}</div>
        </div>
        <div className="glass-card flex flex-col p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-300">Tempat Pelatihan</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{summary.totalPelatihan}</div>
        </div>
        <div className="glass-card flex flex-col p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-300">Total Cluster</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{summary.totalClusters}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UMKM per Cluster */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">UMKM per Cluster</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
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
        </div>

        {/* Kategori Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">10 Teratas Distribusi Kategori UMKM</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cluster Details */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Detail Cluster</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg overflow-hidden">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Cluster</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Total UMKM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Kategori Dominan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {umkm.analysis.map((cluster, index) => (
                <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-50">Cluster {index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">{cluster.totalItems}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">{cluster.dominantCategory}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                    <ClusterLocationButton key={index} onClick={() => setActiveCluster({ lat: cluster.center.lat, lon: cluster.center.lon, index: index })} className="inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {activeCluster && <MapCard lat={activeCluster.lat} lon={activeCluster.lon} onClose={() => setActiveCluster(null)} index={activeCluster.index} />}

      {/* Wisata Potensi */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Potensi Wisata</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wisata.analysis.map((cluster, index) => (
            <div key={index} className="p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">Area {index + 1}</h4>
                <span className={`text-xs font-semibold ${cluster.potensi === 'Sangat Tinggi' ? 'text-green-600' : cluster.potensi === 'Tinggi' ? 'text-blue-600' : cluster.potensi === 'Sedang' ? 'text-amber-600' : 'text-zinc-600'}`}>
                  {cluster.potensi}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                Total Wisata: <span className="font-medium">{cluster.totalWisata}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
