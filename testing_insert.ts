import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('Testing insert into news...');
    const { data, error } = await supabase.from('news').insert([{
        title: 'Test News',
        content: 'This is a test',
        category: 'Actualités',
        published_at: new Date().toISOString()
    }]).select();

    if (error) {
        console.error('Insert error:', error.message, error.details, error.hint);
    } else {
        console.log('Insert success:', data);
    }
}

testInsert();
