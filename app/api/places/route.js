export async function GET(req) {
  const places = [
    { id: 1, name: 'Alun-Alun Kota', lat: -6.2, lng: 106.816 },
    { id: 2, name: 'Taman Kota', lat: -6.21, lng: 106.82 },
    { id: 3, name: 'Perpustakaan Daerah', lat: -6.205, lng: 106.81 },
  ];

  return new Response(JSON.stringify({ ok: true, data: places }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
