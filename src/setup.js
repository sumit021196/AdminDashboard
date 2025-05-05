require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Debug logging
console.log('Current directory:', process.cwd());
console.log('Environment variables:', {
    SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Not set',
    SUPABASE_KEY: process.env.SUPABASE_KEY ? 'Set' : 'Not set',
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET ? 'Set' : 'Not set'
});

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} is not set in environment variables`);
        console.error(`Please check your .env file in: ${process.cwd()}`);
        process.exit(1);
    }
}

async function setupSupabase() {
    // Initialize Supabase client
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
    );

    try {
        const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'financial-results';
        console.log(`Using storage bucket: ${bucketName}`);

        // Create database table if it doesn't exist
        const { error: tableError } = await supabase.rpc('create_financial_results_table');
        if (tableError) {
            // If the RPC doesn't exist, create the table directly
            const { error: createTableError } = await supabase
                .from('financial_results')
                .select('*')
                .limit(1);

            if (createTableError) {
                const { error: sqlError } = await supabase
                    .sql`
                    CREATE TABLE IF NOT EXISTS financial_results (
                        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                        year integer NOT NULL,
                        quarter text NOT NULL,
                        pdf_url text NOT NULL,
                        website text NOT NULL,
                        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
                    );
                `;

                if (sqlError) throw sqlError;
                console.log('Created financial_results table');
            } else {
                console.log('financial_results table already exists');
            }
        }

        console.log('Setup completed successfully!');
        console.log('\nMake sure you have set up the following in your Supabase dashboard:');
        console.log('1. Storage bucket "financial-results" exists and is public');
        console.log('2. Storage policies allow public access for both SELECT and INSERT operations');
    } catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    }
}

setupSupabase(); 