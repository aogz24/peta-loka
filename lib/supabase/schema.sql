-- Create pelatihan table
CREATE TABLE IF NOT EXISTS pelatihan (
  id BIGINT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT,
  category TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  opening_hours TEXT,
  description TEXT,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create umkm table
CREATE TABLE IF NOT EXISTS umkm (
  id BIGINT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT,
  category TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  opening_hours TEXT,
  description TEXT,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wisata table
CREATE TABLE IF NOT EXISTS wisata (
  id BIGINT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT,
  category TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  opening_hours TEXT,
  description TEXT,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pelatihan_type ON pelatihan(type);
CREATE INDEX IF NOT EXISTS idx_pelatihan_category ON pelatihan(category);
CREATE INDEX IF NOT EXISTS idx_pelatihan_location ON pelatihan(lat, lon);

CREATE INDEX IF NOT EXISTS idx_umkm_type ON umkm(type);
CREATE INDEX IF NOT EXISTS idx_umkm_category ON umkm(category);
CREATE INDEX IF NOT EXISTS idx_umkm_location ON umkm(lat, lon);

CREATE INDEX IF NOT EXISTS idx_wisata_type ON wisata(type);
CREATE INDEX IF NOT EXISTS idx_wisata_category ON wisata(category);
CREATE INDEX IF NOT EXISTS idx_wisata_location ON wisata(lat, lon);

-- Enable Row Level Security (RLS)
ALTER TABLE pelatihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisata ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON pelatihan FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON umkm FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON wisata FOR SELECT USING (true);
