import os
import json
import requests
import random

# Output folder
OUTPUT_DIR = "lib/data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# OSM Overpass API
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
CITY = "Kota Bandung"   # Bisa kamu ubah

# ---------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------

def fetch_osm(query):
    """Mengirim query Overpass dan mengembalikan JSON."""
    r = requests.post(OVERPASS_URL, data={"data": query})
    r.raise_for_status()
    return r.json()


def generate_address():
    streets = [
        "Merdeka", "Sudirman", "Diponegoro", "Ahmad Yani",
        "Gatot Subroto", "Veteran", "Pemuda", "Pahlawan",
        "Soekarno Hatta", "Asia Afrika", "Braga"
    ]
    return f"Jl. {random.choice(streets)} No. {random.randint(1, 200)}"


def normalize_item(item, index, type_name, category_key):
    tags = item.get("tags", {})
    lat = item.get("lat") or item.get("center", {}).get("lat")
    lon = item.get("lon") or item.get("center", {}).get("lon")

    # Jika objek tidak punya koordinat
    if not lat or not lon:
        return None

    category_value = tags.get(category_key, "general")

    return {
        "id": f"{type_name}-{index+1}",
        "type": type_name,
        "name": tags.get("name", f"{type_name.title()} {index+1}"),
        "category": category_value,
        "lat": lat,
        "lon": lon,
        "address": generate_address(),
        "phone": f"+62{random.randint(800000000, 999999999)}",
        "website": "",
        "openingHours": "08:00-20:00",
        "description": f"Data hasil scraping {type_name} dari OpenStreetMap",
        "tags": tags
    }


def scrape_and_save(filename, tag_query, type_name, cat_key):
    print(f"🚀 Scraping {type_name} ...")

    query = f"""
    [out:json];
    area["name"="{CITY}"]->.area;
    (
      node{tag_query}(area.area);
      way{tag_query}(area.area);
      relation{tag_query}(area.area);
    );
    out center;
    """

    data = fetch_osm(query)

    results = []
    for i, el in enumerate(data.get("elements", [])):
        normalized = normalize_item(el, i, type_name, cat_key)
        if normalized:
            results.append(normalized)

    path = f"{OUTPUT_DIR}/{filename}"
    json.dump(results, open(path, "w", encoding="utf8"), ensure_ascii=False, indent=2)
    print(f"✅ {len(results)} data disimpan ke {path}\n")


def scrape_pelatihan():
    print("🚀 Scraping pelatihan ...")

    query = f"""
    [out:json];
    area["name"="{CITY}"]->.area;

    (
      node["amenity"="training"](area.area);
      way["amenity"="training"](area.area);
      relation["amenity"="training"](area.area);

      node["amenity"="school"](area.area);
      way["amenity"="school"](area.area);
      relation["amenity"="school"](area.area);

      node["amenity"="college"](area.area);
      way["amenity"="college"](area.area);
      relation["amenity"="college"](area.area);

      node["amenity"="community_centre"](area.area);
      way["amenity"="community_centre"](area.area);
      relation["amenity"="community_centre"](area.area);

      node["amenity"="workshop"](area.area);
      way["amenity"="workshop"](area.area);
      relation["amenity"="workshop"](area.area);
    );

    out center;
    """

    data = fetch_osm(query)

    results = []
    for i, el in enumerate(data.get("elements", [])):
        normalized = normalize_item(el, i, "pelatihan", "amenity")
        if normalized:
            results.append(normalized)

    path = f"{OUTPUT_DIR}/pelatihan.json"
    json.dump(results, open(path, "w", encoding="utf8"), ensure_ascii=False, indent=2)

    print(f"✅ {len(results)} data disimpan ke {path}\n")


# ---------------------------------------------------------
# Main Execution
# ---------------------------------------------------------

if __name__ == "__main__":
    scrape_and_save("umkm.json", '["shop"]', "umkm", "shop")
    scrape_and_save("wisata.json", '["tourism"]', "wisata", "tourism")
    scrape_pelatihan()

    print("🎉 Semua scraping selesai!")