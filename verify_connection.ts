import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  const tables = [
    'news',
    'programmes',
    'lessons',
    'contact_messages',
    'comments',
    'widgets',
    'radio_config',
    'newsletter_subscriptions'
  ];

  console.log('🚀 Starting Supabase Connection Verification...\n');
  console.log(`URL: ${supabaseUrl}`);

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Table "${table}": Error - ${error.message}`);
      } else {
        console.log(`✅ Table "${table}": Connected (Count: ${count ?? 'N/A'})`);
      }
    } catch (err: any) {
      console.error(`❌ Table "${table}": Unexpected Error - ${err.message}`);
    }
  }

  // Check Storage
  try {
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error(`❌ Storage Buckets: Error - ${bucketError.message}`);
    } else {
      const mediaBucket = buckets.find(b => b.name === 'media');
      if (mediaBucket) {
        console.log('✅ Storage Bucket "media": Found');
      } else {
        console.log('⚠️ Storage Bucket "media": Not Found');
      }
    }
  } catch (err: any) {
    console.error(`❌ Storage: Unexpected Error - ${err.message}`);
  }

  console.log('\n🏁 Verification Complete.');
}

verifyTables();
