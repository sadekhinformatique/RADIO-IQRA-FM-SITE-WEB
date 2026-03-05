import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
// We need the service role key to reliably create buckets, 
// using anon key might fail depending on RLS policies, but we'll try with anon key
// since we only have anon key in .env. We'll at least do the radio_config.
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const primaryUrl = 'https://radioiqrabf-1.ice.infomaniak.ch/radioiqra-bf-128.mp3';
const fallbackUrl = 'https://radioiqrabf-1.radiohls.infomaniak.com/radioiqrabf-1/manifest.m3u8';

async function updateConfig() {
    console.log('🚀 Starting Database Update...\n');

    // 1. Update radio_config
    try {
        // Check if a config exists
        const { data: existing, error: fetchError } = await supabase
            .from('radio_config')
            .select('*')
            .limit(1);

        if (fetchError) {
            console.error('❌ Error fetching radio_config:', fetchError.message);
        } else {
            let result;
            if (existing && existing.length > 0) {
                console.log('Updating existing radio configuration...');
                result = await supabase
                    .from('radio_config')
                    .update({
                        primary_stream_url: primaryUrl,
                        fallback_stream_url: fallbackUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing[0].id)
                    .select();
            } else {
                console.log('Inserting new radio configuration...');
                result = await supabase
                    .from('radio_config')
                    .insert([{
                        primary_stream_url: primaryUrl,
                        fallback_stream_url: fallbackUrl,
                        audio_playlist: [],
                        video_playlist: []
                    }])
                    .select();
            }

            if (result.error) {
                console.error('❌ Error updating radio_config:', result.error.message);
            } else {
                console.log('✅ Successfully updated radio configuration.');
                console.dir(result.data, { depth: null });
            }
        }
    } catch (err: any) {
        console.error('❌ Unexpected Error during radio_config update:', err.message);
    }

    // 2. Try to create 'media' bucket
    try {
        console.log('\nAttempting to create media bucket...');
        const { data, error } = await supabase.storage.createBucket('media', {
            public: true,
            allowedMimeTypes: ['image/*'],
            fileSizeLimit: 10485760 // 10MB
        });

        if (error) {
            // If it already exists, error might say so, otherwise might be permission denied with anon key
            if (error.message.includes('already exists')) {
                console.log('✅ Media bucket already exists.');
            } else {
                console.error('⚠️ Could not create media bucket (this is normal if using anon key, needs service_role key or manual dashboard creation):', error.message);
            }
        } else {
            console.log('✅ Successfully created media bucket.');
        }
    } catch (err: any) {
        console.error('⚠️ Unexpected Error during bucket creation:', err.message);
    }

    console.log('\n🏁 Update Script Complete.');
}

updateConfig();
