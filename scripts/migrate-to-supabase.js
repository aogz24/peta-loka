/**
 * Migration script to upload JSON data to Supabase
 * 
 * Usage:
 * 1. Make sure you have set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * 2. Run: node scripts/migrate-to-supabase.js
 * 
 * Options:
 * - node scripts/migrate-to-supabase.js --table=pelatihan (migrate only pelatihan)
 * - node scripts/migrate-to-supabase.js --table=umkm (migrate only umkm)
 * - node scripts/migrate-to-supabase.js --table=wisata (migrate only wisata)
 * - node scripts/migrate-to-supabase.js --batch-size=100 (change batch size, default 1000)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Parse command line arguments
const args = process.argv.slice(2);
const tableArg = args.find(arg => arg.startsWith('--table='));
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));

const targetTable = tableArg ? tableArg.split('=')[1] : null;
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 1000;

// Data files configuration
const dataFiles = {
  pelatihan: path.join(__dirname, '..', 'lib', 'data', 'pelatihan.json'),
  umkm: path.join(__dirname, '..', 'lib', 'data', 'umkm.json'),
  wisata: path.join(__dirname, '..', 'lib', 'data', 'wisata.json'),
};

// Transform data to match database schema
function transformData(item) {
  return {
    id: item.id,
    type: item.type,
    name: item.name || null,
    category: item.category || null,
    lat: item.lat,
    lon: item.lon,
    address: item.address || null,
    phone: item.phone || null,
    website: item.website || null,
    opening_hours: item.openingHours || null,
    description: item.description || null,
    tags: item.tags || null,
  };
}

// Upload data in batches
async function uploadData(tableName, data) {
  console.log(`\n📤 Uploading ${data.length} records to ${tableName}...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process in batches
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const transformedBatch = batch.map(transformData);
    
    try {
      const { data: insertedData, error } = await supabase
        .from(tableName)
        .upsert(transformedBatch, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Error uploading batch ${i / batchSize + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        const progress = Math.min(((i + batchSize) / data.length) * 100, 100).toFixed(1);
        console.log(`✅ Progress: ${progress}% (${successCount}/${data.length})`);
      }
    } catch (err) {
      console.error(`❌ Exception during batch upload:`, err.message);
      errorCount += batch.length;
    }
  }
  
  console.log(`\n📊 Upload Summary for ${tableName}:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📈 Total: ${data.length}`);
  
  return { successCount, errorCount };
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting migration to Supabase...');
  console.log(`   Batch size: ${batchSize}`);
  
  const tables = targetTable ? [targetTable] : Object.keys(dataFiles);
  
  for (const tableName of tables) {
    try {
      console.log(`\n📂 Processing ${tableName}...`);
      
      const filePath = dataFiles[tableName];
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        continue;
      }
      
      const rawData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(rawData);
      
      console.log(`   📄 Loaded ${data.length} records from JSON`);
      
      await uploadData(tableName, data);
      
    } catch (error) {
      console.error(`❌ Error processing ${tableName}:`, error.message);
    }
  }
  
  console.log('\n✨ Migration completed!');
}

// Run migration
migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
