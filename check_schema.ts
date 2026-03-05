import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const tables = ['news', 'programmes', 'lessons', 'widgets', 'radio_config', 'contact_messages', 'comments'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.log(`Table ${table} error:`, error.message);
        } else {
            if (data && data.length > 0) {
                console.log(`Table ${table} columns:`, Object.keys(data[0]).join(', '));
            } else {
                // We can't see the columns if row is empty, but we can do a trick:
                // try inserting an empty object and catch the error, or since we are generic, we can't easily.
                console.log(`Table ${table} has 0 rows, can't easily deduce columns with anon key without introspection.`);
            }
        }
    }
}

checkSchema();
